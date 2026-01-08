import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, FileText } from 'lucide-react';

import { endpoints } from '../../config';
import { useOS } from '../../context/OSContext';

const NotesApp = () => {
    const { user } = useOS();
    const [notes, setNotes] = useState([]);
    const [activeNote, setActiveNote] = useState(null); // ID

    // Load Notes from API
    useEffect(() => {
        if (user?.username) {
            fetch(endpoints.notes(user.username))
                .then(res => res.json())
                .then(data => setNotes(Array.isArray(data) ? data : []))
                .catch(err => console.error("Failed to load notes", err));
        }
    }, [user]);

    const saveNoteToApi = async (note) => {
        if (!user?.username) return;
        try {
            await fetch(endpoints.notes(user.username), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(note)
            });
        } catch (err) {
            console.error("Failed to save note", err);
        }
    };

    const deleteNoteFromApi = async (id) => {
        if (!user?.username) return;
        try {
            await fetch(`${endpoints.notes(user.username)}/${id}`, {
                method: 'DELETE'
            });
        } catch (err) {
            console.error("Failed to delete note", err);
        }
    };

    const createNote = () => {
        const newNote = {
            id: Date.now(),
            title: 'New Note',
            content: '',
            date: new Date().toLocaleDateString() // Note: Backend uses server time usually, but we keep this for UI for now
        };
        const updated = [newNote, ...notes];
        setNotes(updated);
        setActiveNote(newNote.id);
        saveNoteToApi(newNote);
    };

    const deleteNote = (id) => {
        const updated = notes.filter(n => n.id !== id);
        setNotes(updated);
        if (activeNote === id) setActiveNote(null);
        deleteNoteFromApi(id);
    };

    const updateNote = (id, field, value) => {
        const updated = notes.map(n => n.id === id ? { ...n, [field]: value } : n);
        setNotes(updated);

        // Simple debounce could be added here, currently saves on every keystroke which is heavy but functional
        const note = updated.find(n => n.id === id);
        if (note) saveNoteToApi(note);
    };

    const activeNoteData = notes.find(n => n.id === activeNote);

    return (
        <div className="flex h-full bg-[#1c1c1e] text-white">
            {/* Sidebar List */}
            <div className="w-64 border-r border-white/10 bg-[#2c2c2e] flex flex-col">
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <span className="font-bold text-lg">My Notes</span>
                    <button onClick={createNote} className="p-1 hover:bg-white/10 rounded"><Plus size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {notes.map(note => (
                        <div
                            key={note.id}
                            onClick={() => setActiveNote(note.id)}
                            className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${activeNote === note.id ? 'bg-indigo-600/20 border-l-4 border-indigo-500' : ''}`}
                        >
                            <h3 className="font-medium truncate">{note.title || 'Untitled'}</h3>
                            <p className="text-xs text-gray-400 mt-1">{note.date}</p>
                        </div>
                    ))}
                    {notes.length === 0 && (
                        <div className="p-8 text-center text-gray-500 text-sm">No notes yet</div>
                    )}
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex flex-col bg-[#1c1c1e]">
                {activeNoteData ? (
                    <>
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <input
                                value={activeNoteData.title}
                                onChange={(e) => updateNote(activeNote, 'title', e.target.value)}
                                className="bg-transparent text-xl font-bold focus:outline-none w-full"
                                placeholder="Note Title"
                            />
                            <button onClick={() => deleteNote(activeNote)} className="text-red-400 hover:text-red-300"><Trash2 size={20} /></button>
                        </div>
                        <textarea
                            value={activeNoteData.content}
                            onChange={(e) => updateNote(activeNote, 'content', e.target.value)}
                            className="flex-1 w-full bg-transparent p-6 resize-none focus:outline-none text-gray-300 leading-relaxed font-mono "
                            placeholder="Start typing..."
                        />
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <FileText size={48} className="mb-4 opacity-50" />
                        <p>Select or create a note</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotesApp;
