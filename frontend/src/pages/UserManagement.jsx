import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from '../lib/axios';
import BasicLayout from '../components/Layout/BasicLayout';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Sort and Filter States
    const [sortBy, setSortBy] = useState('name'); // 'name', 'role', 'className'
    const [filterRole, setFilterRole] = useState('ALL');

    // New User State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'STUDENT',
        className: ''
    });

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('/admin/users');
            const userList = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data?.content)
                    ? res.data.content
                    : [];
            setUsers(userList);
            setError('');
        } catch (error) {
            console.error(error);
            try {
                const fallbackRes = await axios.get('/users');
                const fallbackUsers = Array.isArray(fallbackRes.data)
                    ? fallbackRes.data
                    : Array.isArray(fallbackRes.data?.content)
                        ? fallbackRes.data.content
                        : [];
                setUsers(fallbackUsers);
                setError('');
            } catch (fallbackError) {
                console.error(fallbackError);
                setUsers([]);
                setError(
                    fallbackError.response?.data?.message ||
                    error.response?.data?.message ||
                    'Failed to load users'
                );
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const toggleStatus = async (id, currentStatus) => {
        try {
            await axios.put(`/users/${id}/enable`, null, {
                params: { enabled: !currentStatus }
            });
            fetchUsers();
        } catch {
            alert('Failed to update status');
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await axios.delete(`/admin/user/delete/${id}`);
            setUsers((currentUsers) => currentUsers.filter((user) => user.id !== id));
            alert('User deleted successfully');
        } catch {
            alert('Failed to delete user. Please ensure you are an ADMIN.');
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/admin/user/add', formData);
            alert('User added successfully');
            setShowModal(false);
            setFormData({ name: '', email: '', password: '', role: 'STUDENT', className: '' });
            fetchUsers();
        } catch {
            alert('Failed to add user. Ensure the email is unique.');
        }
    };

    // Derived State for Rendering
    const filteredAndSortedUsers = useMemo(() => {
        let result = [...users];
        if (filterRole !== 'ALL') {
            result = result.filter(u => u.role === filterRole);
        }
        
        result.sort((a, b) => {
            if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
            if (sortBy === 'role') return (a.role || '').localeCompare(b.role || '');
            if (sortBy === 'className') return (a.className || '').localeCompare(b.className || '');
            return 0;
        });
        
        return result;
    }, [users, sortBy, filterRole]);

    return (
        <BasicLayout>
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700"
                    >
                        + Add User
                    </button>
                </div>
                {error && <div className="mb-4 rounded bg-red-100 p-3 text-red-700">{error}</div>}

                <div className="bg-white p-4 rounded-t-lg shadow flex flex-wrap gap-4 items-center">
                    <div>
                        <label className="mr-2 font-bold text-gray-700">Filter Role:</label>
                        <select 
                            className="border p-2 rounded" 
                            value={filterRole} 
                            onChange={(e) => setFilterRole(e.target.value)}
                        >
                            <option value="ALL">All Roles</option>
                            <option value="ADMIN">Admin</option>
                            <option value="TEACHER">Teacher</option>
                            <option value="STUDENT">Student</option>
                        </select>
                    </div>
                    <div>
                        <label className="mr-2 font-bold text-gray-700">Sort By:</label>
                        <select 
                            className="border p-2 rounded" 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="name">Name (A-Z)</option>
                            <option value="role">Role</option>
                            <option value="className">Class Name</option>
                        </select>
                    </div>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-b-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAndSortedUsers.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">
                                        {loading ? 'Loading users...' : 'No users found.'}
                                    </td>
                                </tr>
                            )}
                            {filteredAndSortedUsers.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name || user.email || 'Unnamed User'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-bold">{user.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.className || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {user.enabled ? 'Active' : 'Disabled'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => toggleStatus(user.id, user.enabled)}
                                            className={`${user.enabled ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                                        >
                                            {user.enabled ? 'Disable' : 'Enable'}
                                        </button>
                                        <button
                                            onClick={() => deleteUser(user.id)}
                                            className="text-red-600 hover:text-red-900 ml-4"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add User Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
                        <button 
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
                        >
                            &times;
                        </button>
                        <h2 className="text-2xl font-bold mb-4">Add New User</h2>
                        <form onSubmit={handleAddUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700">Name</label>
                                <input required type="text" className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
                                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700">Email</label>
                                <input required type="email" className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
                                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700">Password</label>
                                <input required type="password" className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
                                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700">Role</label>
                                <select className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
                                    value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                    <option value="STUDENT">Student</option>
                                    <option value="TEACHER">Teacher</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                            {formData.role === 'STUDENT' && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Class Name</label>
                                    <input required type="text" className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
                                        value={formData.className} onChange={e => setFormData({...formData, className: e.target.value})} />
                                </div>
                            )}
                            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 font-bold">
                                Create User
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </BasicLayout>
    );
};

export default UserManagement;
