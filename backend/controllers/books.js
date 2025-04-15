Book = require('../models/Book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
  console.log('req.body:', req.body);
  console.log('req.body.book:', req.body.book);
  console.log('req.file:', req.file);
  if (!req.body.book) {
    return res.status(400).json({ message: 'Missing book data' });
  }

  let bookData;
  try {
    bookData = JSON.parse(req.body.book);
    console.log('Parsed book data:', bookData);
  } catch (err) {
    console.error('Erreur de parsing JSON', err);
    return res.status(400).json({ message: 'Invalid JSON in book field' });
  }

  const { title, author, year, genre, ratings } = bookData;

  if (!title || !author || !year || !genre) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;

  const ratingsWithUser = (ratings || []).map(rating => ({
    ...rating,
    userId: req.auth.userId
  }));

  const book = new Book({
    title,
    author,
    year,
    genre,
    userId: req.auth.userId,
    imageUrl,
    ratings: ratingsWithUser,
    averageRating: ratingsWithUser.length
      ? ratingsWithUser.reduce((sum, r) => sum + r.grade, 0) / ratingsWithUser.length
      : 0
  });

  book.save()
    .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
    .catch((error) => res.status(400).json({ error }));
};



exports.getAllBooks = (req, res, next)=> {
  Book.find()
  .then((books) => {res.status(200).json(books)})
  .catch((error)=> {res.status(400).json({error})})
};

exports.getOneBook = (req, res, next)=> {
  Book.findOne({_id: req.params.id})
  .then((book) => {res.status(200).json(book)})
  .catch((error)=> {res.status(400).json({error})})
};

exports.getBestRatedBooks = (req, res, next)=> {
  Book.find()
  .then((books) => {res.status(200).json(books)})
  .catch((error)=> {res.status(400).json({error})})
};

exports.updateOneBook = (req, res, next) => {
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    image: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
} : { ...req.body };
delete bookObject.userId;
Book.findOne({_id: req.params.id})
    .then((book) => {
        if (book.userId != req.auth.userId) {
            res.status(401).json({ message : 'Not authorized'});
        } else {
            Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
            .then(() => res.status(200).json({message : 'Objet modifié!'}))
            .catch(error => res.status(401).json({ error }));
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
          res.status(401).json({message: 'Not authorized'});
      } else {
          const filename = book.imageUrl.split('/images/')[1];
          fs.unlink(`images/${filename}`, () => {
              book.deleteOne({_id: req.params.id})
                  .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                  .catch(error => res.status(401).json({ error }));
          });
      }
  })
  .catch( error => {
      res.status(500).json({ error });
  });
};

exports.rankOneBook = (req, res, next)=> {};






