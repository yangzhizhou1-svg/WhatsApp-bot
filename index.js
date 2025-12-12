const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint utama untuk menerima perintah dari HTML
app.post('/react', async (req, res) => {
    const { link, emojis } = req.body;
    
    // Menggunakan API dari source code yang Anda kirimkan
    const emojiString = Array.isArray(emojis) ? emojis.join(',') : emojis;
    const targetUrl = `https://api-faa.my.id/faa/react-channel?url=${encodeURIComponent(link)}&react=${encodeURIComponent(emojiString)}`;

    try {
        const response = await fetch(targetUrl);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ status: "error", message: "Gagal terhubung ke API WhatsApp-bot" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proyek WhatsApp-bot aktif pada port ${PORT}`));
