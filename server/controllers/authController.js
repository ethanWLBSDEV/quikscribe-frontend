const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail } = require('../models/User');

exports.signup = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        await createUser(name, email, password);
        res.status(201).send("User registered successfully");
    } catch (error) {
        res.status(500).send("Error registering user");
    }
};

exports.signin = async (req, res) => {
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
