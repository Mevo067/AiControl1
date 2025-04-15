// Extension SillyTavern - AI Control
// Version: 1.0.0
// Auteur: Votre nom

import { getContext, extension_settings, ModuleWorkerWrapper } from "../../../extensions.js";
import { eventSource, event_types, getRequestHeaders } from "../../../../script.js";
import { saveSettings, saveSettingsDebounced } from "../../../../script.js";


let nodeProcess = null;

// Configuration de l'extension
const extensionName = 'ai_control';
const extensionConfig = {
    name: 'AI Control',
    version: '1.0.0',
    author: 'Nevo067',
    description: 'Extension pour contrôler le comportement de l\'IA',
    type: 'extension'
};

// URL de l'API Express
const API_URL = 'http://localhost:3000';

// Variable pour stocker le processus du serveur
let serverProcess = null;


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
    style.id = 'ai_control_style';
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

    // Ajout d'un message ou d'un badge dans la barre d'extension (optionnel)
    const extensionBar = document.getElementById('extensions-bar');
    if (extensionBar) {
        // Exemple : extensionBar.appendChild(document.createTextNode('AI Control chargé'));
    } else {
        const quickReplyBar = document.getElementById('quickReplyBar');
        if (quickReplyBar) {
            // Exemple : quickReplyBar.appendChild(document.createTextNode('AI Control chargé'));
        } else {
            console.error("Impossible de trouver la barre d'extension (#extensions-bar ou #quickReplyBar)");
        }
    }
}

// Fonction d'initialisation
async function init() {
    try {

        // Ajouter l'interface utilisateur
        addUI();

        console.log("2Ae")

        // Configurer les écouteurs d'événements
        setupEventListeners();
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
    }
}

// Fonction de chargement
async function load() {
    console.log('Chargement de l\'extension AI Control...');
    await init();
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


function setup() {
    const cheminVersScript = path.resolve('../indexExpress.js'); // ← adapte ce chemin selon ta structure

    console.log("🔮 Lancement automatique du serveur Node.js depuis l'extension...");

    nodeProcess = spawn('node', [cheminVersScript], {
        stdio: 'inherit',
        shell: true,
    });

    nodeProcess.on('close', (code) => {
        console.log(`💀 Le serveur Node.js s'est terminé avec le code ${code}`);
        nodeProcess = null;
    });

    nodeProcess.on('error', (err) => {
        console.error(`🧨 Erreur lors du lancement du serveur :`, err);
    });
}

export {
    extensionName,
    extensionConfig,
    load,
    unload
};

jQuery(async () => {
    addUI();

    // Chemin du dossier de l'extension
    const extensionFolderPath = `./data/default-user/extensions/AiControl1`;

    // Charger dynamiquement le HTML des paramètres
    const settingsHtml = await $.get(`${extensionFolderPath}/settings.html`);

    // Ajouter le HTML à la colonne de droite des paramètres d'extensions
    $("#extensions_settings").append(settingsHtml);

    console.log(settingsHtml);
    console.log("settingsHtml")

    // Récupérer les boutons et leur associer les méthodes
    $("#scan_button_settings").on("click", startScan);
    $("#vibrate_button_settings").on("click", vibrateDevices);

    // Charger les paramètres si besoin (fonction à créer si tu as des settings)
    // loadSettings();
});