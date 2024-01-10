const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const screenshot = require('screenshot-desktop');
const fs = require('fs');
const sharp = require('sharp');  // Importation de la bibliothèque sharp

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));

// Handle root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('screen', () => {
        setInterval(() => {
            screenshot({ filename: 'name.png' }).then((imgPath) => {
                // Rogner l'image avec sharp
                sharp(imgPath)
                    .extract({ left: 1380, top: 510, width: 500, height: 500 }) // Utilisation des coordonnées fournies
                    .toBuffer()
                    .then((croppedImageBuffer) => {
                        const base64Image = croppedImageBuffer.toString('base64');
                        socket.emit('image', { data: base64Image });
                    })
                    .catch((err) => {
                        console.error('Erreur lors du rognage de l\'image:', err);
                    });
            }).catch((err) => {
                console.error('Erreur lors de la capture de l\'écran:', err);
            });
        }, 20);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(process.env.PORT || 5000);
