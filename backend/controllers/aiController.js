const Anthropic = require('@anthropic-ai/sdk');
const Note = require('../models/Note');

const hasAnthropicKey = Boolean(process.env.ANTHROPIC_API_KEY);
const client = hasAnthropicKey ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest';

const CATEGORY_KEYWORDS = {
  Study: ['study', 'learn', 'course', 'exam', 'lecture', 'research', 'lesson'],
  Work: ['meeting', 'project', 'deadline', 'client', 'team', 'roadmap', 'task'],
  Personal: ['journal', 'family', 'life', 'habit', 'goal', 'reflection'],
  Finance: ['budget', 'invest', 'finance', 'money', 'expense', 'saving', 'stock'],
  Health: ['health', 'fitness', 'workout', 'nutrition', 'sleep', 'wellness'],
  Technology: ['code', 'software', 'api', 'javascript', 'react', 'node', 'database'],
  Ideas: ['idea', 'brainstorm', 'concept', 'startup', 'product', 'vision'],
  Travel: ['trip', 'travel', 'flight', 'hotel', 'itinerary', 'destination'],
  Food: ['recipe', 'food', 'meal', 'restaurant', 'cook', 'ingredient'],
  Entertainment: ['movie', 'book', 'music', 'show', 'game', 'podcast']
};

const normalizeWhitespace = (value = '') => value.replace(/\r\n/g, '\n').replace(/[ \t]+\n/g, '\n').trim();

const sentenceChunks = (content = '') => normalizeWhitespace(content)
  .split(/(?<=[.!?])\s+|\n+/)
  .map((item) => item.trim())
  .filter(Boolean);

const extractKeywords = (content = '', limit = 6) => {
  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'that', 'this', 'from', 'your', 'have', 'will',
    'into', 'about', 'there', 'their', 'them', 'they', 'then', 'than', 'what',
    'when', 'where', 'while', 'were', 'been', 'being', 'also', 'just', 'over',
    'such', 'very', 'some', 'more', 'most', 'only', 'note', 'notes'
  ]);

  const words = normalizeWhitespace(content).toLowerCase().match(/[a-z][a-z0-9-]{2,}/g) || [];
  const frequency = words.reduce((acc, word) => {
    if (!stopWords.has(word)) acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([word]) => word);
};

const detectCategory = (content = '') => {
  const lowered = content.toLowerCase();
  let bestCategory = 'General';
  let bestScore = 0;

  Object.entries(CATEGORY_KEYWORDS).forEach(([category, keywords]) => {
    const score = keywords.reduce((sum, keyword) => sum + (lowered.includes(keyword) ? 1 : 0), 0);
    if (score > bestScore) {
      bestCategory = category;
      bestScore = score;
    }
  });

  return bestCategory;
};

const fallbackEnhance = (content = '') => sentenceChunks(content).join('\n\n') || normalizeWhitespace(content);

const fallbackSummary = (content = '') => {
  const sentences = sentenceChunks(content);
  const summary = sentences.slice(0, 2).join(' ') || normalizeWhitespace(content).slice(0, 280);
  return {
    summary,
    bulletPoints: sentences.slice(0, 5),
    keyHighlights: extractKeywords(content, 4)
  };
};

const fallbackTagging = (content = '') => ({
  tags: extractKeywords(content, 5),
  category: detectCategory(content)
});

const fallbackSuggestions = (content = '') => {
  const keywords = extractKeywords(content, 3);
  return {
    suggestions: [
      'Add a short opening summary so the note is easier to revisit later.',
      'Break longer sections into headings or bullets for faster scanning.',
      'Capture one concrete next step or decision to make the note more actionable.'
    ],
    relatedIdeas: keywords.map((keyword) => `Explore ${keyword} in more depth`),
    missingPoints: [
      'Clarify the goal or context behind this note.',
      'List any open questions that still need follow-up.'
    ]
  };
};

const fallbackFormat = (content = '') => {
  const lines = sentenceChunks(content);
  if (!lines.length) return '';
  return ['# Structured Note', '', ...lines.map((line) => `- ${line}`)].join('\n');
};

const fallbackFlashcards = (content = '') => sentenceChunks(content)
  .slice(0, 6)
  .map((line, index) => ({
    question: `What is key idea ${index + 1}?`,
    answer: line
  }));

const fallbackChat = (note, question) => {
  const summary = fallbackSummary(note.content);
  const bulletList = summary.bulletPoints.length
    ? summary.bulletPoints.map((item) => `- ${item}`).join('\n')
    : '- Add more detail to this note for a stronger answer.';

  return `Based on "${note.title}", here is a helpful response.\n\nQuestion: ${question}\n\nSummary: ${summary.summary || 'This note is still fairly short.'}\n\nKey points:\n${bulletList}`;
};

const fallbackSemanticSearch = (notes = [], query = '') => {
  const terms = extractKeywords(query, 8);
  return notes
    .map((note) => {
      const haystack = `${note.title} ${note.content} ${(note.tags || []).join(' ')} ${note.category}`.toLowerCase();
      const score = terms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0);
      return { note, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((item) => item.note);
};

const parseJsonResponse = (text, fallbackValue) => {
  try {
    const clean = String(text).replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return fallbackValue;
  }
};

const callClaude = async (prompt, systemPrompt = '', maxTokens = 1500) => {
  if (!client) {
    throw new Error('Anthropic API key is not configured');
  }

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: systemPrompt || undefined,
    messages: [{ role: 'user', content: prompt }]
  });

  return response.content[0].text;
};

const tryClaude = async (prompt, systemPrompt = '', maxTokens = 1500) => {
  if (!client) return null;

  try {
    return await callClaude(prompt, systemPrompt, maxTokens);
  } catch (error) {
    console.warn('Claude request failed, using local fallback:', error.message);
    return null;
  }
};

const tryClaudeMessages = async (options) => {
  if (!client) return null;

  try {
    const response = await client.messages.create(options);
    return response.content[0]?.text || null;
  } catch (error) {
    console.warn('Claude chat request failed, using local fallback:', error.message);
    return null;
  }
};

const enhanceNote = async (req, res) => {
  try {
    const { content, noteId } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });

    const enhanced = (
      await tryClaude(
        `Please enhance the following note by fixing grammar, improving clarity, expanding incomplete thoughts, and making it more coherent. Return ONLY the enhanced text, no explanations:\n\n${content}`,
        'You are an expert writing assistant. Enhance the given text while preserving the author\'s voice and intent.',
        2000
      )
    ) || fallbackEnhance(content);

    if (noteId) {
      await Note.findOneAndUpdate(
        { _id: noteId, user: req.user._id },
        { enhancedContent: enhanced, isEnhanced: true }
      );
    }

    res.json({ success: true, enhanced });
  } catch (error) {
    console.error('Enhance error:', error);
    res.status(500).json({ error: 'AI enhancement failed' });
  }
};

const summarizeNote = async (req, res) => {
  try {
    const { content, noteId } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });

    const aiResult = await tryClaude(
      `Analyze this text and return a JSON object with these exact fields:
{
  "summary": "2-3 sentence summary",
  "bulletPoints": ["point 1", "point 2", "point 3"],
  "keyHighlights": ["highlight 1", "highlight 2"]
}

Text to analyze:
${content}

Return ONLY valid JSON, no markdown or explanation.`,
      'You are an expert at summarizing and extracting key information from text.',
      1500
    );
    const parsed = aiResult
      ? parseJsonResponse(aiResult, fallbackSummary(content))
      : fallbackSummary(content);

    if (noteId) {
      await Note.findOneAndUpdate(
        { _id: noteId, user: req.user._id },
        {
          summary: parsed.summary,
          bulletPoints: parsed.bulletPoints,
          keyHighlights: parsed.keyHighlights
        }
      );
    }

    res.json({ success: true, ...parsed });
  } catch (error) {
    console.error('Summarize error:', error);
    res.status(500).json({ error: 'AI summarization failed' });
  }
};

const autoTag = async (req, res) => {
  try {
    const { content, noteId } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });

    const aiResult = await tryClaude(
      `Analyze this text and return a JSON object:
{
  "tags": ["tag1", "tag2", "tag3"],
  "category": "Main Category Name"
}

Possible categories: Study, Work, Personal, Finance, Health, Technology, Ideas, Travel, Food, Entertainment, General
Tags should be lowercase, relevant keywords.

Text:
${content}

Return ONLY valid JSON.`,
      'You are an expert content categorizer.',
      500
    );
    const parsed = aiResult
      ? parseJsonResponse(aiResult, fallbackTagging(content))
      : fallbackTagging(content);

    if (noteId) {
      await Note.findOneAndUpdate(
        { _id: noteId, user: req.user._id },
        { tags: parsed.tags, category: parsed.category }
      );
    }

    res.json({ success: true, ...parsed });
  } catch (error) {
    console.error('Auto-tag error:', error);
    res.status(500).json({ error: 'AI tagging failed' });
  }
};

const getSuggestions = async (req, res) => {
  try {
    const { content, noteId } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });

    const aiResult = await tryClaude(
      `Based on this note, provide helpful suggestions as a JSON object:
{
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "relatedIdeas": ["idea 1", "idea 2", "idea 3"],
  "missingPoints": ["missing point 1", "missing point 2"]
}

Note content:
${content}

Return ONLY valid JSON.`,
      'You are a knowledgeable assistant helping to improve and expand notes.',
      1000
    );
    const parsed = aiResult
      ? parseJsonResponse(aiResult, fallbackSuggestions(content))
      : fallbackSuggestions(content);

    if (noteId) {
      await Note.findOneAndUpdate(
        { _id: noteId, user: req.user._id },
        {
          aiSuggestions: [...(parsed.suggestions || []), ...(parsed.missingPoints || [])],
          relatedIdeas: parsed.relatedIdeas || []
        }
      );
    }

    res.json({ success: true, ...parsed });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ error: 'AI suggestions failed' });
  }
};

const formatNote = async (req, res) => {
  try {
    const { content, noteId } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });

    const formatted = (
      await tryClaude(
        `Format this text with proper headings, bullet points, and structure using markdown. Make it clean and readable:\n\n${content}\n\nReturn ONLY the formatted markdown text.`,
        'You are an expert at formatting and structuring text content.',
        2000
      )
    ) || fallbackFormat(content);

    if (noteId) {
      await Note.findOneAndUpdate(
        { _id: noteId, user: req.user._id },
        { formattedContent: formatted }
      );
    }

    res.json({ success: true, formatted });
  } catch (error) {
    console.error('Format error:', error);
    res.status(500).json({ error: 'AI formatting failed' });
  }
};

const chatWithNote = async (req, res) => {
  try {
    const { noteId, question, history = [] } = req.body;
    if (!noteId || !question) return res.status(400).json({ error: 'Note ID and question required' });

    const note = await Note.findOne({ _id: noteId, user: req.user._id });
    if (!note) return res.status(404).json({ error: 'Note not found' });

    const normalizedHistory = history
      .slice(-6)
      .filter((item) => item?.role === 'user' || item?.role === 'assistant')
      .map((item) => ({ role: item.role, content: item.content }));

    const answer = (
      await tryClaudeMessages({
        model: MODEL,
        max_tokens: 1000,
        system: `You are an AI assistant helping the user understand and work with their note. Here is the note content:\n\nTitle: ${note.title}\n\nContent:\n${note.content}\n\nAnswer questions about this note clearly and helpfully.`,
        messages: [
          ...normalizedHistory,
          { role: 'user', content: question }
        ]
      })
    ) || fallbackChat(note, question);

    res.json({ success: true, answer });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'AI chat failed' });
  }
};

const generateFlashcards = async (req, res) => {
  try {
    const { noteId } = req.body;
    if (!noteId) return res.status(400).json({ error: 'Note ID required' });

    const note = await Note.findOne({ _id: noteId, user: req.user._id });
    if (!note) return res.status(404).json({ error: 'Note not found' });

    const aiResult = await tryClaude(
      `Generate 5-8 flashcards from this note as a JSON array:
[
  {"question": "Question 1?", "answer": "Answer 1"},
  {"question": "Question 2?", "answer": "Answer 2"}
]

Note content:
${note.content}

Return ONLY valid JSON array.`,
      'You are an expert at creating educational flashcards.',
      1500
    );
    const flashcards = aiResult
      ? parseJsonResponse(aiResult, fallbackFlashcards(note.content))
      : fallbackFlashcards(note.content);

    await Note.findByIdAndUpdate(noteId, { flashcards });
    res.json({ success: true, flashcards });
  } catch (error) {
    console.error('Flashcards error:', error);
    res.status(500).json({ error: 'Flashcard generation failed' });
  }
};

const processAll = async (req, res) => {
  try {
    const { content, noteId } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });

    const aiResult = await tryClaude(
      `Perform a comprehensive analysis of this note and return a JSON object with ALL of the following:
{
  "enhanced": "Grammar-corrected and clarity-improved version of the text",
  "summary": "2-3 sentence summary",
  "bulletPoints": ["key point 1", "key point 2", "key point 3"],
  "keyHighlights": ["highlight 1", "highlight 2"],
  "tags": ["tag1", "tag2", "tag3"],
  "category": "Category Name",
  "suggestions": ["improvement suggestion 1", "improvement suggestion 2"],
  "relatedIdeas": ["related idea 1", "related idea 2"],
  "formatted": "Markdown-formatted version with headings and structure"
}

Text to analyze:
${content}

Return ONLY valid JSON, no markdown wrapping.`,
      'You are an expert AI writing and analysis assistant.',
      3000
    );
    let parsed = aiResult ? parseJsonResponse(aiResult, null) : null;

    if (!parsed) {
      const summary = fallbackSummary(content);
      const tagging = fallbackTagging(content);
      const suggestions = fallbackSuggestions(content);
      parsed = {
        enhanced: fallbackEnhance(content),
        summary: summary.summary,
        bulletPoints: summary.bulletPoints,
        keyHighlights: summary.keyHighlights,
        tags: tagging.tags,
        category: tagging.category,
        suggestions: suggestions.suggestions,
        relatedIdeas: suggestions.relatedIdeas,
        formatted: fallbackFormat(content)
      };
    }

    if (noteId) {
      await Note.findOneAndUpdate(
        { _id: noteId, user: req.user._id },
        {
          enhancedContent: parsed.enhanced,
          summary: parsed.summary,
          bulletPoints: parsed.bulletPoints,
          keyHighlights: parsed.keyHighlights,
          tags: parsed.tags,
          category: parsed.category,
          aiSuggestions: parsed.suggestions,
          relatedIdeas: parsed.relatedIdeas,
          formattedContent: parsed.formatted,
          isEnhanced: true
        }
      );
    }

    res.json({ success: true, ...parsed });
  } catch (error) {
    console.error('Process all error:', error);
    res.status(500).json({ error: 'AI processing failed' });
  }
};

const semanticSearch = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    const notes = await Note.find({ user: req.user._id, isArchived: { $ne: true } })
      .select('title content tags category _id')
      .limit(50);

    if (notes.length === 0) return res.json({ success: true, results: [] });

    if (!client) {
      return res.json({ success: true, results: fallbackSemanticSearch(notes, query) });
    }

    const noteSummaries = notes
      .map((note) => `ID:${note._id}|TITLE:${note.title}|CONTENT:${note.content.substring(0, 200)}`)
      .join('\n---\n');

    const aiResult = await tryClaude(
      `Given the search query: "${query}"

Find the most relevant notes from this list and return their IDs as a JSON array ordered by relevance:
["id1", "id2", "id3"]

Notes:
${noteSummaries}

Return ONLY a JSON array of IDs for relevant notes. Include up to 10 most relevant.`,
      'You are a semantic search engine that understands meaning and context.',
      500
    );
    const ids = aiResult ? parseJsonResponse(aiResult, []) : [];

    const results = ids
      .map((id) => notes.find((note) => note._id.toString() === id))
      .filter(Boolean);

    res.json({ success: true, results: results.length ? results : fallbackSemanticSearch(notes, query) });
  } catch (error) {
    console.error('Semantic search error:', error);
    res.status(500).json({ error: 'Semantic search failed' });
  }
};

module.exports = {
  enhanceNote,
  summarizeNote,
  autoTag,
  getSuggestions,
  formatNote,
  chatWithNote,
  generateFlashcards,
  processAll,
  semanticSearch
};
