import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import BasicLayout from '../components/Layout/BasicLayout';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeRole, setActiveRole] = useState('STUDENT'); // Tabs: STUDENT, TEACHER, ADMIN
  const { login } = useAuth();
  const navigate = useNavigate();

  const tabs = [
    { id: 'STUDENT', label: 'Student' },
    { id: 'TEACHER', label: 'Teacher' },
    { id: 'ADMIN', label: 'Admin' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await login(email, password);

      if (res.success) {
        // Navigate based on role from backend
        if (res.role === 'ADMIN') navigate('/admin');
        else if (res.role === 'TEACHER') navigate('/teacher');
        else navigate('/student');
      } else {
        setError(res.message);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Login failed');
    }
  };

  return (
    <BasicLayout>
      <div className="max-w-md mx-auto">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>

        {/* Role Tabs */}
        <div className="flex justify-center mt-6 space-x-4 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveRole(tab.id);
                setError('');
              }}
              className={`pb-2 px-4 text-sm font-medium transition-colors duration-200 ${
                activeRole === tab.id
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label} Login
            </button>
          ))}
        </div>

        <p className="mt-4 text-center text-sm text-gray-600">
          Or{' '}
          <Link
            to="/register"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            register for a new account
          </Link>
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-md shadow-sm -space-y-px">
          <div>
            <input
              type="email"
              required
              placeholder={`${activeRole.charAt(0) + activeRole.slice(1).toLowerCase()} Email`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center font-bold bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign in as {activeRole.charAt(0) + activeRole.slice(1).toLowerCase()}
          </button>
        </div>
      </form>
    </BasicLayout>
  );
};

export default Login;