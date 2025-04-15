const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

const userRoutes = require('./routes/user');
const booksRoutes = require('./routes/books');

mongoose.connect('mongodb+srv://clotairedouziech:MDPTEST@cluster0.y8oio9r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
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