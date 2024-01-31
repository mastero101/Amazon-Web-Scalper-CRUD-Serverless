const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

require('dotenv').config();

const dbConfig = {
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: 3306,
    ssl: false
};

const pool = mysql.createPool(dbConfig);

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

app.get('/items', (req, res) => {
    pool.query('SELECT * FROM amazon', (error, results, fields) => {
        if (error) {
            console.error('Error al obtener datos de la base de datos:', error);
            res.status(500).send('Error al obtener datos de la base de datos.');
            return;
        }
        res.send(results);
    });
});

app.get('/items/prices', (req, res) => {
    pool.query("SELECT id, precio FROM amazon WHERE precio", (error, results, fields) => {
        if (error) {
            console.error('Error al obtener datos de la base de datos:', error);
            res.status(500).send('Error al obtener datos de la base de datos.');
            return;
        }
        res.send(results);
    });
});

app.get('/models/:model', (req, res) => {
    const model = req.params.model;
    const query = 'SELECT * FROM amazon WHERE modelo LIKE ?';
    const searchTerm = `%${model}%`;
    pool.query(query, searchTerm, (error, results, fields) => {
      if (error) {
        console.error('Error al obtener datos de la base de datos:', error);
        res.status(500).send('Error al obtener datos de la base de datos.');
        return;
      }
      if (results.length === 0) {
        res.status(404).send('No se encontró ningún usuario con el ID proporcionado.');
        return;
      }
      res.send(results[0]);
    });
});

app.get('/procesadores', (req, res) => {
    pool.query("SELECT modelo, precio, tienda, url, img, consumo, socket FROM componentes WHERE tipo = 'procesador'", (error, results, fields) => {
        if (error) {
            console.error('Error al obtener datos de la base de datos:', error);
            res.status(500).send('Error al obtener datos de la base de datos.');
            return;
        }
        res.send(results);
    });
});

app.post('/item', (req, res) => {
    const data = req.body;
    pool.query('INSERT INTO amazon SET ?', data, (error, results, fields) => {
        if (error) {
            console.error('Error al insertar datos en la base de datos:', error);
            res.status(500).send('Error al insertar datos en la base de datos.');
            return;
        }
	console.log("Item Registrado");
        res.send(results);
    });
});

app.put('/:id', (req, res) => {
    const id = req.params.id;
    const data = req.body;
    pool.query('UPDATE amazon SET ? WHERE id = ?', [data, id], (error, results, fields) => {
        if (error) {
            console.error('Error al actualizar datos en la base de datos:', error);
            res.status(500).send('Error al actualizar datos en la base de datos.');
            return;
        }
        res.send(results);
    });
});

app.delete('/:id', (req, res) => {
    const id = req.params.id;
    pool.query('DELETE FROM amazon WHERE id = ?', id, (error, results, fields) => {
        if (error) {
            console.error('Error al eliminar datos de la base de datos:', error);
            res.status(500).send('Error al eliminar datos de la base de datos.');
            return;
        }
        res.send(results);
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
