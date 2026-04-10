const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    default: '',
    maxlength: [50000, 'Content cannot exceed 50000 characters']
  },
  originalContent: {
    type: String  // Store original before AI enhancement
  },
  enhancedContent: {
    type: String  // AI-enhanced version
  },
  summary: {
    type: String  // AI-generated summary
  },
  bulletPoints: [{
    type: String
  }],
  keyHighlights: [{
    type: String
  }],
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  category: {
    type: String,
    default: 'General',
    trim: true
  },
  aiSuggestions: [{
    type: String
  }],
  relatedIdeas: [{
    type: String
  }],
  formattedContent: {
    type: String  // Auto-formatted version
  },
  isEnhanced: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: '#1a1a2e'
  },
  flashcards: [{
    question: String,
    answer: String
  }],
  viewCount: {
    type: Number,
    default: 0
  },
  wordCount: {
    type: Number,
    default: 0
  },
  readTime: {
    type: Number,  // in minutes
    default: 0
  }
}, { timestamps: true });

// Text index for semantic search
noteSchema.index({ title: 'text', content: 'text', tags: 'text', category: 'text' });

// Calculate word count and read time before saving
noteSchema.pre('save', function(next) {
  const text = this.content || '';
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  this.wordCount = words;
  this.readTime = Math.ceil(words / 200); // avg 200 wpm
  next();
});

module.exports = mongoose.model('Note', noteSchema);
