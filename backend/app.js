const express = require('express');
const mongoose = require('mongoose');
const app = express();

mongoose.connect('mongodb+srv://clotairedouziech:MDPTEST@cluster0.y8oio9r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
.then(()=> console.log('Connexion à MongoDB réussie !'))
.catch((error) => console.log('Connexion à MongoDB échouée : ', error))

module.exports = app;