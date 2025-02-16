const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer'); // Added multer for file uploads
const path = require('path'); // Added path module for handling file paths

const app = express();

app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/Login-SignUp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

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
    uploadedBy: {
        type: String,
        required: true // Ensure that each canvas has an uploader's username
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
    // Check if the username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
        return res.status(400).json({ message: 'Username or email already exists' });
    }
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    try {
        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(400).json({ message: 'Invalid username or password' });
    }
    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid username or password' });
    }
    // Generate a JWT token (optional, depending on your authentication strategy)
    const token = jwt.sign({ userId: user._id }, 'your_secret_key');
    res.status(200).json({ token });
});

// Add a canvas to the database
app.post('/api/canvases', async (req, res) => {
    const { imageUrl, description, uploadedBy } = req.body;
    const canvas = new Canvas({ imageUrl, description, uploadedBy });
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

// Multer storage configuration for handling file uploads
const storage = multer.diskStorage({
    // Define the destination directory for uploaded files
    destination: (req, file, cb) => {
        const dirPath = path.join(__dirname, '/images'); // Corrected path to 'src/images'
        cb(null, dirPath); // Pass the directory path to cb
    },
    filename: (req, file, cb) => {
        // Set the file name
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage }); // Initialize multer with storage settings

// File upload endpoint
app.post('/upload', upload.single('photoFile'), async (req, res) => {
    if (req.file) {
        // Construct the image URL to be stored in the databasesrc/Images/photoFile-1739668690406.JPG
        const imageUrl = `src/images/${req.file.filename}`; // Adjusted path to match the served static directory
        const description = req.body.photoName;
        const uploadedBy = req.body.username || 'Anonymous'; // Get username from request or default to 'Anonymous'

        // Save the canvas information to the database
        const canvas = new Canvas({ imageUrl, description, uploadedBy });
        try {
            await canvas.save();
            res.json({ filePath: imageUrl });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(400).json({ message: 'Error uploading file' });
    }
});

// Serve static files from the src/images folder so images are accessible
app.use('/images', express.static(path.join(__dirname, '/images')));

// Optional root route for verification
app.get('/', (req, res) => {
    res.send('Welcome to the API');
});

// Start the server
app.listen(3001, () => {
    console.log('Server is running on port 3001');
});
