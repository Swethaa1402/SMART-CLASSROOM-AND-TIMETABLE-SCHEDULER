import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import axios from '../lib/axios';
import { useAuth } from '../context/AuthContext';

const TimetablePage = () => {
    const { user } = useAuth();
    const [timetable, setTimetable] = useState([]);


    const fetchTimetable = useCallback(async () => {
        try {
            const res = await axios.get(`/timetable?className=${user.className}`);
            setTimetable(res.data);
        } catch (err) {
            console.error(err);
        }
    }, [user.className]);

    useEffect(() => {
        if (user?.className) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchTimetable();
        }
    }, [user, fetchTimetable]);

    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

    return (
        <DashboardLayout>
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Class Timetable</h2>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                    Download PDF
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period & Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {days.map(day => {
                                const dayClasses = timetable.filter(t => t.dayOfWeek === day);
                                if (dayClasses.length === 0) return null;

                                return dayClasses.map((t, idx) => (
                                    <tr key={t.id} className="hover:bg-gray-50">
                                        {idx === 0 && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 bg-gray-50" rowSpan={dayClasses.length}>
                                                {day}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className="font-bold">Period {t.periodNumber}</span><br />
                                            {t.startTime} - {t.endTime}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                                            {t.subject}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {t.room}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {t.teacher?.name || 'TBA'}
                                        </td>
                                    </tr>
                                ));
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default TimetablePage;
