import express from "express";
import pg from 'pg';
import cors from "cors";
import cookieParser from "cookie-parser";
import { Connector } from '@google-cloud/cloud-sql-connector';
const { Pool } = pg;
import { 
        readUser, createUser,
        createTodoList, deleteCookie,
        readTodoList, readUserName,
        updateTodoListTitle, updateTodoListDescription,
        updateTodoListDate, updateTodoListStatus,
        deleteTodoList
} from "./queries/queries.js";

const connector = new Connector();
const clientOpts = await connector.getOptions({
    instanceConnectionName: process.env.INSTANCE_CONNECTION_NAME,
    ipType: 'PUBLIC'
});

export const pool = new Pool({
    ...clientOpts,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    max: 5
});

const app = express();

app.use(cookieParser());
app.use(cors({origin: '*', credentials: true}));
app.use(express.json());
app.get('/', (req, res, next) => {
    res.send('hello world!');
});
app.post('/login', readUser);
app.post('/signup', createUser);
app.post('/add/todo_list', createTodoList)
app.get('/logout', deleteCookie);
app.get('/get/todo_list', readTodoList);
app.get('/get/users/name', readUserName);
app.put('/update/todo_list/title', updateTodoListTitle);
app.put('/update/todo_list/description', updateTodoListDescription);
app.put('/update/todo_list/date', updateTodoListDate);
app.put('/update/todo_list/status', updateTodoListStatus);
app.delete('/delete/todo_list', deleteTodoList);

const port = parseInt(process.env.PORT) || 8080;
app.listen(port, async () => {
    console.log('process.env: ', process.env);
    console.log(`Server listening on port ${port}`);
});

