const express = require('express');
const { getNotes, getNote, createNote, updateNote, deleteNote, searchNotes, getNoteMeta } = require('../controllers/noteController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/search', searchNotes);
router.get('/meta', getNoteMeta);
router.get('/', getNotes);
router.get('/:id', getNote);
router.post('/', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;
