const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const booksCtrl = require('../controllers/books');

// read
router.get('/', booksCtrl.getAllBooks);
router.get('/bestrating', booksCtrl.getBestRatedBooks);
router.get('/:id', booksCtrl.getOneBook);
// update
router.put('/:id', auth, multer, booksCtrl.updateOneBook);
// create
router.post('/:id/rating', auth, booksCtrl.rankOneBook);
router.post('/', auth, multer, booksCtrl.createBook);
// delete
router.delete('/:id', auth, booksCtrl.deleteOneBook);

module.exports = router;