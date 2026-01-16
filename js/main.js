// ============= MAIN ENTRY =============
// Initialize
window.onload = init;

// Random survivor spawn logic
setInterval(() => {
    if (!gameState.running || isNight || gameState.paused) return;
    if (Math.random() > 0.25) return;

    const names = ['Alex', 'Jordan', 'Sam', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery', 'Blake', 'Drew', 'Jamie', 'Jesse', 'Robin', 'Sage'];
    const name = names[Math.floor(Math.random() * names.length)];

    showNotification(
        `<i class="material-icons">contact_emergency</i> A survivor named ${name} wants to join!`,
        [
            {
                text: '✓ Accept', class: 'accept', action: () => {
                    survivors.push({
                        id: survivors.length,
                        name: name,
                        role: 'None',
                        x: Math.random() * 4 - 2,
                        y: Math.random() * 4 - 2,
                        health: 80 + Math.floor(Math.random() * 40),
                        maxHealth: 100,
                        isPlayer: false,
                        // Visual Traits
                        gender: Math.random() > 0.5 ? 'male' : 'female',
                        skinColor: ['#ffd4a8', '#e8b888', '#c89868', '#8d5524', '#523418'][Math.floor(Math.random() * 5)],
                        hairColor: ['#222', '#5a4030', '#e6cea8', '#882222', '#555'][Math.floor(Math.random() * 5)],
                        clothingColor: ['#5599ff', '#ff5555', '#55ff55', '#ffff55', '#ff55ff', '#55ffff'][Math.floor(Math.random() * 6)],
                        isFollowing: false
                    });
                    updateSurvivorList();
                }
            },
            { text: '✗ Reject', class: 'reject', action: () => { } }
        ]
    );
}, 35000);
