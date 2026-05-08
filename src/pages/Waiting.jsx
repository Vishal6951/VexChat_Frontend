import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import WaitingScreen from '../components/WaitingScreen/WaitingScreen.jsx';
import { useSocket } from '../context/SocketContext.jsx';

/**
 * Waiting page — "/waiting" route.
 * Connects the WebSocket (if not already open) and displays the animated
 * WaitingScreen until the "matched" message redirects to /chat.
 */
export default function Waiting() {
  const navigate = useNavigate();
  const { connect, on } = useSocket();

  useEffect(() => {
    connect();
  }, [connect]);

  // Redirect to /chat when matched
  useEffect(() => {
    const unsub = on('matched', () => navigate('/chat'));
    return unsub;
  }, [on, navigate]);

  const handleCancel = () => {
    navigate('/');
  };

  return <WaitingScreen onCancel={handleCancel} />;
}
