// ============= MAIN ENTRY =============
// Initialize
window.onload = init;

// Random survivor spawn logic
setInterval(() => {
    if (!gameRunning || isNight || gamePaused) return;
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
                        isPlayer: false
                    });
                    updateSurvivorList();
                }
            },
            { text: '✗ Reject', class: 'reject', action: () => { } }
        ]
    );
}, 35000);
