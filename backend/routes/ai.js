const express = require('express');
const { enhanceNote, summarizeNote, autoTag, getSuggestions, formatNote, chatWithNote, generateFlashcards, processAll, semanticSearch } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/enhance', enhanceNote);
router.post('/summarize', summarizeNote);
router.post('/tag', autoTag);
router.post('/suggestions', getSuggestions);
router.post('/format', formatNote);
router.post('/chat', chatWithNote);
router.post('/flashcards', generateFlashcards);
router.post('/process-all', processAll);
router.post('/semantic-search', semanticSearch);

module.exports = router;
