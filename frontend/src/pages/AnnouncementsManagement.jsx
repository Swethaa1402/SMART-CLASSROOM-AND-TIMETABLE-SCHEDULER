import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';
import BasicLayout from '../components/Layout/BasicLayout';

const AnnouncementsManagement = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const res = await axios.get('/admin/announcement/all');
            setAnnouncements(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !content) return;
        setLoading(true);
        try {
            const response = await axios.post('/admin/announcement/add', { title, message: content, targetAudience: 'ALL' });
            setTitle('');
            setContent('');
            setAnnouncements((current) => [response.data, ...current]);
            alert("Announcement posted!");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to post announcement");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this announcement?")) return;
        try {
            await axios.delete(`/admin/announcement/delete/${id}`);
            setAnnouncements((current) => current.filter((announcement) => announcement.id !== id));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete");
        }
    };

    return (
        <BasicLayout>
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold mb-6">Manage Announcements</h1>

                <div className="bg-white p-6 rounded shadow mb-8">
                    <h2 className="text-xl font-bold mb-4">Post New Announcement</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <input
                                className="w-full border p-2 rounded"
                                placeholder="Title"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </div>
                        <div>
                            <textarea
                                className="w-full border p-2 rounded h-32"
                                placeholder="Content..."
                                value={content}
                                onChange={e => setContent(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
                        >
                            {loading ? 'Posting...' : 'Post Announcement'}
                        </button>
                    </form>
                </div>

                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-bold mb-4">Recent Announcements</h2>
                    <div className="space-y-4">
                        {announcements.map(ann => (
                            <div key={ann.id} className="border-b pb-4 last:border-0 relative">
                                <h3 className="font-bold text-lg">{ann.title}</h3>
                                <p className="text-gray-600 text-sm mb-2">{new Date(ann.createdAt).toLocaleString()}</p>
                                <p className="text-gray-800 whitespace-pre-wrap">{ann.message || ann.content}</p>
                                <button
                                    onClick={() => handleDelete(ann.id)}
                                    className="absolute top-0 right-0 text-red-500 hover:text-red-700 font-bold"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </BasicLayout>
    );
};

export default AnnouncementsManagement;
