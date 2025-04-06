const express = require("express");
const Buttplug = require("buttplug");
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const port = 3000;

// Activer CORS pour permettre les requêtes depuis SillyTavern
app.use(cors());

const connector = new Buttplug.ButtplugNodeWebsocketClientConnector("ws://127.0.0.1:12345");
const client = new Buttplug.ButtplugClient("Device Control Example");

const spawn = require('child_process').spawn;





//api
app.use(express.json()); // Pour parser le JSON

// Liste des appareils connectés
const devices = new Map();

//Service

function scoreSexuelle(text){   
    const pythonProcess = spawn('python', ['./AI/indexChat.py', text]);
    pythonProcess.stdout.on('data', (data) => {
        console.log("reussie")
        return data.toString();
    });
    pythonProcess.stderr.on('data', (data) => {
        console.error(data.toString());
    });
    pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
    });
}


// Événement lorsqu'un appareil est détecté
client.addListener("deviceadded", (device) => {
    console.log(`Device Connected: ${device.name}`);
    devices.set(device.index, device);
});

// Événement lorsqu'un appareil est retiré
client.addListener("deviceremoved", (device) => {
    console.log(`Device Removed: ${device.name}`);
    devices.delete(device.index);
});

console.log(devices);


//Ressources

// Route pour démarrer la détection des appareils
app.get("/start-scanning", async (req, res) => {
    try {
        await client.startScanning();
        res.json({ message: "Scanning started" });
    } catch (error) {
        res.status(500).json({ error: "Failed to start scanning", details: error.message });
    }
});

// Route pour récupérer la liste des appareils connectés
app.get("/devices", (req, res) => {
    const deviceList = Array.from(devices.values()).map(device => ({
        id: device.index,
        name: device.name
    }));
    res.json(deviceList);
});

// Route pour vibrer un appareil
app.post("/vibrate/:id", async (req, res) => {
    const device = devices.get(parseInt(req.params.id));
    if (!device) {
        return res.status(404).json({ error: "Device not found" });
    }

    if (!device.vibrateAttributes || device.vibrateAttributes.length === 0) {
        return res.status(400).json({ error: "Device does not support vibration" });
    }

    try {
        await device.vibrate(1.0);
        setTimeout(async () => {
            await device.stop();
        }, 1000);
        res.json({ message: "Device vibrating for 1 second" });
    } catch (error) {
        res.status(500).json({ error: "Failed to vibrate device", details: error.message });
    }
});

app.post("/vibrate-with-intensity-all/", async (req, res) => {
    const intensity = req.body.intensity || 1.0;
    
    try {
        const deviceList = Array.from(devices.values());
        if (deviceList.length === 0) {
            return res.status(404).json({ error: "Aucun appareil connecté" });
        }
        
        // Faire vibrer tous les appareils
        for (const device of deviceList) {
            if (device.vibrateAttributes && device.vibrateAttributes.length > 0) {
                await device.vibrate(intensity);
                console.log(`Appareil ${device.name} en vibration avec intensité ${intensity}`);
            }
        }
        
        res.json({ 
            message: "Appareils en vibration", 
            deviceCount: deviceList.length,
            intensity: intensity
        });
    } catch (error) {
        console.error("Erreur lors de la vibration:", error);
        res.status(500).json({ error: "Échec de la vibration", details: error.message });
    }
});

// Route pour faire vibrer tous les appareils pendant une durée précise
app.post("/vibrate-for-duration", async (req, res) => {
    const intensity = req.body.intensity || 1.0;
    const duration = req.body.duration || 1000; // Durée en millisecondes (défaut: 1 seconde)
    
    try {
        const deviceList = Array.from(devices.values());
        if (deviceList.length === 0) {
            return res.status(404).json({ error: "Aucun appareil connecté" });
        }
        
        // Faire vibrer tous les appareils
        for (const device of deviceList) {
            if (device.vibrateAttributes && device.vibrateAttributes.length > 0) {
                await device.vibrate(intensity);
                console.log(`Appareil ${device.name} en vibration avec intensité ${intensity} pendant ${duration}ms`);
            }
        }
        
        // Arrêter la vibration après la durée spécifiée
        setTimeout(async () => {
            for (const device of deviceList) {
                try {
                    if (device.vibrateAttributes && device.vibrateAttributes.length > 0) {
                        await device.stop();
                        console.log(`Arrêt de la vibration pour l'appareil ${device.name}`);
                    }
                } catch (err) {
                    console.error(`Erreur lors de l'arrêt de l'appareil ${device.name}:`, err);
                }
            }
        }, duration);
        
        res.json({ 
            message: "Appareils en vibration pour une durée limitée", 
            deviceCount: deviceList.length,
            intensity: intensity,
            duration: duration
        });
    } catch (error) {
        console.error("Erreur lors de la vibration:", error);
        res.status(500).json({ error: "Échec de la vibration", details: error.message });
    }
});

app.post("/vibrate-with-intensity-all-text/", async (req, res) => {
    const text = req.body.text;
    
    try {
        // Appel au backend Python pour évaluer l'excitabilité du texte
       const intensity = scoreSexuelle(text)

        const deviceList = Array.from(devices.values());
        for (const device of deviceList) {
            await device.vibrate(intensity);
        }
        
        res.json({ message: "Appareils en vibration avec intensité basée sur le texte", intensity: intensity });
    } catch (error) {
        res.status(500).json({ error: "Échec de l'évaluation du texte ou de la vibration", details: error.message });
    }
});

// Route pour arrêter un appareil
app.post("/stop/:id", async (req, res) => {
    const device = devices.get(parseInt(req.params.id));
    if (!device) {
        return res.status(404).json({ error: "Device not found" });
    }

    try {
        await device.stop();
        res.json({ message: "Device stopped" });
    } catch (error) {
        res.status(500).json({ error: "Failed to stop device", details: error.message });
    }
});

// Route pour récupérer le niveau de batterie d'un appareil
app.get("/battery/:id", async (req, res) => {
    const device = devices.get(parseInt(req.params.id));
    if (!device) {
        return res.status(404).json({ error: "Device not found" });
    }

    if (!device.hasBattery) {
        return res.status(400).json({ error: "Device does not support battery status" });
    }

    try {
        const batteryLevel = await device.battery();
        res.json({ battery: batteryLevel });
    } catch (error) {
        res.status(500).json({ error: "Failed to get battery level", details: error.message });
    }
});

// Lancement du serveur
app.listen(port, async () => {
    console.log(`Server running on http://localhost:${port}`);

    try {
        await client.connect(connector);
        console.log("Connected to Buttplug WebSocket Server");
    } catch (error) {
        console.error("Error connecting to Buttplug server:", error);
    }
});
