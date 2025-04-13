// Extension SillyTavern - AI Control
import { extension_settings, getContext, loadExtensionSettings } from "../../../extensions.js";
import { saveSettingsDebounced } from "../../../../script.js";

const extensionName = 'ai_control';
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
const extensionSettings = extension_settings[extensionName];

// Configuration par défaut
const defaultSettings = {
    enabled: true,
    example_setting: false
};

// Configuration de l'extension
const extensionConfig = {
    display_name: 'AI Control',
    loading_order: 1,
    version: '1.0.0',
    author: 'Nevo067',
    description: 'Extension pour contrôler le comportement de l\'IA',
    entry: './index.js',
    type: 'extension',
    requires: [],
    optional: [],
    homePage: 'https://github.com/Mevo067/AiControl1',
    dependencies: {}
};

// Chargement des paramètres
async function loadSettings() {
    extension_settings[extensionName] = extension_settings[extensionName] || {};
    if (Object.keys(extension_settings[extensionName]).length === 0) {
        Object.assign(extension_settings[extensionName], defaultSettings);
    }

    // Mise à jour des paramètres dans l'interface
    $("#ai_control_enabled").prop("checked", extension_settings[extensionName].enabled).trigger("input");
    $("#example_setting").prop("checked", extension_settings[extensionName].example_setting).trigger("input");
}

// Gestion des événements des paramètres
function onEnabledInput(event) {
    const value = Boolean($(event.target).prop("checked"));
    extension_settings[extensionName].enabled = value;
    saveSettingsDebounced();
}

function onExampleInput(event) {
    const value = Boolean($(event.target).prop("checked"));
    extension_settings[extensionName].example_setting = value;
    saveSettingsDebounced();
}

// Fonction de chargement
async function load() {
    try {
        console.log('Chargement de l\'extension AI Control...');
        const settingsHtml = await $.get(`${extensionFolderPath}/settings.html`);
        $("#extensions_settings").append(settingsHtml);

        // Écouteurs d'événements
        $("#ai_control_enabled").on("input", onEnabledInput);
        $("#example_setting").on("input", onExampleInput);

        // Chargement des paramètres
        await loadSettings();
    } catch (error) {
        console.error('Erreur lors du chargement:', error);
    }
}

// Fonction de déchargement
function unload() {
    // Nettoyage si nécessaire
}

// Exportation des fonctions nécessaires
export {
    extensionName,
    extensionConfig,
    load,
    unload
};

jQuery(async () => {
    // This is an example of loading HTML from a file
    console.log('Chargement de l\'extension AI Control...');
  });
