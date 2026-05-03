import React, { useState, useEffect, useCallback } from 'react';
import axios from '../lib/axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TeacherDashboard = () => {
    const { user, logout } = useAuth();
    const [timetable, setTimetable] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [myShifts, setMyShifts] = useState([]);
    const [incomingShifts, setIncomingShifts] = useState([]);
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

    const fetchShifts = useCallback(async () => {
        try {
            const res = await axios.get(`/shifts/teacher/${user.id}`);
            setMyShifts(res.data);
        } catch (err) {
            console.error(err);
        }
    }, [user.id]);

    const fetchIncomingShifts = useCallback(async () => {
        try {
            const res = await axios.get(`/shifts/incoming/${user.id}`);
            setIncomingShifts(res.data);
        } catch (err) {
            console.error(err);
        }
    }, [user.id]);

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

    const fetchTimetable = useCallback(async () => {
        try {
            let timetableRows = [];
            if (user?.email) {
                const res = await axios.get(`/timetable/teacher-email/${encodeURIComponent(user.email)}`);
                timetableRows = Array.isArray(res.data) ? res.data : [];
            }
            if (timetableRows.length === 0 && user?.id) {
                const fallbackRes = await axios.get(`/timetable/teacher/${user.id}`);
                timetableRows = Array.isArray(fallbackRes.data) ? fallbackRes.data : [];
            }
            setTimetable(sortTimetable(timetableRows));
            setTimetableError('');
        } catch (err) {
            console.error(err);
            setTimetable([]);
            setTimetableError(err.response?.data?.message || 'Timetable could not be loaded.');
        }
    }, [sortTimetable, user?.email, user?.id]);

    useEffect(() => {
        if (user?.id) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchTimetable();
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchAnnouncements();
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchShifts();
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchIncomingShifts();
        }
    }, [user, fetchTimetable, fetchAnnouncements, fetchShifts, fetchIncomingShifts]);

    const requestShift = async (timetableId) => {
        if (!window.confirm("Are you sure you want to request a substitute for this class?")) return;
        try {
            await axios.post(`/shifts/suggest/${timetableId}/${user.id}`);
            alert("Shift substitution requested successfully!");
            fetchShifts(); // Refresh status
        } catch (err) {
            console.error(err);
            alert("Failed to request shift substitution.");
        }
    };

    const handleApproveShift = async (shiftId) => {
        try {
            await axios.post(`/shifts/approve/${shiftId}`);
            alert('Shift approved!');
            fetchIncomingShifts();
            fetchTimetable();
        } catch (err) {
            alert('Failed to approve shift.');
        }
    };

    const handleRejectShift = async (shiftId) => {
        try {
            await axios.post(`/shifts/reject/${shiftId}`);
            alert('Shift rejected!');
            fetchIncomingShifts();
        } catch (err) {
            alert('Failed to reject shift.');
        }
    };

    // ... (keep requestShift)

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>
                <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 transition">
                    Logout
                </button>
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
                <Link to="/attendance" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition border-l-4 border-purple-500">
                    <h2 className="text-xl font-bold mb-2">Mark Attendance</h2>
                    <p className="text-gray-600">Update daily attendance for your classes.</p>
                </Link>

                <Link to="/smart-classroom" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition border-l-4 border-blue-500">
                    <h2 className="text-xl font-bold mb-2">Smart Classroom</h2>
                    <p className="text-gray-600">Upload materials and manage classes.</p>
                </Link>

                <Link to="/notepad" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition border-l-4 border-yellow-500">
                    <h2 className="text-xl font-bold mb-2">My Notes</h2>
                    <p className="text-gray-600">Manage your teaching notes.</p>
                </Link>

                <Link to="/teacher/leave" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition border-l-4 border-red-500">
                    <h2 className="text-xl font-bold mb-2">Apply Leave</h2>
                    <p className="text-gray-600">Request leave and check status.</p>
                </Link>

                <Link to="/teacher/questions" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition border-l-4 border-teal-500">
                    <h2 className="text-xl font-bold mb-2">Student Q&A</h2>
                    <p className="text-gray-600">Answer questions from students.</p>
                </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-2xl font-bold mb-4 text-red-600">My Schedule & Leave Requests</h2>
                <p className="mb-4 text-gray-600">Select a class to request a substitute teacher.</p>

                {timetableError ? (
                    <p className="text-red-600">{timetableError}</p>
                ) : timetable.length === 0 ? (
                    <p>No classes found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100 border-b">
                                    <th className="p-3">Day</th>
                                    <th className="p-3">Period & Time</th>
                                    <th className="p-3">Subject</th>
                                    <th className="p-3">Class</th>
                                    <th className="p-3">Room</th>
                                    <th className="p-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {timetable.map(slot => (
                                    <tr key={slot.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-bold">{slot.dayOfWeek}</td>
                                        <td className="p-3"><span className="font-bold text-indigo-600">Period {slot.periodNumber}</span> <br /> <span className="text-sm text-gray-500">{slot.startTime} - {slot.endTime}</span></td>
                                        <td className="p-3">{slot.subject}</td>
                                        <td className="p-3">{slot.className}</td>
                                        <td className="p-3">{slot.room}</td>
                                        <td className="p-3">
                                            <button
                                                onClick={() => requestShift(slot.id)}
                                                className="bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 border border-red-200"
                                            >
                                                Request Sub
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-2xl font-bold mb-4 text-yellow-600">Announcements</h2>
                {announcements.length === 0 ? (
                    <p>No announcements available.</p>
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

            {/* Shift Requests Status */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-2xl font-bold mb-4 text-purple-600">My Leave Requests</h2>
                {myShifts.length === 0 ? (
                    <p>No leave requests made.</p>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 border-b">
                                <th className="p-3">Class</th>
                                <th className="p-3">Time</th>
                                <th className="p-3">Substitute</th>
                                <th className="p-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myShifts.map(shift => (
                                <tr key={shift.id} className="border-b">
                                    <td className="p-3">{shift.timetable.subject}</td>
                                    <td className="p-3">{shift.timetable.dayOfWeek} {shift.timetable.startTime}</td>
                                    <td className="p-3">{shift.suggestedTeacher.name}</td>
                                    <td className={`p-3 font-bold ${shift.status === 'APPROVED' ? 'text-green-600' : shift.status === 'REJECTED' ? 'text-red-600' : 'text-yellow-600'}`}>
                                        {shift.status}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Incoming Shift Requests (Substitute) */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-2xl font-bold mb-4 text-blue-600">Incoming Substitute Requests</h2>
                {incomingShifts.length === 0 ? (
                    <p>No incoming requests.</p>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 border-b">
                                <th className="p-3">Requested By</th>
                                <th className="p-3">Class</th>
                                <th className="p-3">Time</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {incomingShifts.map(shift => (
                                <tr key={shift.id} className="border-b">
                                    <td className="p-3">{shift.originalTeacher.name}</td>
                                    <td className="p-3">{shift.timetable.subject} ({shift.timetable.className})</td>
                                    <td className="p-3">{shift.timetable.dayOfWeek} {shift.timetable.startTime} - {shift.timetable.endTime}</td>
                                    <td className="p-3 space-x-2">
                                        {shift.status === 'PENDING' ? (
                                            <>
                                                <button onClick={() => handleApproveShift(shift.id)} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">Accept</button>
                                                <button onClick={() => handleRejectShift(shift.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Reject</button>
                                            </>
                                        ) : (
                                            <span className={`font-bold ${shift.status === 'APPROVED' ? 'text-green-600' : 'text-red-600'}`}>
                                                {shift.status}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default TeacherDashboard;
