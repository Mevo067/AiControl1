const { spawn } = require('child_process');
const path = require('path');

// Chemin vers indexExpress.js
const expressPath = path.join(__dirname, 'indexExpress.js');

// Démarrer le processus
const serverProcess = spawn('node', [expressPath], {
    stdio: 'inherit',
    shell: true
});

serverProcess.on('error', (error) => {
    console.error('Erreur lors du démarrage du serveur:', error);
});

serverProcess.on('close', (code) => {
    console.log(`Le serveur s'est arrêté avec le code: ${code}`);
});

// Gérer l'arrêt propre du serveur
process.on('SIGINT', () => {
    serverProcess.kill();
    process.exit();
}); 