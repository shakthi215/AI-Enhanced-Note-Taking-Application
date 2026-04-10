import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import { useNotes } from '../context/NotesContext';
import NotesList from '../components/notes/NotesList';
import NoteEditor from '../components/notes/NoteEditor';
import AIPanel from '../components/ai/AIPanel';

export default function NotesPage() {
  const { fetchNotes, fetchMeta, createNote, selectedNote, setSelectedNote, categories, tags } = useNotes();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ category: '', tag: '', archived: false });
  const [showFilters, setShowFilters] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchNotes();
    fetchMeta();
  }, [fetchMeta, fetchNotes]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotes({ search, ...filter, archived: filter.archived ? 'true' : undefined });
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchNotes, filter, search]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const note = await createNote({
        title: 'Untitled Note',
        content: '',
        category: 'General'
      });
      setSelectedNote(note);
    } catch {
      toast.error('Failed to create note');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="notes-shell" style={styles.layout}>
      <div className="notes-list-panel" style={styles.listPanel}>
        <div style={styles.toolbar}>
          <div style={styles.searchWrap}>
            <Search size={15} color="var(--text-muted)" style={styles.searchIcon} />
            <input
              style={styles.searchInput}
              placeholder="Search notes..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search && <button onClick={() => setSearch('')} style={styles.clearBtn}><X size={13} /></button>}
          </div>
          <div style={styles.toolbarActions}>
            <button
              className={`btn btn-icon btn-secondary ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters((prev) => !prev)}
              style={showFilters ? { background: 'rgba(139,92,246,0.15)', color: '#a78bfa', borderColor: 'rgba(139,92,246,0.3)' } : {}}
            >
              <SlidersHorizontal size={16} />
            </button>
            <button className="btn btn-primary btn-icon" onClick={handleCreate} disabled={creating} title="New Note">
              {creating ? <div className="spinner" style={{ width: 16, height: 16, borderTopColor: '#fff' }} /> : <Plus size={16} />}
            </button>
          </div>
        </div>

        {showFilters && (
          <div style={styles.filters}>
            <select
              style={styles.filterSelect}
              value={filter.category}
              onChange={(event) => setFilter((prev) => ({ ...prev, category: event.target.value }))}
            >
              <option value="">All Categories</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <select
              style={styles.filterSelect}
              value={filter.tag}
              onChange={(event) => setFilter((prev) => ({ ...prev, tag: event.target.value }))}
            >
              <option value="">All Tags</option>
              {tags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
            </select>
            <label style={styles.filterCheck}>
              <input
                type="checkbox"
                checked={filter.archived}
                onChange={(event) => setFilter((prev) => ({ ...prev, archived: event.target.checked }))}
              />
              <span>Archived</span>
            </label>
          </div>
        )}

        <NotesList onNoteSelect={() => aiPanelOpen && setAiPanelOpen(true)} />
      </div>

      <div className="notes-editor-panel" style={styles.editorPanel}>
        {selectedNote ? (
          <NoteEditor onOpenAI={() => setAiPanelOpen(true)} aiPanelOpen={aiPanelOpen} />
        ) : (
          <div className="empty-state" style={{ height: '100%' }}>
            <div style={styles.emptyIcon}>AI</div>
            <h3>Select or create a note</h3>
            <p>Your AI thinking companion is ready</p>
            <button className="btn btn-primary" onClick={handleCreate} style={{ marginTop: 8 }}>
              <Plus size={16} /> New Note
            </button>
          </div>
        )}
      </div>

      {aiPanelOpen && selectedNote && (
        <div className="notes-ai-panel" style={styles.aiPanel}>
          <AIPanel onClose={() => setAiPanelOpen(false)} />
        </div>
      )}
    </div>
  );
}

const styles = {
  layout: { display: 'flex', minHeight: 'calc(100vh - 24px)', overflow: 'hidden' },
  listPanel: {
    width: 280,
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    flexShrink: 0,
    background: 'var(--bg-secondary)'
  },
  toolbar: {
    display: 'flex',
    gap: 8,
    padding: '16px 12px 8px',
    alignItems: 'center'
  },
  searchWrap: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  searchIcon: { position: 'absolute', left: 10, pointerEvents: 'none' },
  searchInput: {
    width: '100%',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: '8px 32px 8px 32px',
    color: 'var(--text-primary)',
    fontSize: 13,
    outline: 'none'
  },
  clearBtn: {
    position: 'absolute',
    right: 8,
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    display: 'flex',
    padding: 2
  },
  toolbarActions: { display: 'flex', gap: 6 },
  filters: {
    padding: '0 12px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  filterSelect: {
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '7px 10px',
    color: 'var(--text-primary)',
    fontSize: 12,
    outline: 'none',
    width: '100%'
  },
  filterCheck: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
    color: 'var(--text-secondary)',
    cursor: 'pointer'
  },
  editorPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minWidth: 0
  },
  aiPanel: {
    width: 360,
    borderLeft: '1px solid var(--border)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0
  },
  emptyIcon: { fontSize: 48, marginBottom: 8, fontWeight: 700, color: '#a78bfa' }
};
