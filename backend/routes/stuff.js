const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
// const multer = require('../middleware/multer-config');

const stuffCtrl = require('../controllers/stuff');

// read
router.get('/', stuffCtrl.getAllBooks);
router.get('/', stuffCtrl.getOneBook);
router.get('/', stuffCtrl.getBestRatedBooks);
// update
router.put('/', auth, stuffCtrl.updateOneBook);
// create
router.post('/:id', auth, stuffCtrl.rankOneBook);
router.post('/:id', auth, stuffCtrl.createBook);
// delete
router.delete('/:id', auth, stuffCtrl.deleteOneBook);

module.exports = router;