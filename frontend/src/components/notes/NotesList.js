import React from 'react';
import { Pin, Archive, Clock, Zap } from 'lucide-react';
import { useNotes } from '../../context/NotesContext';

export default function NotesList({ onNoteSelect }) {
  const { notes, selectedNote, setSelectedNote, loading } = useNotes();

  const handleSelect = (note) => {
    setSelectedNote(note);
    if (onNoteSelect) onNoteSelect(note);
  };

  if (loading) {
    return (
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[...Array(5)].map((_, index) => (
          <div key={index} className="skeleton" style={{ height: 80, borderRadius: 12 }} />
        ))}
      </div>
    );
  }

  if (!notes.length) {
    return (
      <div className="empty-state" style={{ flex: 1 }}>
        <div style={{ fontSize: 36, fontWeight: 700, color: '#a78bfa' }}>Notes</div>
        <h3>No notes found</h3>
        <p>Create your first note</p>
      </div>
    );
  }

  return (
    <div style={styles.list}>
      {notes.some((note) => note.isPinned) && (
        <>
          <div style={styles.sectionLabel}>Pinned</div>
          {notes.filter((note) => note.isPinned).map((note) => (
            <NoteCard key={note._id} note={note} selected={selectedNote?._id === note._id} onSelect={handleSelect} />
          ))}
          <div style={styles.sectionLabel}>All Notes</div>
        </>
      )}

      {notes.filter((note) => !note.isPinned).map((note) => (
        <NoteCard key={note._id} note={note} selected={selectedNote?._id === note._id} onSelect={handleSelect} />
      ))}
    </div>
  );
}

function NoteCard({ note, selected, onSelect }) {
  const preview = note.content?.replace(/[#*`]/g, '').substring(0, 80) || 'No content';
  const date = new Date(note.updatedAt).toLocaleDateString('en', { month: 'short', day: 'numeric' });

  return (
    <div
      style={{
        ...styles.card,
        ...(selected ? styles.cardSelected : {}),
        boxShadow: `inset 3px 0 0 ${note.color || 'transparent'}`
      }}
      onClick={() => onSelect(note)}
    >
      <div style={styles.cardTop}>
        <h4 style={styles.cardTitle}>{note.title || 'Untitled'}</h4>
        <div style={styles.cardIcons}>
          {note.isPinned && <Pin size={11} color="#f59e0b" />}
          {note.isEnhanced && <Zap size={11} color="#8b5cf6" />}
          {note.isArchived && <Archive size={11} color="var(--text-muted)" />}
        </div>
      </div>
      <p style={styles.cardPreview}>{preview}</p>
      <div style={styles.cardMeta}>
        {note.category && <span style={styles.cardCategory}>{note.category}</span>}
        <span style={styles.cardDate}><Clock size={10} /> {date}</span>
      </div>
      {note.tags?.length > 0 && (
        <div style={styles.cardTags}>
          {note.tags.slice(0, 3).map((tag) => (
            <span key={tag} style={styles.miniTag}>{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '4px 10px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },
  sectionLabel: {
    fontSize: 11,
    color: 'var(--text-muted)',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    padding: '8px 6px 4px'
  },
  card: {
    padding: '12px',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'all 0.15s',
    border: '1px solid var(--border)',
    background: 'var(--bg-card)',
    display: 'flex',
    flexDirection: 'column',
    gap: 5
  },
  cardSelected: {
    background: 'color-mix(in srgb, var(--bg-card) 82%, #8b5cf6 18%)',
    border: '1px solid rgba(139,92,246,0.28)'
  },
  cardTop: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 },
  cardTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-primary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1
  },
  cardIcons: { display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 },
  cardPreview: {
    fontSize: 12,
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical'
  },
  cardMeta: { display: 'flex', alignItems: 'center', gap: 8 },
  cardCategory: {
    fontSize: 10,
    background: 'rgba(139,92,246,0.12)',
    color: '#7c3aed',
    padding: '2px 7px',
    borderRadius: 10
  },
  cardDate: {
    fontSize: 11,
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    marginLeft: 'auto'
  },
  cardTags: { display: 'flex', flexWrap: 'wrap', gap: 4 },
  miniTag: {
    fontSize: 10,
    color: 'var(--text-secondary)',
    background: 'var(--bg-tertiary)',
    padding: '1px 6px',
    borderRadius: 8,
    border: '1px solid var(--border)'
  }
};
