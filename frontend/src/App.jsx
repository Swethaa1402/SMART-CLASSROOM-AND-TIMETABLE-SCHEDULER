import React from "react";
import { Routes, Route } from 'react-router-dom';
import AdminTimetablePage from './pages/AdminTimetablePage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TimetablePage from './pages/TimetablePage';
import AttendancePage from './pages/AttendancePage';
import SmartClassroom from './pages/SmartClassroom';
import Notepad from './pages/Notepad';

import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

import UserManagement from './pages/UserManagement';
import AnnouncementsManagement from './pages/AnnouncementsManagement';

import StudentQuestionPage from './pages/StudentQuestionPage';
import ChatbotPage from './pages/ChatbotPage';

import LeaveApplicationPage from './pages/LeaveApplicationPage';
import AdminLeaveApprovalPage from './pages/AdminLeaveApprovalPage';
import TeacherQnAPage from './pages/TeacherQnAPage';

function App() {

  return (

    <AuthProvider>

      <Routes>

        {/* Public Routes */}

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />


        {/* All Logged Users */}

        <Route element={<ProtectedRoute />}>

          <Route path="/" element={<Dashboard />} />

          <Route path="/timetable" element={<TimetablePage />} />

          <Route path="/attendance" element={<AttendancePage />} />

          <Route path="/smart-classroom" element={<SmartClassroom />} />

          <Route path="/notepad" element={<Notepad />} />

          <Route path="/profile" element={<Dashboard />} />

        </Route>


        {/* ADMIN */}

        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>

          <Route path="/admin" element={<Dashboard />} />

          <Route path="/admin/users" element={<UserManagement />} />

          <Route path="/admin/timetable" element={<AdminTimetablePage />} />

          <Route path="/admin/announcements" element={<AnnouncementsManagement />} />

          <Route path="/admin/leaves" element={<AdminLeaveApprovalPage />} />
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/timetable" element={<AdminTimetablePage />} />
          </Route>
        </Route>


        {/* STUDENT */}

        <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>

          <Route path="/student" element={<Dashboard />} />

          <Route path="/student/questions" element={<StudentQuestionPage />} />

          <Route path="/student/chatbot" element={<ChatbotPage />} />

        </Route>


        {/* TEACHER */}

        <Route element={<ProtectedRoute allowedRoles={['TEACHER']} />}>

          <Route path="/teacher" element={<Dashboard />} />

          <Route path="/teacher/leave" element={<LeaveApplicationPage />} />

          <Route path="/teacher/questions" element={<TeacherQnAPage />} />

        </Route>


        {/* Unauthorized */}

        <Route
          path="/unauthorized"
          element={
            <div className="p-10 text-center text-red-500">
              Unauthorized Access
            </div>
          }
        />

      </Routes>

    </AuthProvider>

  );

}

export default App;