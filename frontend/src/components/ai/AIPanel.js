import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { X, Send, Zap, FileText, Lightbulb, BookOpen, RotateCcw, ChevronRight } from 'lucide-react';
import { useNotes } from '../../context/NotesContext';
import { aiAPI } from '../../services/api';

const TABS = [
  { id: 'chat', label: 'Ask AI', icon: <Send size={14} /> },
  { id: 'summary', label: 'Summary', icon: <FileText size={14} /> },
  { id: 'suggestions', label: 'Ideas', icon: <Lightbulb size={14} /> },
  { id: 'flashcards', label: 'Cards', icon: <BookOpen size={14} /> }
];

export default function AIPanel({ onClose }) {
  const { selectedNote, updateNote } = useNotes();
  const [tab, setTab] = useState('chat');
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [flippedCard, setFlippedCard] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  useEffect(() => {
    if (selectedNote) {
      setChat([]);
      setInput('');
      setFlippedCard(null);
      setSummaryData(
        selectedNote.summary
          ? {
            summary: selectedNote.summary,
            bulletPoints: selectedNote.bulletPoints || [],
            keyHighlights: selectedNote.keyHighlights || []
          }
          : null
      );
      setFlashcards(selectedNote.flashcards || []);
      setSuggestions(
        selectedNote.aiSuggestions?.length
          ? {
            suggestions: selectedNote.aiSuggestions || [],
            relatedIdeas: selectedNote.relatedIdeas || []
          }
          : null
      );
    }
  }, [selectedNote]);

  const sendChat = async () => {
    if (!input.trim() || loading) return;
    const userMessage = { role: 'user', content: input };
    setChat((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiAPI.chat({
        noteId: selectedNote._id,
        question: input,
        history: chat.slice(-6)
      });
      setChat((prev) => [...prev, { role: 'assistant', content: response.data.answer }]);
    } catch {
      toast.error('AI chat failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!selectedNote?.content) return toast.error('No content to summarize');
    setLoading(true);
    try {
      const response = await aiAPI.summarize({ content: selectedNote.content, noteId: selectedNote._id });
      setSummaryData(response.data);
      await updateNote(selectedNote._id, {
        summary: response.data.summary,
        bulletPoints: response.data.bulletPoints,
        keyHighlights: response.data.keyHighlights
      });
      toast.success('Summary generated!');
    } catch {
      toast.error('Summarization failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestions = async () => {
    if (!selectedNote?.content) return toast.error('No content');
    setLoading(true);
    try {
      const response = await aiAPI.getSuggestions({ content: selectedNote.content, noteId: selectedNote._id });
      setSuggestions(response.data);
      await updateNote(selectedNote._id, {
        aiSuggestions: [...(response.data.suggestions || []), ...(response.data.missingPoints || [])],
        relatedIdeas: response.data.relatedIdeas || []
      });
      toast.success('Suggestions ready!');
    } catch {
      toast.error('Failed to get suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleFlashcards = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.generateFlashcards({ noteId: selectedNote._id });
      setFlashcards(response.data.flashcards);
      await updateNote(selectedNote._id, { flashcards: response.data.flashcards });
      toast.success(`${response.data.flashcards.length} flashcards created!`);
    } catch {
      toast.error('Flashcard generation failed');
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Summarize this note',
    'What are the key takeaways?',
    'Explain this simply',
    'Give me 3 action items'
  ];

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.aiDot} />
          <span style={styles.headerTitle}>AI Assistant</span>
          <span className="ai-badge">AI</span>
        </div>
        <button className="btn btn-ghost btn-icon" onClick={onClose} style={{ padding: 6 }}>
          <X size={16} />
        </button>
      </div>

      <div style={styles.tabs}>
        {TABS.map((tabItem) => (
          <button
            key={tabItem.id}
            style={{ ...styles.tab, ...(tab === tabItem.id ? styles.tabActive : {}) }}
            onClick={() => setTab(tabItem.id)}
          >
            {tabItem.icon} {tabItem.label}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {tab === 'chat' && (
          <div style={styles.chatContainer}>
            <div style={styles.messages}>
              {chat.length === 0 && (
                <div style={styles.welcomeSection}>
                  <div style={styles.welcomeIcon}>AI</div>
                  <p style={styles.welcomeText}>Ask me anything about this note</p>
                  <div style={styles.quickPrompts}>
                    {quickPrompts.map((prompt) => (
                      <button key={prompt} style={styles.quickPrompt} onClick={() => setInput(prompt)}>
                        {prompt} <ChevronRight size={12} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {chat.map((message, index) => (
                <div key={index} style={{ ...styles.message, ...(message.role === 'user' ? styles.userMessage : styles.aiMessage) }}>
                  {message.role === 'assistant' && <div style={styles.aiAvatar}>AI</div>}
                  <div style={{ ...styles.messageBubble, ...(message.role === 'user' ? styles.userBubble : styles.aiBubble) }}>
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ ...styles.message, ...styles.aiMessage }}>
                  <div style={styles.aiAvatar}>AI</div>
                  <div style={{ ...styles.messageBubble, ...styles.aiBubble }}>
                    <div style={styles.typingDots}>
                      <span /><span /><span />
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            <div style={styles.chatInput}>
              <input
                style={styles.chatInputField}
                placeholder="Ask about this note..."
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && !event.shiftKey && sendChat()}
                disabled={loading}
              />
              <button className="btn btn-primary btn-icon" onClick={sendChat} disabled={loading || !input.trim()} style={{ padding: '8px 10px', flexShrink: 0 }}>
                <Send size={15} />
              </button>
            </div>
          </div>
        )}

        {tab === 'summary' && (
          <div style={styles.tabContent}>
            {!summaryData ? (
              <div style={styles.actionSection}>
                <div style={styles.actionIcon}><FileText size={28} color="#8b5cf6" /></div>
                <h4 style={styles.actionTitle}>Generate Summary</h4>
                <p style={styles.actionDesc}>AI will create a concise summary, bullet points, and key highlights from your note.</p>
                <button className="btn btn-primary" onClick={handleSummarize} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                  {loading ? <><div className="spinner" style={{ width: 16, height: 16, borderTopColor: '#fff' }} /> Working...</> : <><Zap size={15} /> Summarize Note</>}
                </button>
              </div>
            ) : (
              <div style={styles.summaryResult}>
                <div style={styles.summarySection}>
                  <h5 style={styles.sectionLabel}>Summary</h5>
                  <p style={styles.summaryText}>{summaryData.summary}</p>
                </div>
                {summaryData.bulletPoints?.length > 0 && (
                  <div style={styles.summarySection}>
                    <h5 style={styles.sectionLabel}>Key Points</h5>
                    <ul style={styles.bulletList}>
                      {summaryData.bulletPoints.map((point, index) => <li key={index} style={styles.bulletItem}>{point}</li>)}
                    </ul>
                  </div>
                )}
                {summaryData.keyHighlights?.length > 0 && (
                  <div style={styles.summarySection}>
                    <h5 style={styles.sectionLabel}>Highlights</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {summaryData.keyHighlights.map((highlight, index) => (
                        <div key={index} style={styles.highlight}>{highlight}</div>
                      ))}
                    </div>
                  </div>
                )}
                <button className="btn btn-secondary btn-sm" onClick={handleSummarize} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                  <RotateCcw size={13} /> Regenerate
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'suggestions' && (
          <div style={styles.tabContent}>
            {!suggestions ? (
              <div style={styles.actionSection}>
                <div style={styles.actionIcon}><Lightbulb size={28} color="#f59e0b" /></div>
                <h4 style={styles.actionTitle}>Get AI Suggestions</h4>
                <p style={styles.actionDesc}>Get ideas, improvements, missing points, and related concepts for your note.</p>
                <button className="btn btn-primary" onClick={handleSuggestions} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                  {loading ? <><div className="spinner" style={{ width: 16, height: 16, borderTopColor: '#fff' }} /> Thinking...</> : <><Lightbulb size={15} /> Generate Ideas</>}
                </button>
              </div>
            ) : (
              <div style={styles.summaryResult}>
                {suggestions.suggestions?.length > 0 && (
                  <div style={styles.summarySection}>
                    <h5 style={styles.sectionLabel}>Improvements</h5>
                    {suggestions.suggestions.map((item, index) => (
                      <div key={index} style={styles.suggestionItem}>
                        <span style={styles.suggestionNum}>{index + 1}</span>
                        <span style={styles.suggestionText}>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
                {suggestions.relatedIdeas?.length > 0 && (
                  <div style={styles.summarySection}>
                    <h5 style={styles.sectionLabel}>Related Ideas</h5>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {suggestions.relatedIdeas.map((idea, index) => (
                        <span key={index} style={styles.ideaTag}>{idea}</span>
                      ))}
                    </div>
                  </div>
                )}
                <button className="btn btn-secondary btn-sm" onClick={handleSuggestions} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                  <RotateCcw size={13} /> Regenerate
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'flashcards' && (
          <div style={styles.tabContent}>
            {flashcards.length === 0 ? (
              <div style={styles.actionSection}>
                <div style={styles.actionIcon}><BookOpen size={28} color="#10b981" /></div>
                <h4 style={styles.actionTitle}>Generate Flashcards</h4>
                <p style={styles.actionDesc}>AI will create Q&A flashcards from your note to help you study and remember.</p>
                <button className="btn btn-primary" onClick={handleFlashcards} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                  {loading ? <><div className="spinner" style={{ width: 16, height: 16, borderTopColor: '#fff' }} /> Creating...</> : <><BookOpen size={15} /> Generate Flashcards</>}
                </button>
              </div>
            ) : (
              <div style={styles.flashcardsList}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={styles.flashcardCount}>{flashcards.length} cards · Click to flip</span>
                  <button className="btn btn-ghost btn-sm" onClick={handleFlashcards} disabled={loading}>
                    <RotateCcw size={13} /> Redo
                  </button>
                </div>
                {flashcards.map((card, index) => (
                  <div
                    key={index}
                    style={{ ...styles.flashcard, ...(flippedCard === index ? styles.flashcardFlipped : {}) }}
                    onClick={() => setFlippedCard(flippedCard === index ? null : index)}
                  >
                    <div style={styles.flashcardSide}>
                      {flippedCard === index ? (
                        <>
                          <span style={styles.cardLabel}>Answer</span>
                          <p style={{ ...styles.cardText, color: '#10b981' }}>{card.answer}</p>
                        </>
                      ) : (
                        <>
                          <span style={styles.cardLabel}>Question {index + 1}</span>
                          <p style={styles.cardText}>{card.question}</p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  panel: { display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-secondary)' },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    borderBottom: '1px solid var(--border)'
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  aiDot: { width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6', boxShadow: '0 0 8px rgba(139,92,246,0.6)' },
  headerTitle: { fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' },
  tabs: {
    display: 'flex',
    padding: '8px 10px',
    borderBottom: '1px solid var(--border)',
    gap: 2
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '6px 10px',
    borderRadius: 8,
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
    flex: 1,
    justifyContent: 'center'
  },
  tabActive: { background: 'rgba(139,92,246,0.15)', color: '#7c3aed' },
  content: { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  chatContainer: { display: 'flex', flexDirection: 'column', height: '100%' },
  messages: { flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: 12 },
  welcomeSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '20px 0' },
  welcomeIcon: { fontSize: 36, fontWeight: 700, color: '#7c3aed' },
  welcomeText: { fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' },
  quickPrompts: { display: 'flex', flexDirection: 'column', gap: 6, width: '100%' },
  quickPrompt: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '9px 12px',
    borderRadius: 10,
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    fontSize: 12,
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  message: { display: 'flex', gap: 8, alignItems: 'flex-start' },
  userMessage: { flexDirection: 'row-reverse' },
  aiMessage: { flexDirection: 'row' },
  aiAvatar: {
    width: 26,
    height: 26,
    borderRadius: 8,
    flexShrink: 0,
    background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    color: '#fff',
    fontWeight: 700
  },
  messageBubble: {
    maxWidth: '85%',
    padding: '10px 14px',
    borderRadius: 12,
    fontSize: 13,
    lineHeight: 1.6
  },
  userBubble: { background: '#8b5cf6', color: '#fff', borderBottomRightRadius: 4 },
  aiBubble: { background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderBottomLeftRadius: 4 },
  typingDots: { display: 'flex', gap: 4, alignItems: 'center', padding: '2px 0' },
  chatInput: {
    display: 'flex',
    gap: 8,
    padding: '12px',
    borderTop: '1px solid var(--border)'
  },
  chatInputField: {
    flex: 1,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: '9px 14px',
    color: 'var(--text-primary)',
    fontSize: 13,
    outline: 'none'
  },
  tabContent: { flex: 1, overflowY: 'auto', padding: '16px' },
  actionSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 14,
    textAlign: 'center',
    padding: '24px 8px'
  },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    background: 'rgba(139,92,246,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionTitle: { fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' },
  actionDesc: { fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 },
  summaryResult: { display: 'flex', flexDirection: 'column', gap: 20 },
  summarySection: { display: 'flex', flexDirection: 'column', gap: 8 },
  sectionLabel: { fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' },
  summaryText: { fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 },
  bulletList: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 },
  bulletItem: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
    paddingLeft: 14,
    position: 'relative'
  },
  highlight: {
    padding: '8px 12px',
    borderRadius: 8,
    background: 'rgba(139,92,246,0.08)',
    border: '1px solid rgba(139,92,246,0.15)',
    fontSize: 13,
    color: 'var(--text-secondary)',
    lineHeight: 1.5
  },
  suggestionItem: {
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: 8
  },
  suggestionNum: {
    width: 22,
    height: 22,
    borderRadius: 6,
    flexShrink: 0,
    background: 'rgba(139,92,246,0.15)',
    color: '#7c3aed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 700
  },
  suggestionText: { fontSize: 13, color: 'var(--text-secondary)' },
  ideaTag: {
    padding: '4px 10px',
    borderRadius: 20,
    fontSize: 12,
    background: 'rgba(6,182,212,0.1)',
    color: '#0f8aa8',
    border: '1px solid rgba(6,182,212,0.2)'
  },
  flashcardsList: { display: 'flex', flexDirection: 'column', gap: 8 },
  flashcardCount: { fontSize: 12, color: 'var(--text-secondary)' },
  flashcard: {
    padding: '16px',
    borderRadius: 12,
    cursor: 'pointer',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    transition: 'all 0.2s',
    minHeight: 80
  },
  flashcardFlipped: {
    background: 'rgba(16,185,129,0.05)',
    border: '1px solid rgba(16,185,129,0.2)'
  },
  flashcardSide: { display: 'flex', flexDirection: 'column', gap: 6 },
  cardLabel: { fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' },
  cardText: { fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }
};
