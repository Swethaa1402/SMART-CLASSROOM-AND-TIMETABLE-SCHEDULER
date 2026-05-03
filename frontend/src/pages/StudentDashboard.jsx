import React, { useState, useEffect, useCallback } from 'react';
import axios from '../lib/axios';
import Streak from '../components/Streak';
import Chatbot from '../components/Chatbot';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const [streak, setStreak] = useState(0);
    const [timetable, setTimetable] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [timetableError, setTimetableError] = useState('');
    const [announcementError, setAnnouncementError] = useState('');

    const sortTimetable = useCallback((rows) => {
        const dayOrder = {
            MONDAY: 1,
            TUESDAY: 2,
            WEDNESDAY: 3,
            THURSDAY: 4,
            FRIDAY: 5,
            SATURDAY: 6,
            SUNDAY: 7,
        };
        return [...rows].sort((a, b) =>
            (dayOrder[a?.dayOfWeek] || 99) - (dayOrder[b?.dayOfWeek] || 99) ||
            (a?.periodNumber || 0) - (b?.periodNumber || 0)
        );
    }, []);

    const fetchAnnouncements = useCallback(async () => {
        try {
            const res = await axios.get('/announcement');
            setAnnouncements(Array.isArray(res.data) ? res.data : []);
            setAnnouncementError('');
        } catch (err) {
            console.error(err);
            setAnnouncementError(err.response?.data?.message || 'Announcements could not be loaded.');
        }
    }, []);

    const fetchUserData = useCallback(async () => {
        try {
            if (!user?.id) return;
            setStreak(user.streak || 0);
            if (!user.className) {
                setTimetable([]);
                setTimetableError('Your class is not assigned yet. Please contact the admin.');
                return;
            }
            const ttRes = await axios.get(`/timetable/student/${encodeURIComponent(user.className)}`);
            const timetableRows = Array.isArray(ttRes.data) ? ttRes.data : [];
            setTimetable(sortTimetable(timetableRows));
            setTimetableError('');
        } catch (err) {
            console.error(err);
            setTimetable([]);
            setTimetableError(err.response?.data?.message || 'Timetable could not be loaded.');
        }
    }, [sortTimetable, user]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchUserData();
        fetchAnnouncements();
    }, [fetchUserData, fetchAnnouncements]);

    return (
        <div className="p-6 bg-gray-50 min-h-screen relative">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Student Dashboard</h1>
                <div className="flex items-center space-x-4">
                    <Streak dayCount={streak} />
                    <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 transition">
                        Logout
                    </button>
                </div>
            </div>

            {/* Announcements Ticker */}
            {announcements.length > 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700 font-bold">Latest Announcement</p>
                            <p className="text-sm text-yellow-700 mt-1">{announcements[0].title}: {announcements[0].message || announcements[0].content}</p>
                        </div>
                    </div>
                </div>
            )}
            {announcementError && (
                <div className="mb-8 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {announcementError}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Quick Actions */}
                <Link to="/smart-classroom" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition border-l-4 border-blue-500">
                    <h2 className="text-xl font-bold mb-2">Smart Classroom</h2>
                    <p className="text-gray-600">Access notes, join classes, and view materials.</p>
                </Link>

                <Link to="/notepad" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition border-l-4 border-yellow-500">
                    <h2 className="text-xl font-bold mb-2">Digital Notepad</h2>
                    <p className="text-gray-600">Take personal notes and save them securely.</p>
                </Link>

                <Link to="/student/questions" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition border-l-4 border-purple-500">
                    <h2 className="text-xl font-bold mb-2">Ask Teacher</h2>
                    <p className="text-gray-600">Have a doubt? Ask your teacher instantly.</p>
                </Link>

                <Link to="/student/chatbot" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition border-l-4 border-green-500">
                    <h2 className="text-xl font-bold mb-2">AI Tutor</h2>
                    <p className="text-gray-600">Chat with Gemini AI to learn new things.</p>
                </Link>

                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                    <h2 className="text-xl font-bold mb-2">Today's Attendance</h2>
                    <p className="text-gray-600">You are present today! Keep your streak up.</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4">Your Timetable</h2>
                <div className="overflow-x-auto">
                    {(() => {
                        const safeTimetable = Array.isArray(timetable) ? timetable : [];
                        if (timetableError) {
                            return <p className="p-4 text-red-600">{timetableError}</p>;
                        }
                        return safeTimetable.length === 0 ? (
                            <p className="p-4 text-gray-500">Timetable not generated yet.</p>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 border-b">
                                        <th className="p-3 border">Day</th>
                                        <th className="p-3 border">Period & Time</th>
                                        <th className="p-3 border">Subject</th>
                                        <th className="p-3 border">Teacher</th>
                                        <th className="p-3 border">Room</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...safeTimetable].sort((a, b) => (a?.dayOfWeek || "").localeCompare(b?.dayOfWeek || "") || (a?.periodNumber || 0) - (b?.periodNumber || 0)).map(t => (
                                        <tr key={t?.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3 border font-bold text-gray-800">{t?.dayOfWeek}</td>
                                            <td className="p-3 border">
                                                <span className="font-bold text-indigo-600 border-b pb-1">Period {t?.periodNumber}</span><br />
                                                <span className="text-sm text-gray-600">{t?.startTime} - {t?.endTime}</span>
                                            </td>
                                            <td className="p-3 border font-semibold text-gray-800">{t?.subject}</td>
                                            <td className="p-3 border">{t?.teacher?.name || 'TBA'}</td>
                                            <td className="p-3 border">{t?.room}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        );
                    })()}
                </div>
            </div>

            <div className="mt-8 bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4">Announcements</h2>
                {announcements.length === 0 ? (
                    <p className="text-gray-500">No announcements available.</p>
                ) : (
                    <div className="space-y-4">
                        {announcements.map((announcement) => (
                            <div key={announcement.id} className="rounded border border-yellow-200 bg-yellow-50 p-4">
                                <h3 className="font-bold text-gray-800">{announcement.title}</h3>
                                <p className="mt-1 text-sm text-gray-700">{announcement.message || announcement.content}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Chatbot />
        </div>
    );
};

export default StudentDashboard;
