// Importamos las librerías requeridas
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

// Documentación en https://expressjs.com/en/starter/hello-world.html
const app = express();

// Creamos un parser de tipo application/json
// Documentación en https://expressjs.com/en/resources/middleware/body-parser.html
const jsonParser = bodyParser.json();

// Abre la base de datos de SQLite
let db = new sqlite3.Database('./base.sqlite3', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Conectado a la base de datos SQLite.');

    db.run(`CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        todo TEXT NOT NULL,
        created_at INTEGER
    )`, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Tabla "todos" creada o ya existente.');
        }
    });
});

// Creamos un endpoint para agregar un todo que recibe los datos como JSON
app.post('/agrega_todo', jsonParser, function (req, res) {
    const { todo } = req.body;

    if (!todo) {
        res.status(400).send('Falta información necesaria');
        return;
    }

    const createdAt = Math.floor(Date.now() / 1000); // Unix timestamp
    const stmt = db.prepare('INSERT INTO todos (todo, created_at) VALUES (?, ?)');

    stmt.run(todo, createdAt, function(err) {
        if (err) {
            console.error("Error al ejecutar el statement:", err);
            res.status(500).send(err.message);
            return;
        }
        console.log("Inserción exitosa!");
        res.status(201).json({ id: this.lastID, todo, created_at: createdAt });
    });

    stmt.finalize();
});

// Ruta principal
app.get('/', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 'status': 'ok' }));
});

// Creamos un endpoint de login que recibe los datos como JSON
app.post('/login', jsonParser, function (req, res) {
    console.log(req.body);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 'status': 'ok' }));
});

// Corremos el servidor en el puerto 3000
const port = 3000;

app.listen(port, () => {
    console.log(`Aplicación corriendo en http://localhost:${port}`);
});
