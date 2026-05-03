import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';

const AdminLeaveApprovalPage = () => {
    const [leaves, setLeaves] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const res = await axios.get('/leave/all');
            setLeaves(Array.isArray(res.data) ? res.data : []);
            setError('');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to load leave requests');
        }
    };

    const handleAction = async (id, action) => {
        try {
            await axios.put(`/leave/${id}/${action}`);
            fetchLeaves(); // Refresh list
        } catch (err) {
            alert(err.response?.data?.message || `Failed to ${action} leave`);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Leave Requests</h1>
            {error && <div className="mb-4 rounded bg-red-100 p-3 text-red-700">{error}</div>}

            <div className="bg-white rounded shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left">Teacher Name</th>
                            <th className="p-3 text-left">Period</th>
                            <th className="p-3 text-left">Reason</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaves.map(leave => (
                            <tr key={leave.id} className="border-t">
                                <td className="p-3">{leave.teacher?.name || "Unknown"}</td>
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
                                <td className="p-3 flex gap-2">
                                    {leave.status === 'PENDING' && (
                                        <>
                                            <button
                                                onClick={() => handleAction(leave.id, 'approve')}
                                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleAction(leave.id, 'reject')}
                                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminLeaveApprovalPage;
