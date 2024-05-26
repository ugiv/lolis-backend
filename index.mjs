const express = require("express");
const app = express();
const db = require("./queries/queries");
import { Connector } from '@google-cloud/cloud-sql-connector';
import pg from 'pg';
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { Pool } = pg;

const connector = new Connector();
const clientOpts = await connector.getOptions({
    instanceConnectionName: process.env.INSTANCE_CONNECTION_NAME,
    ipType: "PUBLIC"
});

const pool = new Pool({
    ...clientOpts,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    max: 5
});
const port = parseInt(process.env.PORT) || 8080;

app.use(cookieParser());
app.use(cors({origin: "http://localhost:3000", credentials: true}));
app.use(express.json());
app.get('/', (req, res, next) => {
    res.send('hello world!')
});
app.post('/login', db.readUser);
app.post('/signup', db.createUser);
app.post('/add/todo_list', db.createTodoList)
app.get('/logout', db.deleteCookie)
app.get('/get/todo_list', db.readTodoList)
app.get('/get/users/name', db.readUserName);
app.put('/update/todo_list/title', db.updateTodoListTitle);
app.put('/update/todo_list/description', db.updateTodoListDescription)
app.put('/update/todo_list/date', db.updateTodoListDate)
app.put('/update/todo_list/status', db.updateTodoListStatus);
app.delete('/delete/todo_list', db.deleteTodoList)
app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
});


module.exports = {
    pool,
}