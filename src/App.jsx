import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import Home from './pages/Home.jsx';
import Chat from './pages/Chat.jsx';
import Waiting from './pages/Waiting.jsx';
import ToastContainer from './components/Toast/ToastContainer.jsx';

/**
 * App — root component. Provides global context and client-side routing.
 */
export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <SocketProvider>
          <ToastContainer />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/waiting" element={<Waiting />} />
            <Route path="/chat" element={<Chat />} />
            {/* Fallback to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
