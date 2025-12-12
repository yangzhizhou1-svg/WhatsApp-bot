const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const express = require("express");
const cors = require("cors");
const pino = require("pino");

const app = express();
app.use(cors());
app.use(express.json());

async function startBot() {
    // Railway akan menyimpan sesi WA di folder auth_session agar tidak perlu scan ulang
    const { state, saveCreds } = await useMultiFileAuthState('auth_session');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true, // QR akan muncul di Log Railway
        logger: pino({ level: 'silent' })
    });

    sock.ev.on('creds.update', saveCreds);

    // Endpoint untuk menerima perintah react dari HTML
    app.post("/react", async (req, res) => {
        const { link, emojis } = req.body;
        try {
            // Memecah link: https://whatsapp.com/channel/ID_CHANNEL/ID_PESAN
            const parts = link.split('/');
            const messageId = parts.pop();
            const channelId = parts[parts.length - 1] + "@newsletter";

            for (const emoji of emojis) {
                await sock.sendMessage(channelId, {
                    react: { 
                        text: emoji.trim(), 
                        key: { remoteJid: channelId, id: messageId, fromMe: false } 
                    }
                });
            }
            res.json({ status: "success" });
        } catch (err) {
            res.status(500).json({ status: "error", message: err.message });
        }
    });

    console.log("Server Bot WA Siap...");
}

startBot();

// Railway menggunakan PORT dinamis, jadi harus menggunakan process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
