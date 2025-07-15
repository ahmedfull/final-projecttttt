const express = require('express');
const cors = require('cors');
const router = require('./router/router.js');
const db = require('./config/config.js');
require('dotenv').config();
const path = require('path');
const nodemailer = require('nodemailer')
// import { getCart } from './controller/CartController.js';

const app = express();
const port = 3000;

app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // ✅ CRUCIAL!

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));  // or more if needed
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// Routes
app.use('/' ,  router);

// Start server
app.listen(port, () => {
    console.log(`Server listening on port ${port} 🚀🚀`);
});