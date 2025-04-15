const express = require('express');
const router = express.Router();

// const auth = require('../middleware/auth');
// const multer = require('../middleware/multer-config');

const booksCtrl = require('../controllers/books');

// read
router.get('/', booksCtrl.getAllBooks);
router.get('/:id', booksCtrl.getOneBook);
router.get('/bestrating', booksCtrl.getBestRatedBooks);
// update
router.put('/:id', booksCtrl.updateOneBook);
// create
router.post('/:id/rating', booksCtrl.rankOneBook);
router.post('/', booksCtrl.createBook);
// delete
router.delete('/:id', booksCtrl.deleteOneBook);

module.exports = router;