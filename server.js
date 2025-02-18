import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/inicio', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'inicio', 'login.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard', 'panel.html'));
});

app.get('/users', (req, res) => {
    fs.readFile(path.join(__dirname, 'data','users.json'), 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error al leer el archivo users.json');
            return;
        }
        res.json(JSON.parse(data));
    });
});

app.get('/datosbi', (req, res) => {
    fetch('https://api.powerbi.com/v1.0/myorg/reports', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer TU_ACCESS_TOKEN',
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
    
});


app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});