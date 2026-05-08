import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket.js';
import { useMediaStream } from '../hooks/useMediaStream.js';
import { useWebRTC } from '../hooks/useWebRTC.js';
import VideoPanel from '../components/VideoPanel/VideoPanel.jsx';
import ChatPanel from '../components/ChatPanel/ChatPanel.jsx';
import WaitingScreen from '../components/WaitingScreen/WaitingScreen.jsx';
import { useToast } from '../context/ToastContext.jsx';

/**
 * Chat page — "/chat" route.
 *
 * Orchestrates the three custom hooks:
 *   - useWebSocket → session state, messages, signaling dispatch
 *   - useMediaStream → local camera/mic
 *   - useWebRTC → peer connection using the socket channel for signaling
 *
 * Layout: full-height split: VideoPanel (60%) | ChatPanel (40%)
 * While matchState === 'waiting' it renders the WaitingScreen overlay.
 */
export default function Chat() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  // ── Session / socket state ───────────────────────────────────────────────
  const {
    matchState,
    isInitiator,
    messages,
    sendChat,
    skip,
    endCall,
  } = useWebSocket();

  // ── Local media ──────────────────────────────────────────────────────────
  const {
    localStream,
    isMuted,
    isCameraOff,
    permissionError,
    toggleMute,
    toggleCamera,
    stopStream,
  } = useMediaStream();

  // ── WebRTC peer connection ───────────────────────────────────────────────
  const { remoteStream, resetPeer } = useWebRTC({
    localStream,
    isInitiator,
    enabled: matchState === 'matched',
  });

  // Show permission error as a toast
  useEffect(() => {
    if (permissionError) addToast(permissionError, 'error');
  }, [permissionError, addToast]);

  // On "peer_left", reset the peer connection
  useEffect(() => {
    if (matchState === 'idle' && remoteStream) {
      resetPeer();
    }
  }, [matchState, remoteStream, resetPeer]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSkip = () => {
    resetPeer();
    skip();
  };

  const handleEnd = () => {
    stopStream();
    resetPeer();
    endCall();
    navigate('/');
  };

  const handleCancel = () => {
    endCall();
    navigate('/');
  };

  // ── Render waiting overlay ───────────────────────────────────────────────
  if (matchState === 'idle' || matchState === 'waiting') {
    return <WaitingScreen onCancel={handleCancel} />;
  }

  // ── Render chat + video ──────────────────────────────────────────────────
  return (
    <div className="h-screen bg-void-950 flex flex-col overflow-hidden animate-fade-in">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-purple-600 shadow-[0_0_8px_rgba(124,58,237,0.8)]" />
          <span className="font-bold text-gray-300 text-sm tracking-tight">VexChat</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span>Live</span>
        </div>
      </header>

      {/* Main split layout */}
      <div className="flex flex-1 gap-3 p-3 overflow-hidden">
        {/* Video panel — 60% */}
        <div className="w-[60%] min-w-0">
          <VideoPanel
            localStream={localStream}
            remoteStream={remoteStream}
            isMuted={isMuted}
            isCameraOff={isCameraOff}
            onToggleMute={toggleMute}
            onToggleCamera={toggleCamera}
            onSkip={handleSkip}
            onEnd={handleEnd}
            isConnected={matchState === 'matched'}
          />
        </div>

        {/* Chat panel — 40% */}
        <div className="w-[40%] min-w-0">
          <ChatPanel
            messages={messages}
            onSend={sendChat}
            isConnected={matchState === 'matched'}
          />
        </div>
      </div>
    </div>
  );
}
