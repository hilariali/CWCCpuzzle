import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Register from './pages/Register';
import Login from './pages/Login';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ClassView from './pages/ClassView';
import Home from './pages/Home'; // Teacher Library
import Editor from './pages/Editor';
import Lesson from './pages/Lesson';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="p-12 text-center">Loading auth...</div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <div className="p-12 text-center">Access Denied</div>;
  }

  return children;
};

// Redirect root based on role
const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'teacher') return <Navigate to="/dashboard/teacher" />;
  return <Navigate to="/dashboard/student" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-background text-foreground font-sans antialiased">
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Root Redirect */}
            <Route path="/" element={<RootRedirect />} />

            {/* Teacher Routes */}
            <Route path="/dashboard/teacher" element={
              <ProtectedRoute roles={['teacher']}>
                <TeacherDashboard />
              </ProtectedRoute>
            } />
            <Route path="/library" element={
              <ProtectedRoute roles={['teacher']}>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/editor" element={
              <ProtectedRoute roles={['teacher']}>
                <Editor />
              </ProtectedRoute>
            } />
            <Route path="/editor/:videoId" element={
              <ProtectedRoute roles={['teacher']}>
                <Editor />
              </ProtectedRoute>
            } />

            {/* Student Routes */}
            <Route path="/dashboard/student" element={
              <ProtectedRoute roles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/watch/:videoId" element={
              <ProtectedRoute roles={['student', 'teacher']}>
                <Lesson />
              </ProtectedRoute>
            } />

            {/* Shared Route */}
            <Route path="/class/:classId" element={
              <ProtectedRoute roles={['teacher', 'student']}>
                <ClassView />
              </ProtectedRoute>
            } />

          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

