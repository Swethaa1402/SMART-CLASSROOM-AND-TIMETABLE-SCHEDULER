import React, { useState, useEffect, useCallback } from 'react';
import axios from '../lib/axios';
import { useAuth } from '../context/AuthContext';

const AttendancePage = () => {
    const { user } = useAuth();
    const [className, setClassName] = useState(user?.className || '');
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [subject, setSubject] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchStudents = useCallback(async () => {
        try {
            const res = await axios.get(`/attendance/class/${className}`);
            setStudents(res.data);
            // Initialize attendance as true (Present) for all
            const initialAttendance = {};
            res.data.forEach(s => initialAttendance[s.id] = true);
            setAttendance(initialAttendance);
        } catch (err) {
            console.error(err);
        }
    }, [className]);

    useEffect(() => {
        if (className) fetchStudents();
    }, [className, fetchStudents]);

    const toggleAttendance = (id) => {
        setAttendance(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const submitAttendance = async () => {
        if (!subject) return alert("Please enter a subject");
        setLoading(true);
        try {
            const presentStudentIds = Object.keys(attendance).filter(id => attendance[id]).map(Number);
            const absentStudentIds = Object.keys(attendance).filter(id => !attendance[id]).map(Number);

            await axios.post('/attendance/batch', {
                className,
                subject,
                presentStudentIds,
                absentStudentIds
            });
            alert('Attendance marked successfully');
        } catch (err) {
            alert('Failed to mark attendance');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Mark Attendance</h1>

            <div className="bg-white p-6 rounded shadow mb-6">
                <div className="flex gap-4 mb-4">
                    <input
                        className="border p-2 rounded flex-grow"
                        placeholder="Class Name (e.g., CS-A)"
                        value={className}
                        onChange={e => setClassName(e.target.value)}
                    />
                    <input
                        className="border p-2 rounded flex-grow"
                        placeholder="Subject (e.g., Java)"
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                    />
                    <button onClick={fetchStudents} className="bg-blue-500 text-white px-4 py-2 rounded">
                        Fetch Students
                    </button>
                </div>
            </div>

            {students.length > 0 && (
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-bold mb-4">Student List - {className}</h2>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b bg-gray-100">
                                <th className="p-3">ID</th>
                                <th className="p-3">Name</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => (
                                <tr key={student.id} className="border-b">
                                    <td className="p-3">{student.id}</td>
                                    <td className="p-3">{student.name}</td>
                                    <td className={`p-3 font-bold ${attendance[student.id] ? 'text-green-600' : 'text-red-600'}`}>
                                        {attendance[student.id] ? 'PRESENT' : 'ABSENT'}
                                    </td>
                                    <td className="p-3">
                                        <button
                                            onClick={() => toggleAttendance(student.id)}
                                            className={`px-3 py-1 rounded text-white ${attendance[student.id] ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                                        >
                                            {attendance[student.id] ? 'Mark Absent' : 'Mark Present'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={submitAttendance}
                            disabled={loading}
                            className="bg-purple-600 text-white px-6 py-3 rounded text-lg font-bold hover:bg-purple-700 disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Submit Attendance'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendancePage;
