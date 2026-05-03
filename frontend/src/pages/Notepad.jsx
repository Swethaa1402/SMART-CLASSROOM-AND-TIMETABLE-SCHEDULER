import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { useAuth } from '../context/AuthContext';

const Notepad = () => {
    const { user } = useAuth();
    const [notes, setNotes] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const userId = user?.id;

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const res = await axios.get(`/notes/${userId}`);
            setNotes(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const saveNote = async () => {
        try {
            await axios.post(`/notes/${userId}`, { title, content });
            setTitle('');
            setContent('');
            fetchNotes();
        } catch (err) {
            alert('Failed to save note');
        }
    };

    const deleteNote = async (id) => {
        try {
            await axios.delete(`/notes/${id}`);
            fetchNotes();
        } catch (err) {
            alert('Failed to delete note');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Digital Notepad</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 shadow rounded h-fit">
                    <h2 className="text-xl font-semibold mb-2">New Note</h2>
                    <input
                        className="border p-2 w-full mb-2"
                        placeholder="Title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                    <textarea
                        className="border p-2 w-full mb-2 h-40"
                        placeholder="Write your notes here..."
                        value={content}
                        onChange={e => setContent(e.target.value)}
                    />
                    <button onClick={saveNote} className="bg-blue-500 text-white p-2 rounded w-full">Save Note</button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {notes.map(note => (
                        <div key={note.id} className="bg-yellow-100 p-4 shadow rounded relative">
                            <button
                                onClick={() => deleteNote(note.id)}
                                className="absolute top-2 right-2 text-red-500 font-bold"
                            >
                                X
                            </button>
                            <h3 className="font-bold text-lg">{note.title}</h3>
                            <p className="whitespace-pre-wrap mt-2">{note.content}</p>
                            <small className="text-gray-500 block mt-2">{new Date(note.createdAt).toLocaleString()}</small>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Notepad;
