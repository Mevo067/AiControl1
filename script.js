// Extension SillyTavern - AI Control
// Version: 1.0.0
// Auteur: Votre nom

const extensionName = 'ai_control';
const extensionFolder = 'extensions/ai_control';

// Configuration de l'extension
const extensionConfig = {
    name: 'AI Control',
    version: '1.0.0',
    author: 'Votre nom',
    description: 'Extension pour contrôler le comportement de l\'IA',
    dependencies: {
        'python': '3.8+'
    }
};

// URL de l'API Express
const API_URL = 'http://localhost:3000';

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

// Fonction d'initialisation de l'extension
async function init() {
    console.log('Initialisation de l\'extension AI Control...');
    
    // Intercepter les messages
    if (typeof eventSource !== 'undefined') {
        eventSource.addEventListener('message', (event) => {
            const message = JSON.parse(event.data);
            interceptMessage(message);
        });
    }
}

// Fonction pour charger l'extension
function load() {
    console.log('Chargement de l\'extension AI Control...');
    init();
}

// Fonction pour décharger l'extension
function unload() {
    console.log('Déchargement de l\'extension AI Control...');
}

// Exporter les fonctions nécessaires
export {
    extensionName,
    extensionConfig,
    load,
    unload
}; 