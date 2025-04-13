// Extension SillyTavern - AI Control
// Version: 1.0.0
// Auteur: Votre nom

import { eventSource, event_types, getCharacters, saveSettings, saveSettingsDebounced } from "../../../../script.js";
import { extension_settings, getContext, ModuleWorkerWrapper } from "../../../extensions.js";

// URL de l'API Express
const API_URL = 'http://localhost:3000';

// Variable pour stocker le processus du serveur
let serverProcess = null;

// Fonction pour démarrer le serveur Express
async function startServer() {
    try {
        console.log('Démarrage du serveur Express...');

        // Utiliser l'API SillyTavern pour exécuter le script Node.js
        const response = await fetch('/api/plugins/run-nodejs-script', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                script: 'server.js'
            })
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('Serveur démarré:', data);

        // Attendre que le serveur démarre
        return new Promise(resolve => {
            const checkServer = setInterval(async () => {
                try {
                    const response = await fetch(`${API_URL}/devices`, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (response.ok) {
                        console.log('Serveur Express démarré avec succès');
                        clearInterval(checkServer);
                        resolve(true);
                    }
                } catch (error) {
                    console.log('En attente du démarrage du serveur...');
                }
            }, 1000);

            // Timeout après 10 secondes
            setTimeout(() => {
                clearInterval(checkServer);
                console.log('Le serveur n\'a pas répondu à temps, mais pourrait être en cours de démarrage');
                resolve(false);
            }, 10000);
        });
    } catch (error) {
        console.error('Erreur lors du démarrage du serveur Express:', error);
        return false;
    }
}

// Fonction pour envoyer un message à l'API
async function sendToAPI(message) {
    try {
        const response = await fetch(`${API_URL}/evaluate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: message })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.score;
    } catch (error) {
        console.error('Erreur lors de l\'envoi à l\'API:', error);
        return null;
    }
}

// Fonction pour faire vibrer les appareils connectés pendant 1 seconde
async function vibrateDevices() {
    try {
        // Appeler l'endpoint pour faire vibrer les appareils pendant 1 seconde
        const response = await fetch(`${API_URL}/vibrate-for-duration`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                intensity: 1.0,
                duration: 1000
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Vibration activée:', data);

        // Notification visuelle
        const button = document.getElementById('vibrate_button');
        if (button) {
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fa-solid fa-bell fa-shake"></i> Vibration';
            button.classList.add('active');

            // Rétablir le bouton après la durée de vibration
            setTimeout(() => {
                button.innerHTML = originalText;
                button.classList.remove('active');
            }, 1000);
        }
    } catch (error) {
        console.error('Erreur lors de la vibration:', error);
        alert(`Erreur: ${error.message}`);
    }
}

// Fonction pour intercepter les messages
function interceptMessage(message) {
    // Vérifier si c'est un message de l'IA
        // Évaluer le message
        sendToAPI(message.content).then(score => {
            if (score !== null) {
                console.log(`Score d'excitabilité: ${score}`);
                // Vous pouvez ajouter ici la logique pour gérer le score
            }
        });
}

// Fonction pour démarrer le scan des appareils
async function startScan() {
    try {
        const response = await fetch(`${API_URL}/start-scanning`, {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Scan démarré:', data);

        // Notification visuelle
        const button = document.getElementById('scan_button');
        if (button) {
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fa-solid fa-search fa-spin"></i> Recherche...';

            // Rétablir le bouton après quelques secondes
            setTimeout(() => {
                button.innerHTML = originalText;
            }, 3000);
        }

        // Vérifier les appareils trouvés après quelques secondes
        setTimeout(async () => {
            try {
                const devicesResponse = await fetch(`${API_URL}/devices`);
                if (devicesResponse.ok) {
                    const devices = await devicesResponse.json();
                    if (devices.length > 0) {
                        toastr.success(`${devices.length} appareil(s) trouvé(s)!`, 'Recherche terminée');
                    } else {
                        toastr.warning('Aucun appareil trouvé.', 'Recherche terminée');
                    }
                }
            } catch (e) {
                console.error('Erreur lors de la vérification des appareils:', e);
            }
        }, 3000);
    } catch (error) {
        console.error('Erreur lors du démarrage du scan:', error);
        alert(`Erreur: ${error.message}`);
    }
}

// Fonction pour ajouter l'interface utilisateur
function addUI() {
    // Style pour le bouton actif
    const style = document.createElement('style');
    style.textContent = `
        .menu_button.active {
            background-color: var(--accent-color) !important;
            color: var(--shadow-color) !important;
            transform: scale(1.05);
            transition: all 0.1s ease;
        }

        .fa-shake {
            animation: fa-shake 1s infinite;
        }

        @keyframes fa-shake {
            0% { transform: rotate(0deg); }
            25% { transform: rotate(-10deg); }
            50% { transform: rotate(0deg); }
            75% { transform: rotate(10deg); }
            100% { transform: rotate(0deg); }
        }
    `;
    document.head.appendChild(style);

    // Créer le conteneur pour les boutons
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'ai_control_buttons';
    buttonContainer.className = 'flex-container flexGap5 margin-bot-10';

    // Créer le bouton de scan
    const scanButton = document.createElement('button');
    scanButton.id = 'scan_button';
    scanButton.className = 'menu_button';
    scanButton.innerHTML = '<i class="fa-solid fa-search"></i> Rechercher';
    scanButton.title = 'Rechercher des appareils connectés';
    scanButton.onclick = startScan;

    // Créer le bouton de vibration
    const vibrateButton = document.createElement('button');
    vibrateButton.id = 'vibrate_button';
    vibrateButton.className = 'menu_button';
    vibrateButton.innerHTML = '<i class="fa-solid fa-bell"></i> Vibrer';
    vibrateButton.title = 'Faire vibrer les appareils pendant 1 seconde';
    vibrateButton.onclick = vibrateDevices;

    // Ajouter les boutons au conteneur
    buttonContainer.appendChild(scanButton);
    buttonContainer.appendChild(vibrateButton);

    // Ajouter le conteneur à SillyTavern
    const quickReplyBar = document.getElementById('quickReplyBar');
    if (quickReplyBar) {
        quickReplyBar.appendChild(buttonContainer);
    } else {
        console.error('Impossible de trouver #quickReplyBar');
    }
}

// Fonction d'initialisation de l'extension
async function init() {
    console.log('Initialisation de l\'extension AI Control...');
    console.log('Version:', extensionConfig.version);


    // Démarrer le serveur lors de l'initialisation
    await startServer();

    // Ajouter l'interface utilisateur
    addUI();

    // Intercepter les messages
    if (typeof eventSource !== 'undefined') {
        eventSource.addEventListener('message', (event) => {
            const message = JSON.parse(event.data);
            interceptMessage(message);
        });
    }
}

// Fonction pour charger l'extension
async function load() {
    try {
        console.log('Chargement de l\'extension AI Control...');

        await init(); // Supposons que init() soit une fonction asynchrone
        console.log('Extension AI Control chargée avec succès.');
    } catch (error) {
        console.error('Erreur lors du chargement de l\'extension AI Control:', error);
        // Vous pouvez ajouter ici des actions supplémentaires en cas d'erreur, comme afficher un message à l'utilisateur
    }
}

// Fonction pour décharger l'extension
function unload() {
    console.log('Déchargement de l\'extension AI Control...');

    // Supprimer les boutons
    const container = document.getElementById('ai_control_buttons');
    if (container) {
        container.remove();
    }

    // Supprimer le style
    const style = document.querySelector('style[id="ai_control_style"]');
    if (style) {
        style.remove();
    }
}
console.log("1")
console.log('Extension AI Control déchargée avec succès.');

// Exporter les fonctions nécessaires

jQuery(async () => {
    await init();
});