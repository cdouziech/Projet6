require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const userRoutes = require('./routes/user');
const booksRoutes = require('./routes/books');
const app = express();

mongoose.connect(process.env.MONGODB_URI)
.then(()=> console.log('Connexion à MongoDB réussie !'))
.catch((error) => console.log('Connexion à MongoDB échouée : ', error))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use('/images', express.static(path.join(__dirname,'images')));
app.use(express.json());
app.use('/api/books', booksRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;