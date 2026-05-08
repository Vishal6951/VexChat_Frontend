import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Chat from './pages/Chat.jsx';
import Waiting from './pages/Waiting.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ToastContainer from './components/Toast/ToastContainer.jsx';

/**
 * App — root component.
 * Provider order: Auth (outermost) → Toast → Socket → Router
 * Auth must wrap Socket so SocketContext can read the access token.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <SocketProvider>
            <ToastContainer />
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/waiting"
                element={
                  <ProtectedRoute>
                    <Waiting />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </SocketProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
