// Extension SillyTavern - AI Control
// Version: 1.0.0
// Auteur: Votre nom

import { getContext, extension_settings, ModuleWorkerWrapper } from "../../../extensions.js";
import { eventSource, event_types, getRequestHeaders } from "../../../../script.js";
import { saveSettings, saveSettingsDebounced } from "../../../../script.js";


let nodeProcess = null;

// Configuration de l'extension
const extensionName = "AiControl1";
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

const extensionFolderPath = `/scripts/extensions/third-party/${extensionName}`;

// Tableau pour stocker les appareils connectés
let connectedDevices = [];

// Intervalle de mise à jour des appareils (en millisecondes)
const DEVICE_UPDATE_INTERVAL = 5000;

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

// Fonction pour récupérer la liste des appareils depuis l'API


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

        // Mettre à jour le bouton pendant le scan
        const button = document.getElementById('scan_button_settings');
        if (button) {
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fa-solid fa-search fa-spin"></i> Recherche...';
            button.disabled = true;

            // Rétablir le bouton après 5 secondes
            setTimeout(async () => {
                button.innerHTML = originalText;
                button.disabled = false;
                const devices = await fetchConnectedDevices();
                compareDeviceLists(devices);
            }, 5000);
        }
    } catch (error) {
        console.error('Erreur lors du scan:', error);
        toastr.error('Erreur lors du scan des appareils');
    }
}

// Fonction pour faire vibrer les appareils
async function vibrateDevices() {
    try {
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

        // Animation du bouton pendant la vibration
        const button = document.getElementById('vibrate_button_settings');
        if (button) {
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fa-solid fa-bell fa-shake"></i> Vibration...';
            button.disabled = true;

            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
            }, 1000);
        }
    } catch (error) {
        console.error('Erreur lors de la vibration:', error);
        toastr.error('Erreur lors de la vibration des appareils');
    }
}

// Fonction pour déconnecter un appareil
async function disconnectDevice(deviceId) {
    try {
        const response = await fetch(`${API_URL}/disconnect/${deviceId}`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        toastr.success(data.message);

        // Mettre à jour la liste des appareils
        const devices = await fetchConnectedDevices();
        compareDeviceLists(devices);
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        toastr.error('Erreur lors de la déconnexion de l\'appareil');
    }
}

// Fonction pour mettre à jour la liste des appareils connectés
function updateConnectedDevicesList() {
    const devicesList = document.getElementById('connected_devices_list');
    if (!devicesList) return;

    devicesList.innerHTML = '';

    if (connectedDevices.length === 0) {
        devicesList.innerHTML = '<div class="device-item"><i class="fa-solid fa-info-circle"></i> Aucun appareil connecté</div>';
        return;
    }

    connectedDevices.forEach(device => {
        const deviceElement = document.createElement('div');
        deviceElement.className = 'device-item';
        deviceElement.innerHTML = `
            <div class="device-info">
                <i class="fa-solid fa-mobile-screen"></i>
                <span>${device.name || 'Appareil sans nom'}</span>
            </div>
            <button class="disconnect-button" id="disconnect_${device.id}">
                <i class="fa-solid fa-plug"></i> Déconnecter
            </button>
        `;
        devicesList.appendChild(deviceElement);
    });
}

// Fonction pour gérer la connexion d'un nouvel appareil
function onDeviceConnected(device) {
    if (!connectedDevices.some(d => d.id === device.id)) {
        connectedDevices.push(device);
        updateConnectedDevicesList();
        toastr.success(`Appareil ${device.name || 'sans nom'} connecté`);
    }
}

// Fonction pour gérer la déconnexion d'un appareil
function onDeviceDisconnected(device) {
    connectedDevices = connectedDevices.filter(d => d.id !== device.id);
    updateConnectedDevicesList();
    toastr.warning(`Appareil ${device.name || 'sans nom'} déconnecté`);
}

async function fetchConnectedDevices() {
    try {
        const response = await fetch(`${API_URL}/devices`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const devices = await response.json();
        return devices;
    } catch (error) {
        console.error('Erreur lors de la récupération des appareils:', error);
        return [];
    }
}

// Fonction pour comparer les listes d'appareils et détecter les changements
function compareDeviceLists(newDevices) {
    const currentIds = new Set(connectedDevices.map(d => d.id));
    const newIds = new Set(newDevices.map(d => d.id));

    // Détecter les nouveaux appareils
    newDevices.forEach(device => {
        if (!currentIds.has(device.id)) {
            onDeviceConnected(device);
        }
    });

    // Détecter les appareils déconnectés
    connectedDevices.forEach(device => {
        if (!newIds.has(device.id)) {
            onDeviceDisconnected(device);
        }
    });
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

// Fonction pour ajouter l'interface utilisateur
function addUI() {
    console.log("UI")
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

    // Ajout d'un message ou d'un badge dans la barre d'extension (optionnel)

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

console.log('Extension AI Control déchargée avec succès.');

// Exporter les fonctions nécessaires


function startDevicePolling() {
    setInterval(async () => {
        const devices = await fetchConnectedDevices();
        compareDeviceLists(devices);
    }, DEVICE_UPDATE_INTERVAL);
}

jQuery(async () => {
    addUI();

    // Charger dynamiquement le HTML des paramètres
    const settingsHtml = await $.get(`${extensionFolderPath}/settings.html`);
    $("#extensions_settings").append(settingsHtml);

    // Associer les fonctions aux boutons
    $("#scan_button_settings").on("click", startScan);
    $("#vibrate_button_settings").on("click", vibrateDevices);

     $(document).on('click', '.disconnect-button', function() {
        const deviceId = this.id.replace('disconnect_', '');
        disconnectDevice(deviceId);
    });

    // Mettre à jour la liste des appareils au chargement
    const initialDevices = await fetchConnectedDevices();
    connectedDevices = initialDevices;
    updateConnectedDevicesList();

    // Ajouter les gestionnaires d'événements pour les boutons de déconnexion


    // Démarrer le polling des appareils
    startDevicePolling();
});

export {
    extensionName,
    extensionConfig,
    load,
    unload
};
// Fonction pour démarrer le polling des appareils

