const Note = require('../models/Note');

const normalizeTags = (tags = []) => (
  Array.isArray(tags)
    ? [...new Set(tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean))]
    : []
);

const normalizeTitle = (title) => {
  if (title === undefined) return undefined;
  return String(title).trim() || 'Untitled Note';
};

// @desc    Get all notes for user
// @route   GET /api/notes
const getNotes = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, tag, archived } = req.query;
    const query = { user: req.user._id };

    if (archived === 'true') {
      query.isArchived = true;
    } else {
      query.isArchived = { $ne: true };
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (category) query.category = new RegExp(category, 'i');
    if (tag) query.tags = tag.toLowerCase();

    const notes = await Note.find(query)
      .sort({ isPinned: -1, updatedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-flashcards');

    const total = await Note.countDocuments(query);

    res.json({
      success: true,
      notes,
      pagination: {
        total,
        pages: Math.ceil(total / parseInt(limit)),
        current: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
};

// @desc    Get single note
// @route   GET /api/notes/:id
const getNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ error: 'Note not found' });

    // Increment view count
    note.viewCount += 1;
    await note.save({ validateBeforeSave: false });

    res.json({ success: true, note });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch note' });
  }
};

// @desc    Create note
// @route   POST /api/notes
const createNote = async (req, res) => {
  try {
    const { title, content = '', tags, category, color } = req.body;

    const note = await Note.create({
      user: req.user._id,
      title: normalizeTitle(title),
      content,
      originalContent: content,
      tags: normalizeTags(tags),
      category: category || 'General',
      color: color || '#1a1a2e'
    });

    res.status(201).json({ success: true, note });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
};

// @desc    Update note
// @route   PUT /api/notes/:id
const updateNote = async (req, res) => {
  try {
    const { title, content, tags, category, color, isPinned, isArchived, enhancedContent, summary, bulletPoints, keyHighlights, aiSuggestions, formattedContent, flashcards, isEnhanced } = req.body;

    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ error: 'Note not found' });

    // Update fields if provided
    if (title !== undefined) note.title = normalizeTitle(title);
    if (content !== undefined) {
      note.content = content;
      if (!note.originalContent) note.originalContent = content;
    }
    if (tags !== undefined) note.tags = normalizeTags(tags);
    if (category !== undefined) note.category = category;
    if (color !== undefined) note.color = color;
    if (isPinned !== undefined) note.isPinned = isPinned;
    if (isArchived !== undefined) note.isArchived = isArchived;
    if (enhancedContent !== undefined) note.enhancedContent = enhancedContent;
    if (summary !== undefined) note.summary = summary;
    if (bulletPoints !== undefined) note.bulletPoints = bulletPoints;
    if (keyHighlights !== undefined) note.keyHighlights = keyHighlights;
    if (aiSuggestions !== undefined) note.aiSuggestions = aiSuggestions;
    if (formattedContent !== undefined) note.formattedContent = formattedContent;
    if (flashcards !== undefined) note.flashcards = flashcards;
    if (isEnhanced !== undefined) note.isEnhanced = isEnhanced;

    await note.save();
    res.json({ success: true, note });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
};

// @desc    Delete note
// @route   DELETE /api/notes/:id
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
};

// @desc    Search notes
// @route   GET /api/notes/search
const searchNotes = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, notes: [] });

    const notes = await Note.find({
      user: req.user._id,
      isArchived: { $ne: true },
      $text: { $search: q }
    }, {
      score: { $meta: 'textScore' }
    })
    .sort({ score: { $meta: 'textScore' } })
    .limit(20)
    .select('-flashcards');

    res.json({ success: true, notes });
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
};

// @desc    Get user's categories and tags
// @route   GET /api/notes/meta
const getNoteMeta = async (req, res) => {
  try {
    const categories = await Note.distinct('category', { user: req.user._id, isArchived: { $ne: true } });
    const tags = await Note.distinct('tags', { user: req.user._id, isArchived: { $ne: true } });
    res.json({ success: true, categories, tags });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch meta' });
  }
};

module.exports = { getNotes, getNote, createNote, updateNote, deleteNote, searchNotes, getNoteMeta };
