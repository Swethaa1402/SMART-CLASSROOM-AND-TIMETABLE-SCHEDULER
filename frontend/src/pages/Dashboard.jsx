import React from 'react';
import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';
import AdminDashboard from './AdminDashboard';
import { useAuth } from '../context/AuthContext.jsx';

const Dashboard = () => {
    const { user } = useAuth();

    if (!user) return <div className="p-10 text-center">Loading...</div>;

    if (user.role === 'ADMIN') return <AdminDashboard />;
    if (user.role === 'TEACHER') return <TeacherDashboard />;
    return <StudentDashboard />;
};

export default Dashboard;