import { pool } from "../index.mjs";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const { decode, sign } = jwt;
const { hash, genSalt, compareSync } = bcrypt;
const saltRound = 10;

export const emailChecker = async (req, res, next) => {
    const {email} = req.body;
    pool.query("SELECT email WHERE email = $1", [email], (error, results) => {
        if (error){
            next();
        }
        res.status(200).json({status: "Email already used"});
    });
}

// CREATE QUERIES

export const createUser = async (req, res) => {
    const {name, email, password} = req.body;
    const id = Math.floor(Math.random() * 1999);
    const salt = await genSalt(saltRound);
    const securePassword = await hash(password, salt);
    try {
        pool.query('SELECT email FROM users WHERE email = $1', [email], (error, results) => {
            if (results.rows[0]) {
                return res.status(200).json({status: "email already exist"});
            }
            pool.query('INSERT INTO users(id, name, email, password) VALUES($1, $2, $3, $4)', [id, name, email, securePassword], (error, results) => {
                if (error) {
                    console.log(id, name, email, securePassword);
                    res.status(200).json({status: "fail to signup"});
                } else {
                    res.status(201).json({status: "ok"});
                }
            });
        })
    } catch (err) {
        console.log("Error in signup process.")
    }
};

export const createTodoList = async (req, res) => {
    const { title, description, date, status } = req.body;
    const token = req.cookies.access_token;
    const cookies_data = decode(token, "mejaputihpunyaugi123");
    pool.query('INSERT INTO todo_list(user_id, title, description, date, status) VALUES($1, $2, $3, $4, $5)', [cookies_data.user_id, title, description, date, status], (error, results) => {
        if (error) {
            throw error;
        } else {
            res.status(200).json({status: "ok", response: results.rows});
        }
    });
}

// READ QUERIES

export const readUser = async (req, res) => {
    const {email, password} = req.body;
    pool.query('SELECT * FROM users WHERE email = $1', [email], (error, results) => {
        if (error) {
            res.status(200).json({status: "Your email is false!"});
        } else {
            const passwordValidation = compareSync(password, results.rows[0].password);
            if (passwordValidation){
                const token = sign({
                    user_id: results.rows[0].id 
                }, "mejaputihpunyaugi123");
                console.log(token);
                res.cookie("access_token", token, {
                    secure: false,
                    httpOnly: true,
                    sameSite: "LAX",
                    maxAge: 7 * 24 * 60 * 60 * 1000
                });
                res.status(200).json({status: "ok"});
            } else {
                res.status(200).json({status: "Your password is false"})
            }
        }
    });
}

export const readTodoList = async (req, res) => {
    const token = req.cookies.access_token;
    const cookies_data = decode(token, "mejaputihpunyaugi123");
    pool.query('SELECT * FROM todo_list WHERE user_id = $1', [cookies_data.user_id], (error, results) => {
        if (error) {
            throw error
        } else {
            res.status(200).json({status: "ok", response: results.rows})
        }
    });
}

export const readUserName = async (req, res) => {
    const token = req.cookies.access_token;
    console.log(token);
    const cookies_data = decode(token, 'mejaputihpunyaugi123');
    pool.query('SELECT name FROM users WHERE id = $1', [cookies_data.user_id], (error, results) => {
        if (error) {
            throw error;
        } else {
            res.status(200).json({status: 'ok', response: results.rows[0].name});
        }
    });
}

// UPDATE QUERIES

export const updateTodoListStatus = async (req, res) => {
    const {status, id} = req.body;
    const token = req.cookies.access_token;
    const cookies_data = decode(token, 'mejaputihpunyaugi123');
    pool.query('UPDATE todo_list SET status = $1 WHERE id = $2 and user_id = $3', [status, id, cookies_data.user_id], (error, results) => {
        if (error) {
            throw error;
        } else {
            res.status(200).json({status: 'ok'});
        }
    })
}

export const updateTodoListTitle = async (req, res) => {
    const {title, id} = req.body;
    const token = req.cookies.access_token;
    const cookies_data = decode(token, 'mejaputihpunyaugi123');
    pool.query('UPDATE todo_list SET title = $1 WHERE id = $2 AND user_id = $3', [title, id, cookies_data.user_id], (error, results) => {
        if (error) {
            throw error;
        } else {
            res.status(200).json({status: 'ok'});
        }
    })
}

export const updateTodoListDescription = async (req, res) => {
    const {description, id} = req.body;
    const token = req.cookies.access_token;
    const cookies_data = decode(token, 'mejaputihpunyaugi123');
    pool.query('UPDATE todo_list SET description = $1 WHERE id = $2 AND user_id = $3', [description, id, cookies_data.user_id], (error, results) => {
        if (error) {
            throw error;
        } else {
            res.status(200).json({status: 'ok'});
        }
    })
}

export const updateTodoListDate = async (req, res) => {
    const {date, id} = req.body;
    const token = req.cookies.access_token;
    const cookies_data = decode(token, 'mejaputihpunyaugi123');
    pool.query('UPDATE todo_list SET date = $1 WHERE id = $2 AND user_id = $3', [date, id, cookies_data.user_id], (error, result) => {
        if (error) {
            throw error;
        } else {
            res.status(200).json({status: 'oke'})
        }
    });
}

// DELETE QUERIES

export const deleteCookie = (req, res) => {
    res.clearCookie("access_token");
    res.send("succes logout!");
}

export const deleteTodoList = async (req, res) => {
    const { id } = req.body;
    const token = req.cookies.access_token;
    const cookies_data = decode(token, "mejaputihpunyaugi123");
    pool.query('DELETE FROM todo_list WHERE user_id = $1 AND id = $2', [cookies_data.user_id, id], (error, results) => {
        if (error) {
            throw error;
        } else {
            res.status(200).json({status: "ok"});
        }
    });
}

// module.exports = {
//     emailChecker,
//     createUser,
//     createTodoList,
//     readUser,
//     readUserName,
//     readTodoList,
//     updateTodoListStatus,
//     updateTodoListTitle,
//     updateTodoListDescription,
//     updateTodoListDate,
//     deleteCookie,
//     deleteTodoList
// }