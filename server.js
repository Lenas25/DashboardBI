import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '/public')));

app.get('/inicio', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/inicio/login.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/dashboard/panel.html'));
});

app.get('/api/users', (req, res) => {
    fs.readFile(path.join(__dirname, '/data/users.json'), 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error al leer el archivo users.json');
            return;
        }
        res.json(JSON.parse(data));
    });
});

app.listen(port, () => {
    console.log('Servidor iniciado en http://localhost:3000');
});
