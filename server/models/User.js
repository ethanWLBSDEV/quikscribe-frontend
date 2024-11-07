// server/models/userModel.js
import bcrypt from 'bcrypt';
import db from '../config/db.js';

export const createUser = async (name, email, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return new Promise((resolve, reject) => {
        db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword], 
            (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
    });
};

export const findUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
            if (err) reject(err);
            resolve(results[0]);
        });
    });
};
