// src/components/DashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from '../../lib/axios';
import { LayoutDashboard, LogOut, Calendar, User, BookOpen, FileText } from 'lucide-react';

const DashboardLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [streak, setStreak] = useState(null);

    // Fetch student streak from backend
    useEffect(() => {
        const fetchStreak = async () => {
            try {
                const res = await axios.get(`/users/${user?.id}/streak`);
                setStreak(res.data);
            } catch (err) {
                console.error("Error fetching streak:", err);
            }
        };

        if (user?.role === 'STUDENT') {
            fetchStreak();
        }
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { label: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
        { label: 'Timetable', path: '/timetable', icon: <Calendar size={20} /> },
        { label: 'Profile', path: '/profile', icon: <User size={20} /> },
        { label: 'Notes', path: '/notes', icon: <FileText size={20} /> },
    ];

    if (user?.role === 'ADMIN') {
        navItems.push({ label: 'Manage Users', path: '/admin/users', icon: <BookOpen size={20} /> });
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold text-indigo-600">SmartClass</h1>
                    <p className="text-sm text-gray-500 mt-1">{user?.role} Portal</p>
                </div>
                <nav className="p-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${location.pathname === item.path
                                    ? 'bg-indigo-50 text-indigo-700'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-md text-red-600 hover:bg-red-50 transition-colors mt-8"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white shadow-sm p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            Welcome, {user?.name}
                        </h2>

                        {/* Show streak only for students */}
                        {user?.role === 'STUDENT' && streak !== null && (
                            <p className="text-green-600 font-medium mt-1">
                                Current Streak: {streak} {streak === 1 ? 'day' : 'days'}
                            </p>
                        )}
                    </div>

                    <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                </header>

                <div className="p-6">{children}</div>
            </main>
        </div>
    );
};

export default DashboardLayout;