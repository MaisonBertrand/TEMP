const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/Login-SignUp', { useNewUrlParser: true, useUnifiedTopology: true });

// Canvas Schema and Model
const canvasSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { collection: 'canvases' }); // Explicitly specify the collection name

const Canvas = mongoose.model('Canvas', canvasSchema);

// User Schema and Model
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
});

const User = mongoose.model('User', userSchema);

// Signup endpoint
app.post('/api/signup', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(400).json({ message: 'Invalid username or password' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid username or password' });
    }
    const token = jwt.sign({ userId: user._id }, '34d46476dd823a69f0a0ca2aab9a2d0da153b257d19334b5b5373a53f5796656');
    res.status(200).json({ token });
});

// Add a canvas to the database
app.post('/api/canvases', async (req, res) => {
    const { imageUrl, description } = req.body;
    const canvas = new Canvas({ imageUrl, description });
    try {
        await canvas.save();
        res.status(201).json({ message: 'Canvas added successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all canvases from the database
app.get('/api/canvases', async (req, res) => {
    try {
        const canvases = await Canvas.find();
        res.json(canvases);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3001, () => {
    console.log('Server is running on port 3001');
});

// Optional root route for verification
app.get('/', (req, res) => {
    res.send('Welcome to the API');
});
