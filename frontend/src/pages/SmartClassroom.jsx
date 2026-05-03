import React, { useState, useEffect, useCallback } from 'react';
import axios from '../lib/axios';
import { useAuth } from '../context/AuthContext';

const SmartClassroom = () => {
    const { user } = useAuth();
    const role = user?.role;
    const [classrooms, setClassrooms] = useState([]);
    const [code, setCode] = useState('');
    const [newClassName, setNewClassName] = useState('');
    const [selectedClassroom, setSelectedClassroom] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [newMaterial, setNewMaterial] = useState({ title: '', link: '', type: 'LINK' });

    // Notepad State
    const [noteContent, setNoteContent] = useState('');
    const [noteHistory, setNoteHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    // AI Chat State
    const [chatQuestion, setChatQuestion] = useState('');
    const [chatResponse, setChatResponse] = useState('');
    const [chatLoading, setChatLoading] = useState(false);

    // Fetch Classrooms
    const fetchClassrooms = useCallback(async () => {
        if (!user?.id) return;
        try {
            // Teacher: /api/classrooms/teacher/{teacherId}
            // Student: /api/classrooms/student/{studentId}
            const endpoint = role === 'TEACHER'
                ? `/classrooms/teacher/${user.id}`
                : `/classrooms/student/${user.id}`;
            const res = await axios.get(endpoint);
            setClassrooms(res.data);
        } catch (error) {
            console.error("Error fetching classrooms:", error);
        }
    }, [role, user?.id]);

    useEffect(() => {
        fetchClassrooms();
    }, [fetchClassrooms]);

    // Create Classroom (Teacher)
    const createClassroom = async () => {
        if (!user?.id) return;
        try {
            await axios.post(`/classrooms/create/${user.id}`, { name: newClassName });
            setNewClassName('');
            fetchClassrooms();
            alert('Classroom created successfully!');
        } catch (error) {
            alert('Failed to create classroom');
            console.error(error);
        }
    };

    // Join Classroom (Student)
    const joinClassroom = async () => {
        if (!user?.id) return;
        try {
            await axios.post(`/classrooms/join/${user.id}`, { code: code });
            setCode('');
            fetchClassrooms();
            alert('Joined classroom successfully!');
        } catch (error) {
            alert('Invalid Code or already joined');
            console.error(error);
        }
    };

    // View Classroom Details
    const viewClassroom = async (cls) => {
        setSelectedClassroom(cls);
        // Reset states
        setNoteContent('');
        setChatResponse('');
        setChatQuestion('');
        setShowHistory(false);

        // Fetch materials (existing feature)
        try {
            const res = await axios.get(`/classrooms/${cls.id}/materials`);
            setMaterials(res.data);
        } catch (error) {
            console.error("Error fetching materials:", error);
        }
    };

    // Upload Material (Teacher)
    const uploadMaterial = async () => {
        try {
            await axios.post(`/classrooms/${selectedClassroom.id}/materials`, newMaterial);
            const res = await axios.get(`/classrooms/${selectedClassroom.id}/materials`);
            setMaterials(res.data);
            setNewMaterial({ title: '', link: '', type: 'LINK' });
            alert('Material uploaded!');
        } catch (error) {
            alert('Upload failed');
            console.error(error);
        }
    };

    // --- Student Features ---

    // Save Note
    const saveNote = async () => {
        if (!noteContent.trim()) return;
        try {
            await axios.post('/notes/save', {
                classroomId: selectedClassroom.id,
                content: noteContent
            });
            alert('Note saved to history!');
            setNoteContent(''); // Clear or keep? Usually clear or give feedback. Let's clear.
            if (showHistory) fetchNoteHistory();
        } catch (error) {
            console.error("Error saving note:", error);
            alert('Failed to save note.');
        }
    };

    // Fetch Note History
    const fetchNoteHistory = async () => {
        try {
            const res = await axios.get(`/notes/history/${selectedClassroom.id}`);
            setNoteHistory(res.data);
            setShowHistory(true);
        } catch (error) {
            console.error("Error fetching history:", error);
        }
    };

    // AI Chat
    const askAI = async () => {
        if (!chatQuestion.trim()) return;
        setChatLoading(true);
        try {
            const res = await axios.post('/ai/chat', { question: chatQuestion });
            setChatResponse(res.data.answer);
        } catch (error) {
            console.error("Error asking AI:", error);
            setChatResponse("Sorry, I couldn't reach the AI brain right now.");
        } finally {
            setChatLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Smart Classroom</h1>

            {!selectedClassroom ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* List of Classrooms */}
                    <div className="bg-white p-6 shadow-lg rounded-lg">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">My Classrooms</h2>
                        {classrooms.length === 0 ? (
                            <p className="text-gray-500">No classrooms found.</p>
                        ) : (
                            <ul className="space-y-3">
                                {classrooms.map(c => (
                                    <li key={c.id} className="border p-3 rounded hover:bg-gray-50 flex justify-between items-center transition">
                                        <div>
                                            <p className="font-bold text-gray-800">{c.name}</p>
                                            <p className="text-sm text-gray-500">Code: {c.uniqueCode}</p>
                                        </div>
                                        <button onClick={() => viewClassroom(c)} className="text-blue-600 hover:underline font-medium">Open</button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Create or Join */}
                    <div className="bg-white p-6 shadow-lg rounded-lg h-fit">
                        {role === 'TEACHER' ? (
                            <div>
                                <h2 className="text-xl font-semibold mb-4 text-gray-700">Create New Classroom</h2>
                                <input
                                    className="border p-3 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                                    placeholder="Enter Classroom Name"
                                    value={newClassName}
                                    onChange={e => setNewClassName(e.target.value)}
                                />
                                <button onClick={createClassroom} className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded w-full transition">Create</button>
                            </div>
                        ) : (
                            <div>
                                <h2 className="text-xl font-semibold mb-4 text-gray-700">Join a Classroom</h2>
                                <input
                                    className="border p-3 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="Enter Classroom Code"
                                    value={code}
                                    onChange={e => setCode(e.target.value)}
                                />
                                <button onClick={joinClassroom} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full transition">Join Class</button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div>
                    <button onClick={() => setSelectedClassroom(null)} className="mb-4 text-gray-600 hover:text-gray-900 flex items-center">
                        <span className="mr-1">&larr;</span> Back to Dashboard
                    </button>

                    <h2 className="text-3xl font-bold mb-6 text-indigo-700">{selectedClassroom.name}</h2>

                    {/* Teacher Content: Upload & View Materials */}
                    {role === 'TEACHER' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white p-6 shadow rounded-lg">
                                <h3 className="text-lg font-semibold mb-3">Upload Material</h3>
                                <input className="border p-2 w-full mb-2 rounded" placeholder="Title" value={newMaterial.title} onChange={e => setNewMaterial({ ...newMaterial, title: e.target.value })} />
                                <input className="border p-2 w-full mb-2 rounded" placeholder="Link or Content" value={newMaterial.link} onChange={e => setNewMaterial({ ...newMaterial, link: e.target.value })} />
                                <select className="border p-2 w-full mb-2 rounded" value={newMaterial.type} onChange={e => setNewMaterial({ ...newMaterial, type: e.target.value })}>
                                    <option value="LINK">Link</option>
                                    <option value="PDF">PDF</option>
                                    <option value="TEXT">Text</option>
                                    <option value="ANNOUNCEMENT">Announcement</option>
                                </select>
                                <button onClick={uploadMaterial} className="bg-purple-600 text-white p-2 rounded w-full">Upload</button>
                            </div>
                            <div className="bg-white p-6 shadow rounded-lg">
                                <h3 className="text-lg font-semibold mb-3">Class Materials</h3>
                                <div className="max-h-60 overflow-y-auto">
                                    {materials.length === 0 ? <p className="text-gray-500">No materials yet.</p> : (
                                        <ul className="space-y-2">
                                            {materials.map(m => (
                                                <li key={m.id} className="border-b p-2">
                                                    <span className={`font-bold text-xs uppercase mr-2 ${m.type === 'ANNOUNCEMENT' ? 'text-red-500' : 'text-blue-500'}`}>{m.type}</span>
                                                    <a href={m.link} target="_blank" rel="noreferrer" className="text-gray-800 hover:underline">{m.title}</a>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Student Content: Main Smart Classroom Features */}
                    {role === 'STUDENT' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Left Column: Materials & Announcements (Read Only) */}
                            <div className="bg-white p-6 shadow rounded-lg h-fit">
                                <h3 className="text-lg font-semibold mb-3 border-b pb-2">Materials & Announcements</h3>
                                {materials.length === 0 ? <p className="text-gray-500 text-sm">No materials posted.</p> : (
                                    <ul className="space-y-3">
                                        {materials.map(m => (
                                            <li key={m.id} className="text-sm">
                                                <div className={`font-bold ${m.type === 'ANNOUNCEMENT' ? 'text-red-600' : 'text-blue-600'}`}>{m.type}</div>
                                                <a href={m.link} target="_blank" rel="noreferrer" className="text-gray-700 hover:text-blue-500 underline break-words">{m.title}</a>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Middle Column: Digital Notepad */}
                            <div className="bg-white p-6 shadow rounded-lg flex flex-col h-96">
                                <h3 className="text-lg font-semibold mb-3 flex justify-between items-center">
                                    Digital Notepad
                                    <button onClick={() => { setShowHistory(!showHistory); if (!showHistory) fetchNoteHistory(); }} className="text-xs text-blue-500 hover:underline">
                                        {showHistory ? 'Back to Write' : 'View History'}
                                    </button>
                                </h3>

                                {!showHistory ? (
                                    <>
                                        <textarea
                                            className="flex-1 border p-3 rounded mb-3 resize-none focus:outline-none focus:ring-1 focus:ring-blue-300"
                                            placeholder="Write your notes here..."
                                            value={noteContent}
                                            onChange={e => setNoteContent(e.target.value)}
                                        />
                                        <button onClick={saveNote} className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded transition">Save Note</button>
                                    </>
                                ) : (
                                    <div className="flex-1 overflow-y-auto pr-2">
                                        {noteHistory.length === 0 ? <p className="text-gray-500 text-sm">No saved notes.</p> : (
                                            <div className="space-y-4">
                                                {noteHistory.map(n => (
                                                    <div key={n.id} className="bg-yellow-50 p-3 rounded border border-yellow-100">
                                                        <p className="text-xs text-gray-500 mb-1">{new Date(n.createdAt).toLocaleString()}</p>
                                                        <p className="text-gray-800 whitespace-pre-wrap text-sm">{n.content}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Right Column: AI Chatbot */}
                            <div className="bg-white p-6 shadow rounded-lg flex flex-col h-96">
                                <h3 className="text-lg font-semibold mb-3">AI Tutor</h3>
                                <div className="flex-1 flex flex-col bg-gray-50 border rounded p-3 mb-3 overflow-hidden">
                                    <div className="flex-1 overflow-y-auto mb-2 text-sm">
                                        {!chatResponse ? (
                                            <p className="text-gray-400 italic text-center mt-10">Ask me anything related to your class!</p>
                                        ) : (
                                            <div className="bg-blue-100 p-3 rounded-lg text-blue-900 inline-block">
                                                <strong>AI:</strong> {chatResponse}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        className="border flex-1 p-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-300"
                                        placeholder="Ask a question..."
                                        value={chatQuestion}
                                        onChange={e => setChatQuestion(e.target.value)}
                                        onKeyPress={e => e.key === 'Enter' && askAI()}
                                    />
                                    <button onClick={askAI} disabled={chatLoading} className="bg-purple-600 hover:bg-purple-700 text-white px-3 rounded text-sm disabled:opacity-50">
                                        {chatLoading ? '...' : 'Ask'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SmartClassroom;

