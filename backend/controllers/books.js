Book = require('../models/Book');
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

const calculateAverageRating = (ratings) => {
  let sum = 0;
  len= ratings.length
  for(let i=0; i<len ; i++){
    sum += ratings[i].grade;
  };
  return (sum/len).toFixed(1); // fonction de moyenne classique
};

exports.createBook = async (req, res, next) => {

  let bookData;
  try {
    bookData = JSON.parse(req.body.book);
  } catch (err) {
    return res.status(400).json({ message: 'invalid json' });
  } 
  // récupérer les données , les parser et les stocker dans bookData

  const { title, author, year, genre } = bookData;
  const rating = bookData.ratings[0].grade;
  //stocker les données récupéré dans des constantes associés

  if (!title || !author || !year || !genre || !rating) {
    return res.status(400).json({ message: 'cannot add book, missing a data' });
  }
  if (!req.file) {
    return res.status(400).json({ message: "cannot add book, no image loaded" });
  }
  //gestion de l'erreur en cas de manquement d'une donnée

  const originalImgBuffer = req.file.buffer
  const imgFilename = Date.now() + req.file.originalname.split(".")[0] +".webp";
  const imgPath = path.join('images', imgFilename);
  await sharp(originalImgBuffer)
    .resize({ width: 520 })
    .webp({ quality: 70 })
    .toFile(imgPath);
  const imageUrl = `${req.protocol}://${req.get('host')}/images/${imgFilename}`;
  // gestion de l'image

  const ratings = [{
    userId: req.auth.userId,
    grade: rating
  }];
  // création du tableau ratings du livre, conformément aux directives

  const book = new Book({
    title,
    author,
    year,
    genre,
    userId: req.auth.userId,
    imageUrl,
    ratings,
    averageRating: rating
  });
  // création de l'objet book avec les doonées de bookData

  book.save()
    .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
    .catch((error) => res.status(400).json({ error }));
  // sauvegarde de l'objet dans la DB
};

exports.getAllBooks = (req, res, next)=> {
  Book.find()
  .then((books) => {res.status(200).json(books)})
  .catch((error)=> {res.status(400).json({error})})
  //renvoie tous les Book
};

exports.getOneBook = (req, res, next)=> {
  Book.findOne({_id: req.params.id})
  .then((book) => {res.status(200).json(book)})
  .catch((error)=> {res.status(400).json({error})})
  // renvoie un book selon le critère {_id: req.params.id} qui regarde l'URL
};

exports.getBestRatedBooks = (req, res, next)=> {
  Book.find()
  .sort({ averageRating: -1 })
  .limit(3)
  .then((books) => {res.status(200).json(books)})
  .catch((error)=> {res.status(400).json({error})})
  // Renvoie tous les books, les trie par ordre décroissant par rapport au averageRating
  // puis affiche seulement les 3 premiers
};

exports.updateOneBook = (req, res, next) => {

  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    image: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };
  // on regarde si l'utilisateur change l'image car la requête sera traité différement
  // en fonction de ça

  delete bookObject.userId;
  // on a pas besoin du userId car l'objet est déjà créé

  Book.findOne({_id: req.params.id})
      .then((book) => {
          if (book.userId != req.auth.userId) {
              res.status(403).json({ message : 'unauthorized request'});
              // on regarde si l'user en question est bien le créateur du livre
          } else {
              Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
              .then(() => res.status(200).json({message : 'Objet modifié!'}))
              .catch(error => res.status(401).json({ error }));
              // on modifie l'objet avec les modifications nécessaires
          }
      })
      .catch((error) => {
          res.status(400).json({ error });
      });
};

exports.deleteOneBook = (req, res, next)=> {
  Book.findOne({ _id: req.params.id})
  .then(book => {
      if (book.userId != req.auth.userId) {
          res.status(403).json({message: 'unauthorized request'});
          // on regarde si l'user en question est bien le créateur du livre
      } else {
          const filename = book.imageUrl.split('/images/')[1];
          fs.unlink(`images/${filename}`, () => {  
          // on supprime l'image avec unlink (fs)
              Book.deleteOne({_id: req.params.id})
                  .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                  .catch(error => res.status(401).json({ error }));
              // on supprime l'objet
          });
      }
  })
  .catch( error => {
      res.status(500).json({ error });
  });
};
exports.rankOneBook = (req, res, next) => {
  const newRating = {
    userId: req.auth.userId,
    grade: req.body.rating,
  }; // récupère la note

  Book.findOne({ _id: req.params.id })
    .then((book) => {

      const alreadyRated = book.ratings.some(rating => rating.userId === req.auth.userId);
      if (alreadyRated) {
        return res.status(400).json({ message: 'Vous avez déjà noté ce livre.' });
      } // gestion d'erreur en cas de notation déjà présente

      book.ratings.push(newRating); // ajoute la note
      book.averageRating = calculateAverageRating(book.ratings); // calcule la nouvelle moyenne

      book.save()
        .then((updatedBook) => res.status(200).json(updatedBook))
        .catch((error) => res.status(400).json({ error }));
      // enregistre les modifications
    })
    .catch((error) => res.status(500).json({ error }));
};





