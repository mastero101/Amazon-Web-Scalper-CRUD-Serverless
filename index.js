const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise'); // Usar mysql2/promise para soporte de promesas
const fs = require('fs'); // Importar el módulo 'fs' para leer el certificado CA

require('dotenv').config();

const dbConfig = {
    host: process.env.HOST,
    port: process.env.PORT,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    ssl: {
        ca: fs.readFileSync('./ca.pem') // Ruta al certificado CA
    }
};

const pool = mysql.createPool(dbConfig); // No es necesario usar .promise() si ya estás usando mysql2/promise

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.all('/', (req, res) => {
    console.log("Just got a request!");
    res.send('Webscalper Amazon Works');
});

app.get('/items', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM amazon');
        res.send(rows);
    } catch (error) {
        console.error('Error al obtener datos de la base de datos:', error);
        res.status(500).send('Error al obtener datos de la base de datos.');
    }
});

app.get('/items/prices', async (req, res) => {
    try {
        const [rows] = await pool.execute("SELECT id, precio FROM amazon WHERE precio");
        res.send(rows);
    } catch (error) {
        console.error('Error al obtener datos de la base de datos:', error);
        res.status(500).send('Error al obtener datos de la base de datos.');
    }
});

app.get('/models/:model', async (req, res) => {
    const model = req.params.model;
    const query = 'SELECT * FROM amazon WHERE modelo LIKE ?';
    const searchTerm = `%${model}%`;
    try {
        const [rows] = await pool.execute(query, searchTerm);
        if (rows.length === 0) {
            res.status(404).send('No se encontró ningún usuario con el ID proporcionado.');
        } else {
            res.send(rows[0]);
        }
    } catch (error) {
        console.error('Error al obtener datos de la base de datos:', error);
        res.status(500).send('Error al obtener datos de la base de datos.');
    }
});

app.get('/procesadores', async (req, res) => {
    try {
        const [rows] = await pool.execute("SELECT modelo, precio, tienda, url, img, consumo, socket FROM componentes WHERE tipo = 'procesador'");
        res.send(rows);
    } catch (error) {
        console.error('Error al obtener datos de la base de datos:', error);
        res.status(500).send('Error al obtener datos de la base de datos.');
    }
});

app.post('/item', async (req, res) => {
    const data = req.body;
    try {
        const result = await pool.query('INSERT INTO amazon SET ?', data);
        console.log("Item Registrado");
        res.send(result);
    } catch (error) {
        console.error('Error al insertar datos en la base de datos:', error);
        res.status(500).send('Error al insertar datos en la base de datos.');
    }
});

app.put('/:id', async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    try {
        const result = await pool.query('UPDATE amazon SET ? WHERE id = ?', [data, id]);
        res.send(result);
    } catch (error) {
        console.error('Error al actualizar datos en la base de datos:', error);
        res.status(500).send('Error al actualizar datos en la base de datos.');
    }
});

app.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await pool.query('DELETE FROM amazon WHERE id = ?', id);
        res.send(result);
    } catch (error) {
        console.error('Error al eliminar datos de la base de datos:', error);
        res.status(500).send('Error al eliminar datos de la base de datos.');
    }
});

const PORT = process.env.PORTSERVICE || 3000;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
