import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const [pendingShifts, setPendingShifts] = useState([]);

    useEffect(() => {
        fetchPendingShifts();
    }, []);

    const fetchPendingShifts = async () => {
        try {
            const res = await axios.get('/shifts/pending');
            setPendingShifts(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleShift = async (id, action) => {
        try {
            await axios.post(`/shifts/${action}/${id}`);
            fetchPendingShifts();
            alert(`Shift ${action}d successfully`);
        } catch (err) {
            alert('Action failed');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 transition">
                    Logout
                </button>
            </div>

            <div className="bg-white p-6 shadow-md rounded-lg mb-6">
                <h2 className="text-xl font-semibold mb-4">Pending Shift Approvals</h2>
                {pendingShifts.length === 0 ? (
                    <p className="text-gray-500">No pending shift requests.</p>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b">
                                <th className="p-2">Absent Teacher</th>
                                <th className="p-2">Subject</th>
                                <th className="p-2">Time</th>
                                <th className="p-2">Suggested Substitute</th>
                                <th className="p-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingShifts.map(shift => (
                                <tr key={shift.id} className="border-b">
                                    <td className="p-2">{shift.originalTeacher.name}</td>
                                    <td className="p-2">{shift.timetable.subject}</td>
                                    <td className="p-2 text-sm text-gray-600">
                                        {shift.timetable.dayOfWeek} {shift.timetable.startTime}-{shift.timetable.endTime}
                                    </td>
                                    <td className="p-2 font-bold text-green-600">{shift.suggestedTeacher.name}</td>
                                    <td className="p-2 space-x-2">
                                        <button
                                            onClick={() => handleShift(shift.id, 'approve')}
                                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleShift(shift.id, 'reject')}
                                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                        >
                                            Reject
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded shadow">
                    <h3 className="font-bold text-lg">Manage Users</h3>
                    <p>Add, edit, or disable student/teacher accounts.</p>
                    <Link to="/admin/users" className="mt-2 inline-block text-blue-600 font-semibold hover:underline">
                        Go to User Management &rarr;
                    </Link>
                </div>
                <div className="bg-purple-50 p-6 rounded shadow">
                    <h3 className="font-bold text-lg">Manage Timetables</h3>
                    <p>Edit master timetables for all classes.</p>
                    <Link to="/admin/timetable" className="mt-2 inline-block text-purple-600 font-semibold hover:underline">
                        Go to Timetables &rarr;
                    </Link>
                </div>
                <div className="bg-yellow-50 p-6 rounded shadow">
                    <h3 className="font-bold text-lg">Announcements</h3>
                    <p>Post updates for students and teachers.</p>
                    <Link to="/admin/announcements" className="mt-2 inline-block text-yellow-600 font-semibold hover:underline">
                        Manage Announcements &rarr;
                    </Link>
                </div>
                <div className="bg-green-50 p-6 rounded shadow">
                    <h3 className="font-bold text-lg">Leave Approvals</h3>
                    <p>Approve or decline teacher leave requests.</p>
                    <Link to="/admin/leaves" className="mt-2 inline-block text-green-600 font-semibold hover:underline">
                        Manage Leaves &rarr;
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
