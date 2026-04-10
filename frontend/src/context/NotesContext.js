import React, { createContext, useContext, useState, useCallback } from 'react';
import { notesAPI } from '../services/api';
import toast from 'react-hot-toast';

const NotesContext = createContext(null);

export const NotesProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  const fetchNotes = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await notesAPI.getAll(params);
      setNotes(res.data.notes);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMeta = useCallback(async () => {
    try {
      const res = await notesAPI.getMeta();
      setCategories(res.data.categories);
      setTags(res.data.tags);
    } catch (err) {}
  }, []);

  const createNote = useCallback(async (data) => {
    const res = await notesAPI.create(data);
    const newNote = res.data.note;
    setNotes(prev => [newNote, ...prev]);
    setSelectedNote(newNote);
    fetchMeta();
    return newNote;
  }, [fetchMeta]);

  const updateNote = useCallback(async (id, data) => {
    const res = await notesAPI.update(id, data);
    const updated = res.data.note;
    setNotes(prev => prev.map(n => n._id === id ? updated : n));
    if (selectedNote?._id === id) setSelectedNote(updated);
    fetchMeta();
    return updated;
  }, [fetchMeta, selectedNote]);

  const deleteNote = useCallback(async (id) => {
    await notesAPI.delete(id);
    setNotes(prev => prev.filter(n => n._id !== id));
    if (selectedNote?._id === id) setSelectedNote(null);
    fetchMeta();
    toast.success('Note deleted');
  }, [fetchMeta, selectedNote]);

  const selectNote = useCallback(async (note) => {
    setSelectedNote(note);
    if (note) {
      try {
        const res = await notesAPI.getOne(note._id);
        setSelectedNote(res.data.note);
      } catch {}
    }
  }, []);

  return (
    <NotesContext.Provider value={{
      notes, setNotes, selectedNote, setSelectedNote: selectNote,
      loading, pagination, categories, tags,
      fetchNotes, fetchMeta, createNote, updateNote, deleteNote
    }}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error('useNotes must be used within NotesProvider');
  return ctx;
};
