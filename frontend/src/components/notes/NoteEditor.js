import React, { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import {
  Save, Trash2, Pin, Archive, Sparkles, Wand2, Tag,
  Eye, Code, Bot, MoreHorizontal, Download
} from 'lucide-react';
import { useNotes } from '../../context/NotesContext';
import { aiAPI } from '../../services/api';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function NoteEditor({ onOpenAI, aiPanelOpen }) {
  const { selectedNote, updateNote, deleteNote } = useNotes();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [viewMode, setViewMode] = useState('edit');
  const [showMore, setShowMore] = useState(false);
  const saveTimer = useRef(null);

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title || '');
      setContent(selectedNote.content || '');
    }
  }, [selectedNote]);

  const scheduleSave = useCallback((newTitle, newContent) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      if (!selectedNote) return;
      setSaving(true);
      try {
        await updateNote(selectedNote._id, { title: newTitle, content: newContent });
      } finally {
        setSaving(false);
      }
    }, 1000);
  }, [selectedNote, updateNote]);

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
    scheduleSave(event.target.value, content);
  };

  const handleContentChange = (event) => {
    setContent(event.target.value);
    scheduleSave(title, event.target.value);
  };

  const handleSave = async () => {
    if (!selectedNote) return;
    setSaving(true);
    try {
      await updateNote(selectedNote._id, { title, content });
      toast.success('Saved!');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleAIAction = async (action) => {
    if (!content.trim()) return toast.error('Add some content first');
    setAiLoading(true);
    const toastId = toast.loading(`AI is ${action === 'enhance' ? 'enhancing' : action === 'processAll' ? 'processing' : 'working'}...`);

    try {
      let response;

      if (action === 'enhance') {
        response = await aiAPI.enhance({ content, noteId: selectedNote._id });
        setContent(response.data.enhanced);
        await updateNote(selectedNote._id, {
          content: response.data.enhanced,
          enhancedContent: response.data.enhanced,
          isEnhanced: true
        });
        toast.success('Note enhanced!', { id: toastId });
      } else if (action === 'format') {
        response = await aiAPI.format({ content, noteId: selectedNote._id });
        setContent(response.data.formatted);
        await updateNote(selectedNote._id, {
          content: response.data.formatted,
          formattedContent: response.data.formatted
        });
        toast.success('Note formatted!', { id: toastId });
      } else if (action === 'processAll') {
        response = await aiAPI.processAll({ content, noteId: selectedNote._id });
        setContent(response.data.enhanced);
        await updateNote(selectedNote._id, {
          content: response.data.enhanced,
          enhancedContent: response.data.enhanced,
          summary: response.data.summary,
          bulletPoints: response.data.bulletPoints,
          keyHighlights: response.data.keyHighlights,
          tags: response.data.tags,
          category: response.data.category,
          aiSuggestions: response.data.suggestions,
          relatedIdeas: response.data.relatedIdeas,
          formattedContent: response.data.formatted,
          isEnhanced: true
        });
        toast.success('Full AI analysis complete!', { id: toastId });
      } else if (action === 'autoTag') {
        response = await aiAPI.autoTag({ content, noteId: selectedNote._id });
        await updateNote(selectedNote._id, {
          tags: response.data.tags,
          category: response.data.category
        });
        toast.success(`Tagged: ${response.data.category}`, { id: toastId });
      }
    } catch {
      toast.error('AI action failed', { id: toastId });
    } finally {
      setAiLoading(false);
    }
  };

  const handleTogglePin = () => {
    updateNote(selectedNote._id, { isPinned: !selectedNote.isPinned });
    toast.success(selectedNote.isPinned ? 'Unpinned' : 'Pinned!');
  };

  const handleToggleArchive = () => {
    updateNote(selectedNote._id, { isArchived: !selectedNote.isArchived });
    toast.success(selectedNote.isArchived ? 'Unarchived' : 'Archived');
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this note?')) return;
    await deleteNote(selectedNote._id);
  };

  const handleExport = () => {
    const blob = new Blob([`# ${title}\n\n${content}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title || 'note'}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!selectedNote) return null;

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div style={styles.editor}>
      <div style={styles.toolbar}>
        <div style={styles.toolbarLeft}>
          <div style={styles.viewTabs}>
            {[
              { id: 'edit', icon: <Code size={14} />, label: 'Edit' },
              { id: 'preview', icon: <Eye size={14} />, label: 'Preview' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                style={{ ...styles.viewTab, ...(viewMode === tab.id ? styles.viewTabActive : {}) }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.toolbarRight}>
          <button className="btn btn-secondary btn-sm" onClick={() => handleAIAction('enhance')} disabled={aiLoading} style={{ gap: 6 }}>
            <Wand2 size={14} color="#7c3aed" />
            Enhance
          </button>

          <button className="btn btn-secondary btn-sm" onClick={() => handleAIAction('processAll')} disabled={aiLoading} style={{ gap: 6 }}>
            <Sparkles size={14} color="#06b6d4" />
            AI Process
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={onOpenAI}
            style={{ gap: 6, ...(aiPanelOpen ? { color: '#7c3aed', borderColor: 'rgba(139,92,246,0.4)', background: 'rgba(139,92,246,0.1)' } : {}) }}
          >
            <Bot size={14} />
            Chat AI
          </button>

          <div style={styles.toolbarDivider} />

          <button className="btn btn-ghost btn-icon" onClick={handleTogglePin} title={selectedNote.isPinned ? 'Unpin' : 'Pin'}>
            <Pin size={15} color={selectedNote.isPinned ? '#f59e0b' : 'var(--text-muted)'} />
          </button>

          <button className="btn btn-ghost btn-icon" onClick={handleSave} disabled={saving} title="Save">
            {saving ? <div className="spinner" style={{ width: 15, height: 15 }} /> : <Save size={15} color="var(--text-secondary)" />}
          </button>

          <div style={{ position: 'relative' }}>
            <button className="btn btn-ghost btn-icon" onClick={() => setShowMore((prev) => !prev)}>
              <MoreHorizontal size={15} color="var(--text-muted)" />
            </button>
            {showMore && (
              <div style={styles.dropdown} onMouseLeave={() => setShowMore(false)}>
                <button style={styles.dropdownItem} onClick={() => { handleAIAction('autoTag'); setShowMore(false); }}>
                  <Tag size={14} /> Auto-tag with AI
                </button>
                <button style={styles.dropdownItem} onClick={() => { handleAIAction('format'); setShowMore(false); }}>
                  <Sparkles size={14} /> Format note
                </button>
                <button style={styles.dropdownItem} onClick={() => { handleExport(); setShowMore(false); }}>
                  <Download size={14} /> Export .md
                </button>
                <div style={styles.dropdownDivider} />
                <button style={styles.dropdownItem} onClick={() => { handleToggleArchive(); setShowMore(false); }}>
                  <Archive size={14} /> {selectedNote.isArchived ? 'Unarchive' : 'Archive'}
                </button>
                <button style={{ ...styles.dropdownItem, color: '#ef4444' }} onClick={() => { handleDelete(); setShowMore(false); }}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={styles.colorBar}>
        {COLORS.map((color) => (
          <button
            key={color}
            style={{
              ...styles.colorDot,
              background: color,
              ...(selectedNote.color === color ? { boxShadow: `0 0 0 2px var(--bg-secondary), 0 0 0 4px ${color}` } : {})
            }}
            onClick={() => updateNote(selectedNote._id, { color })}
          />
        ))}

        {selectedNote.tags?.length > 0 && (
          <div style={styles.tagsList}>
            {selectedNote.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
          </div>
        )}

        <div style={styles.metaInfo}>
          <span>{wordCount} words</span>
          <span>·</span>
          <span>{readTime} min read</span>
          {selectedNote.isEnhanced && <span className="ai-badge">AI Enhanced</span>}
        </div>
      </div>

      <input style={styles.titleInput} placeholder="Note title..." value={title} onChange={handleTitleChange} />

      <div style={styles.contentArea}>
        {viewMode === 'edit' ? (
          <textarea style={styles.contentTextarea} placeholder="Start writing... (Markdown supported)" value={content} onChange={handleContentChange} />
        ) : (
          <div style={styles.preview}>
            {content ? <ReactMarkdown>{content}</ReactMarkdown> : <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Nothing to preview yet</p>}
          </div>
        )}
      </div>

      {aiLoading && (
        <div style={styles.aiOverlay}>
          <div style={styles.aiLoadingCard}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div className="spinner" style={{ width: 20, height: 20 }} />
              <span style={{ color: '#7c3aed', fontWeight: 500 }}>AI is thinking...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  editor: { display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden', background: 'var(--bg-secondary)' },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    borderBottom: '1px solid var(--border)',
    gap: 12,
    flexWrap: 'wrap'
  },
  toolbarLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  toolbarRight: { display: 'flex', alignItems: 'center', gap: 6 },
  toolbarDivider: { width: 1, height: 20, background: 'var(--border)', margin: '0 4px' },
  viewTabs: {
    display: 'flex',
    background: 'var(--bg-tertiary)',
    borderRadius: 8,
    padding: 2,
    gap: 2
  },
  viewTab: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '5px 10px',
    borderRadius: 6,
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  viewTabActive: { background: 'var(--bg-card)', color: 'var(--text-primary)' },
  colorBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 20px',
    borderBottom: '1px solid var(--border)'
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.15s'
  },
  tagsList: { display: 'flex', gap: 4, flex: 1, flexWrap: 'wrap' },
  metaInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
    color: 'var(--text-muted)',
    marginLeft: 'auto'
  },
  titleInput: {
    padding: '20px 24px 10px',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'var(--text-primary)',
    fontSize: 26,
    fontFamily: 'Syne, sans-serif',
    fontWeight: 700,
    width: '100%',
    letterSpacing: '-0.02em'
  },
  contentArea: { flex: 1, overflow: 'auto', padding: '0 24px 24px' },
  contentTextarea: {
    width: '100%',
    height: '100%',
    minHeight: 400,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'var(--text-secondary)',
    fontSize: 15,
    lineHeight: 1.8,
    resize: 'none',
    fontFamily: 'DM Sans, sans-serif'
  },
  preview: {
    color: 'var(--text-secondary)',
    fontSize: 15,
    lineHeight: 1.8,
    maxWidth: 720
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: 6,
    zIndex: 50,
    minWidth: 180,
    boxShadow: 'var(--shadow)'
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 12px',
    borderRadius: 8,
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.15s'
  },
  dropdownDivider: { height: 1, background: 'var(--border)', margin: '4px 0' },
  aiOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(23, 32, 51, 0.28)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    backdropFilter: 'blur(4px)'
  },
  aiLoadingCard: {
    background: 'var(--bg-card)',
    border: '1px solid rgba(139,92,246,0.3)',
    borderRadius: 16,
    padding: '20px 28px',
    boxShadow: 'var(--shadow)'
  }
};
