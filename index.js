const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors'); // Importa cors

const app = express();
const jsonParser = bodyParser.json();

app.use(cors()); // Usa cors

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

// Endpoint para agregar un todo
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

// Endpoint para obtener la lista de todos
app.get('/todos', function (req, res) {
    const sql = 'SELECT * FROM todos';
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send(err.message);
            return;
        }
        res.json(rows);
    });
});

// Ruta principal
app.get('/', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 'status': 'ok' }));
});

// Endpoint de login
app.post('/login', jsonParser, function (req, res) {
    console.log(req.body);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 'status': 'ok' }));
});

// Función para probar la petición POST
async function testPostRequest() {
    const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

    const response = await fetch('http://localhost:3000/agrega_todo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ todo: 'Prueba de todo' })
    });

    if (response.status === 201) {
        console.log('¡Agregaste el todo exitosamente!');
    } else {
        console.error('Error al agregar el todo');
    }
}

// Corremos el servidor en el puerto 3000
const port = 3000;

app.listen(port, () => {
    console.log(`Aplicación corriendo en http://localhost:${port}`);
    // Llamamos a la función de prueba después de que el servidor esté corriendo
    testPostRequest();
});
