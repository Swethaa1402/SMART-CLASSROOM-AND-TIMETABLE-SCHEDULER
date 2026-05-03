import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { useAuth } from '../context/AuthContext';

const LeaveApplicationPage = () => {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [reason, setReason] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) fetchLeaves();
    }, [user]);

    const fetchLeaves = async () => {
        try {
            const res = await axios.get(`/leave/my?email=${user.email}`);
            setLeaves(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const submitLeave = async () => {
        if (!reason || !fromDate || !toDate) return alert("Fill all fields");
        setLoading(true);
        try {
            await axios.post('/leave/apply', {
                teacherId: user.id,
                reason,
                fromDate,
                toDate
            });
            setReason('');
            setFromDate('');
            setToDate('');
            fetchLeaves();
            alert('Leave Applied Successfully');
        } catch (err) {
            alert('Failed to apply leave');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Apply for Leave</h1>

            <div className="bg-white p-6 rounded shadow mb-6 max-w-md">
                <input
                    type="date"
                    className="w-full border p-3 rounded mb-4"
                    value={fromDate}
                    onChange={e => setFromDate(e.target.value)}
                />
                <input
                    type="date"
                    className="w-full border p-3 rounded mb-4"
                    value={toDate}
                    onChange={e => setToDate(e.target.value)}
                />
                <textarea
                    className="w-full border p-3 rounded mb-4"
                    rows="3"
                    placeholder="Reason for leave..."
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                />
                <button
                    onClick={submitLeave}
                    disabled={loading}
                    className="w-full bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                >
                    {loading ? 'Submitting...' : 'Apply Leave'}
                </button>
            </div>

            <h2 className="text-2xl font-bold mb-4">My Leave History</h2>
            <div className="bg-white rounded shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left">Period</th>
                            <th className="p-3 text-left">Reason</th>
                            <th className="p-3 text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaves.map(leave => (
                            <tr key={leave.id} className="border-t">
                                <td className="p-3">{leave.fromDate} to {leave.toDate}</td>
                                <td className="p-3">{leave.reason}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded text-sm ${leave.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                            leave.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {leave.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LeaveApplicationPage;
