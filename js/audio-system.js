// ============================================
// ADVANCED AUDIO SYSTEM
// ============================================
// Production-grade audio system with spatial sound,
// dynamic music, ambient soundscapes, and audio pooling

const AudioSystem = (function() {
    'use strict';

    // ============= CONFIGURATION =============
    const CONFIG = {
        MASTER_VOLUME: 0.7,
        MUSIC_VOLUME: 0.5,
        SFX_VOLUME: 0.8,
        AMBIENT_VOLUME: 0.4,

        // Spatial audio settings
        SPATIAL_FALLOFF_START: 5,      // Distance where volume starts decreasing
        SPATIAL_FALLOFF_END: 25,       // Distance where volume reaches 0
        SPATIAL_PAN_FACTOR: 0.3,       // How much stereo panning based on position

        // Music transition settings
        CROSSFADE_DURATION: 2000,      // ms
        MUSIC_LAYERS_MAX: 4,

        // Audio pooling
        POOL_SIZE_PER_SOUND: 5,        // Max concurrent instances per sound

        // Update intervals
        AMBIENT_UPDATE_INTERVAL: 100,  // ms
        MUSIC_UPDATE_INTERVAL: 500     // ms
    };

    // ============= STATE =============
    let audioContext = null;
    let masterGain = null;
    let musicGain = null;
    let sfxGain = null;
    let ambientGain = null;

    let initialized = false;
    let suspended = true;

    // Sound pools for efficient reuse
    const soundPools = new Map();

    // Currently playing sounds
    const activeSounds = new Set();
    const activeAmbient = new Map();

    // Music state
    const musicState = {
        currentTrack: null,
        nextTrack: null,
        layers: [],
        intensity: 0,          // 0-1, affects which layers play
        crossfading: false,
        fadeTimer: null
    };

    // Ambient state
    const ambientState = {
        currentBiome: null,
        timeOfDay: 'day',
        weather: 'clear',
        sources: new Map()
    };

    // ============= SOUND DEFINITIONS =============
    const SOUNDS = {
        // === Player Actions ===
        player_attack: {
            category: 'sfx',
            volume: 0.6,
            pitchVariation: 0.1,
            frequencies: [200, 400, 300],
            duration: 0.15,
            type: 'sweep'
        },
        player_hit: {
            category: 'sfx',
            volume: 0.7,
            pitchVariation: 0.05,
            frequencies: [150, 100],
            duration: 0.2,
            type: 'impact'
        },
        player_footstep: {
            category: 'sfx',
            volume: 0.25,
            pitchVariation: 0.15,
            frequencies: [80, 60],
            duration: 0.08,
            type: 'noise'
        },
        player_harvest: {
            category: 'sfx',
            volume: 0.5,
            pitchVariation: 0.1,
            frequencies: [300, 200, 250],
            duration: 0.2,
            type: 'chop'
        },
        player_levelup: {
            category: 'sfx',
            volume: 0.8,
            frequencies: [400, 500, 600, 800],
            duration: 0.6,
            type: 'fanfare'
        },
        player_heal: {
            category: 'sfx',
            volume: 0.5,
            frequencies: [400, 600, 800],
            duration: 0.4,
            type: 'shimmer'
        },

        // === Combat ===
        zombie_attack: {
            category: 'sfx',
            volume: 0.5,
            pitchVariation: 0.2,
            frequencies: [100, 80, 60],
            duration: 0.25,
            type: 'growl'
        },
        zombie_hit: {
            category: 'sfx',
            volume: 0.6,
            pitchVariation: 0.1,
            frequencies: [200, 150],
            duration: 0.15,
            type: 'impact'
        },
        zombie_death: {
            category: 'sfx',
            volume: 0.7,
            pitchVariation: 0.15,
            frequencies: [150, 100, 50],
            duration: 0.4,
            type: 'death'
        },
        explosion: {
            category: 'sfx',
            volume: 0.9,
            frequencies: [60, 40, 20],
            duration: 0.6,
            type: 'explosion'
        },
        tower_shoot: {
            category: 'sfx',
            volume: 0.5,
            pitchVariation: 0.05,
            frequencies: [800, 600],
            duration: 0.1,
            type: 'projectile'
        },
        cannon_fire: {
            category: 'sfx',
            volume: 0.8,
            frequencies: [100, 60, 40],
            duration: 0.4,
            type: 'cannon'
        },

        // === Building ===
        build_place: {
            category: 'sfx',
            volume: 0.6,
            frequencies: [200, 300, 250],
            duration: 0.2,
            type: 'place'
        },
        build_upgrade: {
            category: 'sfx',
            volume: 0.7,
            frequencies: [300, 400, 500, 600],
            duration: 0.4,
            type: 'upgrade'
        },
        build_destroy: {
            category: 'sfx',
            volume: 0.6,
            frequencies: [150, 100, 60],
            duration: 0.3,
            type: 'crash'
        },

        // === UI ===
        ui_click: {
            category: 'sfx',
            volume: 0.3,
            frequencies: [600, 800],
            duration: 0.05,
            type: 'click'
        },
        ui_open: {
            category: 'sfx',
            volume: 0.35,
            frequencies: [400, 600],
            duration: 0.1,
            type: 'swoosh'
        },
        ui_close: {
            category: 'sfx',
            volume: 0.3,
            frequencies: [500, 300],
            duration: 0.1,
            type: 'swoosh'
        },
        notification: {
            category: 'sfx',
            volume: 0.4,
            frequencies: [600, 800, 600],
            duration: 0.2,
            type: 'bell'
        },
        achievement: {
            category: 'sfx',
            volume: 0.7,
            frequencies: [523, 659, 784, 1047],
            duration: 0.8,
            type: 'fanfare'
        },
        quest_complete: {
            category: 'sfx',
            volume: 0.7,
            frequencies: [392, 494, 587, 784],
            duration: 0.6,
            type: 'fanfare'
        },

        // === Environment ===
        campfire_crackle: {
            category: 'ambient',
            volume: 0.4,
            frequencies: [200, 100, 50],
            duration: 0.3,
            type: 'crackle',
            loop: true
        },
        water_flow: {
            category: 'ambient',
            volume: 0.3,
            frequencies: [400, 200, 100],
            duration: 1.0,
            type: 'water',
            loop: true
        },
        wind_light: {
            category: 'ambient',
            volume: 0.2,
            frequencies: [100, 50],
            duration: 2.0,
            type: 'wind',
            loop: true
        },
        wind_heavy: {
            category: 'ambient',
            volume: 0.4,
            frequencies: [150, 80, 40],
            duration: 1.5,
            type: 'wind',
            loop: true
        },
        rain_light: {
            category: 'ambient',
            volume: 0.3,
            frequencies: [2000, 4000],
            duration: 0.5,
            type: 'rain',
            loop: true
        },
        rain_heavy: {
            category: 'ambient',
            volume: 0.5,
            frequencies: [1500, 3000, 5000],
            duration: 0.3,
            type: 'rain',
            loop: true
        },
        thunder: {
            category: 'sfx',
            volume: 0.9,
            frequencies: [60, 40, 20, 10],
            duration: 1.5,
            type: 'thunder'
        },

        // === Alerts ===
        horde_warning: {
            category: 'sfx',
            volume: 0.8,
            frequencies: [200, 150, 200, 150],
            duration: 1.0,
            type: 'alarm'
        },
        boss_spawn: {
            category: 'sfx',
            volume: 0.9,
            frequencies: [100, 80, 60, 100],
            duration: 1.5,
            type: 'ominous'
        },
        night_start: {
            category: 'sfx',
            volume: 0.6,
            frequencies: [200, 150, 100],
            duration: 0.8,
            type: 'transition'
        },
        day_start: {
            category: 'sfx',
            volume: 0.6,
            frequencies: [300, 400, 500],
            duration: 0.8,
            type: 'transition'
        }
    };

    // ============= MUSIC DEFINITIONS =============
    const MUSIC_TRACKS = {
        peaceful_day: {
            tempo: 80,
            key: 'C',
            mood: 'peaceful',
            layers: [
                { name: 'melody', volume: 0.3, threshold: 0 },
                { name: 'harmony', volume: 0.2, threshold: 0.3 },
                { name: 'bass', volume: 0.25, threshold: 0 },
                { name: 'percussion', volume: 0.15, threshold: 0.5 }
            ]
        },
        tense_night: {
            tempo: 100,
            key: 'Am',
            mood: 'tense',
            layers: [
                { name: 'drone', volume: 0.25, threshold: 0 },
                { name: 'melody', volume: 0.3, threshold: 0.2 },
                { name: 'bass', volume: 0.3, threshold: 0 },
                { name: 'percussion', volume: 0.25, threshold: 0.4 }
            ]
        },
        combat: {
            tempo: 140,
            key: 'Dm',
            mood: 'intense',
            layers: [
                { name: 'melody', volume: 0.35, threshold: 0 },
                { name: 'harmony', volume: 0.25, threshold: 0 },
                { name: 'bass', volume: 0.35, threshold: 0 },
                { name: 'percussion', volume: 0.4, threshold: 0 }
            ]
        },
        boss_fight: {
            tempo: 160,
            key: 'Em',
            mood: 'epic',
            layers: [
                { name: 'melody', volume: 0.4, threshold: 0 },
                { name: 'harmony', volume: 0.3, threshold: 0 },
                { name: 'bass', volume: 0.4, threshold: 0 },
                { name: 'percussion', volume: 0.5, threshold: 0 }
            ]
        },
        horde: {
            tempo: 150,
            key: 'Gm',
            mood: 'chaotic',
            layers: [
                { name: 'melody', volume: 0.35, threshold: 0 },
                { name: 'chaos', volume: 0.3, threshold: 0.3 },
                { name: 'bass', volume: 0.4, threshold: 0 },
                { name: 'percussion', volume: 0.45, threshold: 0 }
            ]
        }
    };

    // ============= AMBIENT SOUNDSCAPES =============
    const AMBIENT_SOUNDSCAPES = {
        jungle: {
            day: ['birds_chirp', 'insects_buzz', 'wind_light'],
            night: ['crickets', 'owl_hoot', 'wind_light']
        },
        desert: {
            day: ['wind_heavy', 'sand_shift'],
            night: ['wind_light', 'coyote_howl']
        },
        swamp: {
            day: ['frogs_croak', 'insects_buzz', 'water_bubbles'],
            night: ['frogs_croak', 'insects_loud', 'mysterious_sounds']
        },
        tundra: {
            day: ['wind_heavy', 'ice_crack'],
            night: ['wind_heavy', 'wolves_howl']
        },
        mountain: {
            day: ['wind_heavy', 'eagles_cry'],
            night: ['wind_light', 'distant_rumble']
        }
    };

    // ============= INITIALIZATION =============
    function initialize() {
        if (initialized) return true;

        try {
            // Create audio context
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContextClass();

            // Create master gain nodes
            masterGain = audioContext.createGain();
            masterGain.gain.value = CONFIG.MASTER_VOLUME;
            masterGain.connect(audioContext.destination);

            // Create category gain nodes
            musicGain = audioContext.createGain();
            musicGain.gain.value = CONFIG.MUSIC_VOLUME;
            musicGain.connect(masterGain);

            sfxGain = audioContext.createGain();
            sfxGain.gain.value = CONFIG.SFX_VOLUME;
            sfxGain.connect(masterGain);

            ambientGain = audioContext.createGain();
            ambientGain.gain.value = CONFIG.AMBIENT_VOLUME;
            ambientGain.connect(masterGain);

            // Initialize sound pools
            initializeSoundPools();

            initialized = true;
            suspended = audioContext.state === 'suspended';

            console.log('AudioSystem initialized');
            return true;
        } catch (e) {
            console.error('Failed to initialize AudioSystem:', e);
            return false;
        }
    }

    function resume() {
        if (!audioContext) return;

        if (audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                suspended = false;
                console.log('AudioContext resumed');
            });
        }
    }

    function initializeSoundPools() {
        // Pre-create pools for commonly used sounds
        for (const soundId of Object.keys(SOUNDS)) {
            soundPools.set(soundId, {
                available: [],
                inUse: new Set()
            });
        }
    }

    // ============= SOUND SYNTHESIS =============
    function synthesizeSound(soundDef, options = {}) {
        if (!audioContext || suspended) return null;

        const now = audioContext.currentTime;
        const startTime = options.startTime || now;

        // Create nodes
        const gainNode = audioContext.createGain();
        const panNode = audioContext.createStereoPanner();

        // Apply spatial audio if position provided
        if (options.position && typeof player !== 'undefined') {
            const spatialData = calculateSpatialAudio(options.position);
            panNode.pan.value = spatialData.pan;
            gainNode.gain.value = soundDef.volume * spatialData.volume;
        } else {
            gainNode.gain.value = soundDef.volume;
        }

        // Apply pitch variation
        const pitchMultiplier = 1 + (Math.random() - 0.5) * 2 * (soundDef.pitchVariation || 0);

        // Connect chain based on category
        let outputNode;
        switch (soundDef.category) {
            case 'music':
                outputNode = musicGain;
                break;
            case 'ambient':
                outputNode = ambientGain;
                break;
            default:
                outputNode = sfxGain;
        }

        panNode.connect(gainNode);
        gainNode.connect(outputNode);

        // Generate sound based on type
        const sourceNodes = [];

        switch (soundDef.type) {
            case 'sweep':
                sourceNodes.push(...createSweepSound(soundDef, pitchMultiplier, startTime, panNode));
                break;
            case 'impact':
                sourceNodes.push(...createImpactSound(soundDef, pitchMultiplier, startTime, panNode));
                break;
            case 'noise':
                sourceNodes.push(...createNoiseSound(soundDef, pitchMultiplier, startTime, panNode));
                break;
            case 'fanfare':
                sourceNodes.push(...createFanfareSound(soundDef, pitchMultiplier, startTime, panNode));
                break;
            case 'shimmer':
                sourceNodes.push(...createShimmerSound(soundDef, pitchMultiplier, startTime, panNode));
                break;
            case 'growl':
                sourceNodes.push(...createGrowlSound(soundDef, pitchMultiplier, startTime, panNode));
                break;
            case 'explosion':
                sourceNodes.push(...createExplosionSound(soundDef, pitchMultiplier, startTime, panNode));
                break;
            case 'projectile':
                sourceNodes.push(...createProjectileSound(soundDef, pitchMultiplier, startTime, panNode));
                break;
            case 'thunder':
                sourceNodes.push(...createThunderSound(soundDef, pitchMultiplier, startTime, panNode));
                break;
            case 'alarm':
                sourceNodes.push(...createAlarmSound(soundDef, pitchMultiplier, startTime, panNode));
                break;
            case 'ominous':
                sourceNodes.push(...createOminousSound(soundDef, pitchMultiplier, startTime, panNode));
                break;
            default:
                sourceNodes.push(...createBasicSound(soundDef, pitchMultiplier, startTime, panNode));
        }

        // Envelope
        const duration = soundDef.duration;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(soundDef.volume * (options.volumeMultiplier || 1), startTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

        return {
            gainNode,
            panNode,
            sourceNodes,
            duration,
            startTime
        };
    }

    function createBasicSound(soundDef, pitchMultiplier, startTime, destination) {
        const sources = [];
        const duration = soundDef.duration;

        soundDef.frequencies.forEach((freq, i) => {
            const osc = audioContext.createOscillator();
            const oscGain = audioContext.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq * pitchMultiplier;

            oscGain.gain.value = 1 / soundDef.frequencies.length;

            osc.connect(oscGain);
            oscGain.connect(destination);

            osc.start(startTime);
            osc.stop(startTime + duration);

            sources.push(osc);
        });

        return sources;
    }

    function createSweepSound(soundDef, pitchMultiplier, startTime, destination) {
        const sources = [];
        const duration = soundDef.duration;
        const freqs = soundDef.frequencies;

        const osc = audioContext.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freqs[0] * pitchMultiplier, startTime);

        freqs.forEach((freq, i) => {
            if (i > 0) {
                osc.frequency.linearRampToValueAtTime(
                    freq * pitchMultiplier,
                    startTime + (duration * i / freqs.length)
                );
            }
        });

        osc.connect(destination);
        osc.start(startTime);
        osc.stop(startTime + duration);

        sources.push(osc);
        return sources;
    }

    function createImpactSound(soundDef, pitchMultiplier, startTime, destination) {
        const sources = [];
        const duration = soundDef.duration;

        // Low thump
        const osc1 = audioContext.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(soundDef.frequencies[0] * pitchMultiplier, startTime);
        osc1.frequency.exponentialRampToValueAtTime(
            (soundDef.frequencies[1] || 50) * pitchMultiplier,
            startTime + duration
        );

        // Noise burst
        const noiseBuffer = createNoiseBuffer(duration);
        const noise = audioContext.createBufferSource();
        noise.buffer = noiseBuffer;

        const noiseGain = audioContext.createGain();
        noiseGain.gain.setValueAtTime(0.3, startTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, startTime + duration * 0.5);

        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;

        osc1.connect(destination);
        noise.connect(noiseGain);
        noiseGain.connect(filter);
        filter.connect(destination);

        osc1.start(startTime);
        osc1.stop(startTime + duration);
        noise.start(startTime);
        noise.stop(startTime + duration);

        sources.push(osc1, noise);
        return sources;
    }

    function createNoiseSound(soundDef, pitchMultiplier, startTime, destination) {
        const sources = [];
        const duration = soundDef.duration;

        const noiseBuffer = createNoiseBuffer(duration);
        const noise = audioContext.createBufferSource();
        noise.buffer = noiseBuffer;

        const filter = audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = soundDef.frequencies[0] * pitchMultiplier;
        filter.Q.value = 1;

        noise.connect(filter);
        filter.connect(destination);

        noise.start(startTime);
        noise.stop(startTime + duration);

        sources.push(noise);
        return sources;
    }

    function createFanfareSound(soundDef, pitchMultiplier, startTime, destination) {
        const sources = [];
        const duration = soundDef.duration;
        const freqs = soundDef.frequencies;
        const noteLength = duration / freqs.length;

        freqs.forEach((freq, i) => {
            const osc = audioContext.createOscillator();
            const oscGain = audioContext.createGain();

            osc.type = 'square';
            osc.frequency.value = freq * pitchMultiplier;

            const noteStart = startTime + (i * noteLength);
            oscGain.gain.setValueAtTime(0, noteStart);
            oscGain.gain.linearRampToValueAtTime(0.3, noteStart + 0.02);
            oscGain.gain.linearRampToValueAtTime(0.2, noteStart + noteLength * 0.5);
            oscGain.gain.linearRampToValueAtTime(0, noteStart + noteLength);

            osc.connect(oscGain);
            oscGain.connect(destination);

            osc.start(noteStart);
            osc.stop(noteStart + noteLength);

            sources.push(osc);
        });

        return sources;
    }

    function createShimmerSound(soundDef, pitchMultiplier, startTime, destination) {
        const sources = [];
        const duration = soundDef.duration;

        soundDef.frequencies.forEach((freq, i) => {
            const osc = audioContext.createOscillator();
            const oscGain = audioContext.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq * pitchMultiplier;

            // Add vibrato
            const lfo = audioContext.createOscillator();
            const lfoGain = audioContext.createGain();
            lfo.frequency.value = 6 + i * 2;
            lfoGain.gain.value = freq * 0.02;
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);

            oscGain.gain.setValueAtTime(0, startTime);
            oscGain.gain.linearRampToValueAtTime(0.15, startTime + 0.1);
            oscGain.gain.linearRampToValueAtTime(0, startTime + duration);

            osc.connect(oscGain);
            oscGain.connect(destination);

            osc.start(startTime);
            osc.stop(startTime + duration);
            lfo.start(startTime);
            lfo.stop(startTime + duration);

            sources.push(osc, lfo);
        });

        return sources;
    }

    function createGrowlSound(soundDef, pitchMultiplier, startTime, destination) {
        const sources = [];
        const duration = soundDef.duration;

        // Main growl oscillator
        const osc = audioContext.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(soundDef.frequencies[0] * pitchMultiplier, startTime);
        osc.frequency.linearRampToValueAtTime(
            soundDef.frequencies[soundDef.frequencies.length - 1] * pitchMultiplier,
            startTime + duration
        );

        // Add modulation for growling effect
        const lfo = audioContext.createOscillator();
        const lfoGain = audioContext.createGain();
        lfo.frequency.value = 20;
        lfoGain.gain.value = 30;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        // Filter for grittiness
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 500;
        filter.Q.value = 5;

        osc.connect(filter);
        filter.connect(destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
        lfo.start(startTime);
        lfo.stop(startTime + duration);

        sources.push(osc, lfo);
        return sources;
    }

    function createExplosionSound(soundDef, pitchMultiplier, startTime, destination) {
        const sources = [];
        const duration = soundDef.duration;

        // Low frequency boom
        const osc = audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(soundDef.frequencies[0] * pitchMultiplier, startTime);
        osc.frequency.exponentialRampToValueAtTime(20, startTime + duration);

        // Noise burst
        const noiseBuffer = createNoiseBuffer(duration);
        const noise = audioContext.createBufferSource();
        noise.buffer = noiseBuffer;

        const noiseGain = audioContext.createGain();
        noiseGain.gain.setValueAtTime(0.8, startTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, startTime + duration * 0.7);

        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, startTime);
        filter.frequency.exponentialRampToValueAtTime(200, startTime + duration);

        osc.connect(destination);
        noise.connect(noiseGain);
        noiseGain.connect(filter);
        filter.connect(destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
        noise.start(startTime);
        noise.stop(startTime + duration);

        sources.push(osc, noise);
        return sources;
    }

    function createProjectileSound(soundDef, pitchMultiplier, startTime, destination) {
        const sources = [];
        const duration = soundDef.duration;

        const osc = audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(soundDef.frequencies[0] * pitchMultiplier, startTime);
        osc.frequency.exponentialRampToValueAtTime(
            soundDef.frequencies[1] * pitchMultiplier,
            startTime + duration
        );

        osc.connect(destination);
        osc.start(startTime);
        osc.stop(startTime + duration);

        sources.push(osc);
        return sources;
    }

    function createThunderSound(soundDef, pitchMultiplier, startTime, destination) {
        const sources = [];
        const duration = soundDef.duration;

        // Multiple rumbles
        soundDef.frequencies.forEach((freq, i) => {
            const noiseBuffer = createNoiseBuffer(duration);
            const noise = audioContext.createBufferSource();
            noise.buffer = noiseBuffer;

            const filter = audioContext.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = freq * 3;

            const noiseGain = audioContext.createGain();
            const offset = i * 0.1;
            noiseGain.gain.setValueAtTime(0, startTime + offset);
            noiseGain.gain.linearRampToValueAtTime(0.5 / (i + 1), startTime + offset + 0.05);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(destination);

            noise.start(startTime + offset);
            noise.stop(startTime + duration);

            sources.push(noise);
        });

        return sources;
    }

    function createAlarmSound(soundDef, pitchMultiplier, startTime, destination) {
        const sources = [];
        const duration = soundDef.duration;
        const freqs = soundDef.frequencies;
        const cycleTime = duration / (freqs.length / 2);

        for (let i = 0; i < freqs.length; i += 2) {
            const osc = audioContext.createOscillator();
            const oscGain = audioContext.createGain();

            osc.type = 'square';

            const cycleStart = startTime + (i / 2) * cycleTime;
            osc.frequency.setValueAtTime(freqs[i] * pitchMultiplier, cycleStart);
            osc.frequency.setValueAtTime(freqs[i + 1] * pitchMultiplier, cycleStart + cycleTime / 2);

            oscGain.gain.value = 0.3;

            osc.connect(oscGain);
            oscGain.connect(destination);

            osc.start(cycleStart);
            osc.stop(cycleStart + cycleTime);

            sources.push(osc);
        }

        return sources;
    }

    function createOminousSound(soundDef, pitchMultiplier, startTime, destination) {
        const sources = [];
        const duration = soundDef.duration;

        // Deep drone
        soundDef.frequencies.forEach((freq, i) => {
            const osc = audioContext.createOscillator();
            const oscGain = audioContext.createGain();

            osc.type = i === 0 ? 'sine' : 'triangle';
            osc.frequency.value = freq * pitchMultiplier;

            // Slow modulation
            const lfo = audioContext.createOscillator();
            const lfoGain = audioContext.createGain();
            lfo.frequency.value = 0.5 + i * 0.2;
            lfoGain.gain.value = freq * 0.1;
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);

            oscGain.gain.setValueAtTime(0, startTime);
            oscGain.gain.linearRampToValueAtTime(0.2, startTime + 0.2);
            oscGain.gain.linearRampToValueAtTime(0.15, startTime + duration * 0.7);
            oscGain.gain.linearRampToValueAtTime(0, startTime + duration);

            osc.connect(oscGain);
            oscGain.connect(destination);

            osc.start(startTime);
            osc.stop(startTime + duration);
            lfo.start(startTime);
            lfo.stop(startTime + duration);

            sources.push(osc, lfo);
        });

        return sources;
    }

    function createNoiseBuffer(duration) {
        const sampleRate = audioContext.sampleRate;
        const bufferSize = sampleRate * duration;
        const buffer = audioContext.createBuffer(1, bufferSize, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        return buffer;
    }

    // ============= SPATIAL AUDIO =============
    function calculateSpatialAudio(position) {
        if (!player) {
            return { volume: 1, pan: 0 };
        }

        const dx = position.x - player.x;
        const dy = position.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Calculate volume falloff
        let volume = 1;
        if (distance > CONFIG.SPATIAL_FALLOFF_START) {
            const falloffRange = CONFIG.SPATIAL_FALLOFF_END - CONFIG.SPATIAL_FALLOFF_START;
            const falloffDistance = distance - CONFIG.SPATIAL_FALLOFF_START;
            volume = Math.max(0, 1 - (falloffDistance / falloffRange));
            // Smooth falloff curve
            volume = volume * volume;
        }

        // Calculate stereo pan based on horizontal position
        const pan = Math.max(-1, Math.min(1, dx * CONFIG.SPATIAL_PAN_FACTOR / 10));

        return { volume, pan };
    }

    // ============= PUBLIC PLAYBACK FUNCTIONS =============
    function play(soundId, options = {}) {
        if (!initialized) initialize();
        if (suspended) resume();

        const soundDef = SOUNDS[soundId];
        if (!soundDef) {
            console.warn(`Sound not found: ${soundId}`);
            return null;
        }

        // Check pool availability
        const pool = soundPools.get(soundId);
        if (pool && pool.inUse.size >= CONFIG.POOL_SIZE_PER_SOUND) {
            // Too many instances, skip or recycle oldest
            return null;
        }

        const sound = synthesizeSound(soundDef, options);
        if (!sound) return null;

        // Track active sound
        const soundInstance = {
            id: Date.now() + Math.random(),
            soundId,
            ...sound,
            options
        };

        activeSounds.add(soundInstance);
        if (pool) pool.inUse.add(soundInstance.id);

        // Auto-cleanup after duration
        setTimeout(() => {
            activeSounds.delete(soundInstance);
            if (pool) pool.inUse.delete(soundInstance.id);
        }, (sound.duration + 0.1) * 1000);

        return soundInstance;
    }

    function playAt(soundId, x, y, options = {}) {
        return play(soundId, { ...options, position: { x, y } });
    }

    function playAmbient(soundId, options = {}) {
        if (!initialized) initialize();
        if (suspended) resume();

        // Check if already playing
        if (activeAmbient.has(soundId)) {
            return activeAmbient.get(soundId);
        }

        const soundDef = SOUNDS[soundId];
        if (!soundDef || soundDef.category !== 'ambient') {
            console.warn(`Ambient sound not found: ${soundId}`);
            return null;
        }

        // Create looping ambient sound
        const ambientInstance = createAmbientLoop(soundDef, options);
        if (ambientInstance) {
            activeAmbient.set(soundId, ambientInstance);
        }

        return ambientInstance;
    }

    function createAmbientLoop(soundDef, options) {
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0;
        gainNode.connect(ambientGain);

        // Fade in
        const fadeTime = options.fadeIn || 2;
        gainNode.gain.linearRampToValueAtTime(
            soundDef.volume * (options.volumeMultiplier || 1),
            audioContext.currentTime + fadeTime
        );

        const instance = {
            id: Date.now(),
            soundDef,
            gainNode,
            sources: [],
            active: true,
            intervalId: null
        };

        // Create recurring sound generator
        const generateSound = () => {
            if (!instance.active) return;

            const now = audioContext.currentTime;
            const duration = soundDef.duration * (0.8 + Math.random() * 0.4);

            const sources = createBasicSound(
                { ...soundDef, duration },
                1 + (Math.random() - 0.5) * 0.2,
                now,
                gainNode
            );

            instance.sources = sources;
        };

        generateSound();
        instance.intervalId = setInterval(generateSound, soundDef.duration * 800);

        return instance;
    }

    function stopAmbient(soundId, fadeOut = 2) {
        const instance = activeAmbient.get(soundId);
        if (!instance) return;

        instance.active = false;

        if (instance.intervalId) {
            clearInterval(instance.intervalId);
        }

        // Fade out
        instance.gainNode.gain.linearRampToValueAtTime(
            0,
            audioContext.currentTime + fadeOut
        );

        setTimeout(() => {
            instance.sources.forEach(s => {
                try { s.stop(); } catch (e) {}
            });
            activeAmbient.delete(soundId);
        }, fadeOut * 1000 + 100);
    }

    function stopAllAmbient(fadeOut = 2) {
        for (const soundId of activeAmbient.keys()) {
            stopAmbient(soundId, fadeOut);
        }
    }

    // ============= MUSIC SYSTEM =============
    function playMusic(trackId, options = {}) {
        if (!initialized) initialize();
        if (suspended) resume();

        const track = MUSIC_TRACKS[trackId];
        if (!track) {
            console.warn(`Music track not found: ${trackId}`);
            return;
        }

        // Handle crossfade from current track
        if (musicState.currentTrack && musicState.currentTrack !== trackId) {
            crossfadeToTrack(trackId, options);
            return;
        }

        startMusicTrack(trackId, track, options);
    }

    function startMusicTrack(trackId, track, options) {
        // Stop any existing music
        stopMusic(0);

        musicState.currentTrack = trackId;
        musicState.intensity = options.intensity || 0.5;
        musicState.layers = [];

        // Create layers
        track.layers.forEach((layerDef, i) => {
            const layer = createMusicLayer(track, layerDef, i);
            musicState.layers.push(layer);
        });

        // Start the music generation loop
        if (!musicState.generatorId) {
            musicState.generatorId = setInterval(generateMusicBeat, 60000 / track.tempo / 4);
        }
    }

    function createMusicLayer(track, layerDef, index) {
        const gainNode = audioContext.createGain();
        gainNode.gain.value = musicState.intensity >= layerDef.threshold ? layerDef.volume : 0;
        gainNode.connect(musicGain);

        return {
            name: layerDef.name,
            volume: layerDef.volume,
            threshold: layerDef.threshold,
            gainNode,
            active: musicState.intensity >= layerDef.threshold,
            beatCount: 0
        };
    }

    function generateMusicBeat() {
        if (!musicState.currentTrack) return;

        const track = MUSIC_TRACKS[musicState.currentTrack];
        if (!track) return;

        musicState.layers.forEach((layer, i) => {
            if (!layer.active) return;

            layer.beatCount++;

            // Generate notes based on layer type
            generateLayerNotes(track, layer);
        });
    }

    function generateLayerNotes(track, layer) {
        const now = audioContext.currentTime;
        const beatDuration = 60 / track.tempo;

        // Get scale for key
        const scale = getScaleForKey(track.key);

        switch (layer.name) {
            case 'melody':
                if (layer.beatCount % 4 === 1) {
                    const note = scale[Math.floor(Math.random() * scale.length)];
                    playMusicNote(note * 2, beatDuration * 2, layer.gainNode, 'sine');
                }
                break;

            case 'harmony':
                if (layer.beatCount % 8 === 1) {
                    const root = scale[0];
                    const third = scale[2];
                    const fifth = scale[4];
                    playMusicNote(root, beatDuration * 4, layer.gainNode, 'triangle', 0.15);
                    playMusicNote(third, beatDuration * 4, layer.gainNode, 'triangle', 0.12);
                    playMusicNote(fifth, beatDuration * 4, layer.gainNode, 'triangle', 0.1);
                }
                break;

            case 'bass':
                if (layer.beatCount % 2 === 1) {
                    const note = scale[layer.beatCount % 4 === 1 ? 0 : 4];
                    playMusicNote(note / 2, beatDuration, layer.gainNode, 'sine', 0.3);
                }
                break;

            case 'percussion':
                if (layer.beatCount % 4 === 1) {
                    playPercussion('kick', layer.gainNode);
                }
                if (layer.beatCount % 4 === 3) {
                    playPercussion('snare', layer.gainNode);
                }
                if (layer.beatCount % 2 === 0) {
                    playPercussion('hihat', layer.gainNode);
                }
                break;

            case 'drone':
                if (layer.beatCount % 16 === 1) {
                    const note = scale[0];
                    playMusicNote(note / 2, beatDuration * 16, layer.gainNode, 'sine', 0.2);
                }
                break;
        }
    }

    function playMusicNote(frequency, duration, destination, waveform = 'sine', volume = 0.2) {
        const now = audioContext.currentTime;

        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.type = waveform;
        osc.frequency.value = frequency;

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(volume, now + 0.02);
        gain.gain.linearRampToValueAtTime(volume * 0.7, now + duration * 0.3);
        gain.gain.linearRampToValueAtTime(0, now + duration);

        osc.connect(gain);
        gain.connect(destination);

        osc.start(now);
        osc.stop(now + duration);
    }

    function playPercussion(type, destination) {
        const now = audioContext.currentTime;

        switch (type) {
            case 'kick':
                const kickOsc = audioContext.createOscillator();
                const kickGain = audioContext.createGain();
                kickOsc.frequency.setValueAtTime(150, now);
                kickOsc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
                kickGain.gain.setValueAtTime(0.4, now);
                kickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                kickOsc.connect(kickGain);
                kickGain.connect(destination);
                kickOsc.start(now);
                kickOsc.stop(now + 0.15);
                break;

            case 'snare':
                const noiseBuffer = createNoiseBuffer(0.1);
                const snare = audioContext.createBufferSource();
                snare.buffer = noiseBuffer;
                const snareGain = audioContext.createGain();
                const snareFilter = audioContext.createBiquadFilter();
                snareFilter.type = 'highpass';
                snareFilter.frequency.value = 1000;
                snareGain.gain.setValueAtTime(0.3, now);
                snareGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                snare.connect(snareFilter);
                snareFilter.connect(snareGain);
                snareGain.connect(destination);
                snare.start(now);
                snare.stop(now + 0.1);
                break;

            case 'hihat':
                const hihatBuffer = createNoiseBuffer(0.05);
                const hihat = audioContext.createBufferSource();
                hihat.buffer = hihatBuffer;
                const hihatGain = audioContext.createGain();
                const hihatFilter = audioContext.createBiquadFilter();
                hihatFilter.type = 'highpass';
                hihatFilter.frequency.value = 7000;
                hihatGain.gain.setValueAtTime(0.1, now);
                hihatGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                hihat.connect(hihatFilter);
                hihatFilter.connect(hihatGain);
                hihatGain.connect(destination);
                hihat.start(now);
                hihat.stop(now + 0.05);
                break;
        }
    }

    function getScaleForKey(key) {
        const scales = {
            'C': [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88],
            'Am': [220.00, 246.94, 261.63, 293.66, 329.63, 349.23, 392.00],
            'Dm': [293.66, 329.63, 349.23, 392.00, 440.00, 466.16, 523.25],
            'Em': [329.63, 369.99, 392.00, 440.00, 493.88, 523.25, 587.33],
            'Gm': [196.00, 220.00, 233.08, 261.63, 293.66, 311.13, 349.23]
        };
        return scales[key] || scales['C'];
    }

    function crossfadeToTrack(newTrackId, options) {
        musicState.crossfading = true;

        // Fade out current
        musicState.layers.forEach(layer => {
            layer.gainNode.gain.linearRampToValueAtTime(
                0,
                audioContext.currentTime + CONFIG.CROSSFADE_DURATION / 1000
            );
        });

        // Start new track after crossfade
        setTimeout(() => {
            stopMusic(0);
            const track = MUSIC_TRACKS[newTrackId];
            if (track) {
                startMusicTrack(newTrackId, track, options);
            }
            musicState.crossfading = false;
        }, CONFIG.CROSSFADE_DURATION);
    }

    function setMusicIntensity(intensity) {
        musicState.intensity = Math.max(0, Math.min(1, intensity));

        // Update layer volumes
        musicState.layers.forEach(layer => {
            const shouldBeActive = musicState.intensity >= layer.threshold;
            const targetVolume = shouldBeActive ? layer.volume : 0;

            layer.gainNode.gain.linearRampToValueAtTime(
                targetVolume,
                audioContext.currentTime + 0.5
            );

            layer.active = shouldBeActive;
        });
    }

    function stopMusic(fadeOut = 2) {
        if (musicState.generatorId) {
            clearInterval(musicState.generatorId);
            musicState.generatorId = null;
        }

        musicState.layers.forEach(layer => {
            if (fadeOut > 0) {
                layer.gainNode.gain.linearRampToValueAtTime(
                    0,
                    audioContext.currentTime + fadeOut
                );
            }
        });

        setTimeout(() => {
            musicState.layers = [];
            musicState.currentTrack = null;
        }, fadeOut * 1000);
    }

    // ============= VOLUME CONTROLS =============
    function setMasterVolume(volume) {
        CONFIG.MASTER_VOLUME = Math.max(0, Math.min(1, volume));
        if (masterGain) {
            masterGain.gain.linearRampToValueAtTime(
                CONFIG.MASTER_VOLUME,
                audioContext.currentTime + 0.1
            );
        }
    }

    function setMusicVolume(volume) {
        CONFIG.MUSIC_VOLUME = Math.max(0, Math.min(1, volume));
        if (musicGain) {
            musicGain.gain.linearRampToValueAtTime(
                CONFIG.MUSIC_VOLUME,
                audioContext.currentTime + 0.1
            );
        }
    }

    function setSFXVolume(volume) {
        CONFIG.SFX_VOLUME = Math.max(0, Math.min(1, volume));
        if (sfxGain) {
            sfxGain.gain.linearRampToValueAtTime(
                CONFIG.SFX_VOLUME,
                audioContext.currentTime + 0.1
            );
        }
    }

    function setAmbientVolume(volume) {
        CONFIG.AMBIENT_VOLUME = Math.max(0, Math.min(1, volume));
        if (ambientGain) {
            ambientGain.gain.linearRampToValueAtTime(
                CONFIG.AMBIENT_VOLUME,
                audioContext.currentTime + 0.1
            );
        }
    }

    // ============= DYNAMIC AUDIO UPDATES =============
    function update(gameState) {
        if (!initialized || suspended) return;

        // Update music based on game state
        updateDynamicMusic(gameState);

        // Update ambient sounds based on environment
        updateAmbientSounds(gameState);
    }

    function updateDynamicMusic(gameState) {
        // Determine appropriate track
        let targetTrack = 'peaceful_day';
        let intensity = 0.3;

        if (typeof BossSystem !== 'undefined' && BossSystem.isActive && BossSystem.isActive()) {
            targetTrack = 'boss_fight';
            intensity = 1.0;
        } else if (typeof HordeSystem !== 'undefined' && HordeSystem.isActive && HordeSystem.isActive()) {
            targetTrack = 'horde';
            intensity = 0.9;
        } else if (typeof zombies !== 'undefined' && zombies.length > 5) {
            targetTrack = 'combat';
            intensity = Math.min(1, 0.4 + zombies.length * 0.05);
        } else if (typeof isNight !== 'undefined' && isNight) {
            targetTrack = 'tense_night';
            intensity = 0.5;
        }

        // Change track if needed
        if (musicState.currentTrack !== targetTrack) {
            playMusic(targetTrack, { intensity });
        } else {
            setMusicIntensity(intensity);
        }
    }

    function updateAmbientSounds(gameState) {
        // Get current biome
        let currentBiome = 'jungle';
        if (typeof BiomeSystem !== 'undefined' && BiomeSystem.getCurrentBiome) {
            currentBiome = BiomeSystem.getCurrentBiome() || 'jungle';
        }

        // Get time of day
        const timeOfDay = (typeof isNight !== 'undefined' && isNight) ? 'night' : 'day';

        // Get weather
        let weather = 'clear';
        if (typeof WeatherSystem !== 'undefined' && WeatherSystem.getCurrentWeather) {
            weather = WeatherSystem.getCurrentWeather()?.type || 'clear';
        }

        // Update if environment changed
        if (currentBiome !== ambientState.currentBiome ||
            timeOfDay !== ambientState.timeOfDay ||
            weather !== ambientState.weather) {

            updateAmbientForEnvironment(currentBiome, timeOfDay, weather);

            ambientState.currentBiome = currentBiome;
            ambientState.timeOfDay = timeOfDay;
            ambientState.weather = weather;
        }

        // Handle weather sounds
        updateWeatherSounds(weather);
    }

    function updateAmbientForEnvironment(biome, timeOfDay, weather) {
        // Stop current ambient sounds with fade
        stopAllAmbient(1.5);

        // Get soundscape for biome and time
        const soundscape = AMBIENT_SOUNDSCAPES[biome];
        if (!soundscape) return;

        const sounds = soundscape[timeOfDay] || soundscape.day;

        // Start new ambient sounds with delay for crossfade
        setTimeout(() => {
            sounds.forEach(soundId => {
                if (SOUNDS[soundId]) {
                    playAmbient(soundId, { fadeIn: 2 });
                }
            });
        }, 1500);
    }

    function updateWeatherSounds(weather) {
        switch (weather) {
            case 'rain':
                if (!activeAmbient.has('rain_light')) {
                    stopAmbient('rain_heavy');
                    playAmbient('rain_light', { fadeIn: 3 });
                }
                break;
            case 'thunderstorm':
                if (!activeAmbient.has('rain_heavy')) {
                    stopAmbient('rain_light');
                    playAmbient('rain_heavy', { fadeIn: 2 });
                }
                break;
            case 'fog':
            case 'clear':
            default:
                stopAmbient('rain_light', 3);
                stopAmbient('rain_heavy', 3);
                break;
        }
    }

    // ============= SERIALIZATION =============
    function getSettings() {
        return {
            masterVolume: CONFIG.MASTER_VOLUME,
            musicVolume: CONFIG.MUSIC_VOLUME,
            sfxVolume: CONFIG.SFX_VOLUME,
            ambientVolume: CONFIG.AMBIENT_VOLUME
        };
    }

    function setSettings(settings) {
        if (!settings) return;

        if (settings.masterVolume !== undefined) setMasterVolume(settings.masterVolume);
        if (settings.musicVolume !== undefined) setMusicVolume(settings.musicVolume);
        if (settings.sfxVolume !== undefined) setSFXVolume(settings.sfxVolume);
        if (settings.ambientVolume !== undefined) setAmbientVolume(settings.ambientVolume);
    }

    // ============= PUBLIC API =============
    return {
        // Initialization
        initialize,
        resume,

        // Sound playback
        play,
        playAt,
        playAmbient,
        stopAmbient,
        stopAllAmbient,

        // Music
        playMusic,
        stopMusic,
        setMusicIntensity,

        // Volume controls
        setMasterVolume,
        setMusicVolume,
        setSFXVolume,
        setAmbientVolume,

        // Updates
        update,

        // Settings
        getSettings,
        setSettings,

        // Constants
        SOUNDS,
        MUSIC_TRACKS,

        // State accessors
        isInitialized: () => initialized,
        isSuspended: () => suspended,
        getCurrentTrack: () => musicState.currentTrack
    };
})();

// Export globally
window.AudioSystem = AudioSystem;

// Auto-resume on user interaction
document.addEventListener('click', () => AudioSystem.resume(), { once: true });
document.addEventListener('keydown', () => AudioSystem.resume(), { once: true });
