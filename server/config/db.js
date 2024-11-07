// server/controllers/authController.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { createUser, findUserByEmail } from '../models/User.js';

export const signup = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        await createUser(name, email, password);
        res.status(201).send("User registered successfully");
    } catch (error) {
        res.status(500).send("Error registering user");
    }
};

export const signin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await findUserByEmail(email);
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });
        } else {
            res.status(400).send("Invalid credentials");
        }
    } catch (error) {
        res.status(500).send("Error logging in user");
    }
};
