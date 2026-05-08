import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket.js';
import { useMediaStream } from '../hooks/useMediaStream.js';
import { useWebRTC } from '../hooks/useWebRTC.js';
import VideoPanel from '../components/VideoPanel/VideoPanel.jsx';
import ChatPanel from '../components/ChatPanel/ChatPanel.jsx';
import WaitingScreen from '../components/WaitingScreen/WaitingScreen.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { MessageSquare, Video } from 'lucide-react';

/**
 * Chat page — "/chat" route.
 *
 * Desktop (md+): side-by-side  VideoPanel 60% | ChatPanel 40%
 * Mobile:        stacked with a tab bar to toggle between Video and Chat views.
 */
export default function Chat() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Mobile tab state — 'video' | 'chat'
  const [mobileTab, setMobileTab] = useState('video');

  const {
    matchState,
    isInitiator,
    messages,
    sendChat,
    skip,
    endCall,
  } = useWebSocket();

  const {
    localStream,
    isMuted,
    isCameraOff,
    permissionError,
    toggleMute,
    toggleCamera,
    stopStream,
  } = useMediaStream();

  const { remoteStream, resetPeer } = useWebRTC({
    localStream,
    isInitiator,
    enabled: matchState === 'matched',
  });

  useEffect(() => {
    if (permissionError) addToast(permissionError, 'error');
  }, [permissionError, addToast]);

  useEffect(() => {
    if (matchState === 'idle' && remoteStream) resetPeer();
  }, [matchState, remoteStream, resetPeer]);

  // Notify unread messages on mobile when on video tab
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    if (mobileTab === 'video' && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.from === 'stranger') setUnread((n) => n + 1);
    }
  }, [messages]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTabChange = (tab) => {
    setMobileTab(tab);
    if (tab === 'chat') setUnread(0);
  };

  const handleSkip = () => { resetPeer(); skip(); };
  const handleEnd  = () => { stopStream(); resetPeer(); endCall(); navigate('/'); };
  const handleCancel = () => { endCall(); navigate('/'); };

  if (matchState === 'idle' || matchState === 'waiting') {
    return <WaitingScreen onCancel={handleCancel} />;
  }

  return (
    <div className="h-[100dvh] bg-void-950 flex flex-col overflow-hidden animate-fade-in">
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-purple-600 shadow-[0_0_8px_rgba(124,58,237,0.8)]" />
          <span className="font-bold text-gray-300 text-sm tracking-tight">VexChat</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span>Live</span>
        </div>
      </header>

      {/* ── Desktop layout (md+): side by side ───────────────────────────── */}
      <div className="hidden md:flex flex-1 gap-3 p-3 overflow-hidden">
        <div className="w-[60%] min-w-0">
          <VideoPanel
            localStream={localStream} remoteStream={remoteStream}
            isMuted={isMuted} isCameraOff={isCameraOff}
            onToggleMute={toggleMute} onToggleCamera={toggleCamera}
            onSkip={handleSkip} onEnd={handleEnd}
            isConnected={matchState === 'matched'}
          />
        </div>
        <div className="w-[40%] min-w-0">
          <ChatPanel
            messages={messages} onSend={sendChat}
            isConnected={matchState === 'matched'}
          />
        </div>
      </div>

      {/* ── Mobile layout: tabbed ─────────────────────────────────────────── */}
      <div className="flex md:hidden flex-1 flex-col overflow-hidden">
        {/* Tab content */}
        <div className="flex-1 overflow-hidden">
          {mobileTab === 'video' ? (
            <VideoPanel
              localStream={localStream} remoteStream={remoteStream}
              isMuted={isMuted} isCameraOff={isCameraOff}
              onToggleMute={toggleMute} onToggleCamera={toggleCamera}
              onSkip={handleSkip} onEnd={handleEnd}
              isConnected={matchState === 'matched'}
            />
          ) : (
            <ChatPanel
              messages={messages} onSend={sendChat}
              isConnected={matchState === 'matched'}
            />
          )}
        </div>

        {/* Mobile tab bar */}
        <div className="shrink-0 flex border-t border-white/10 bg-void-900">
          <button
            onClick={() => handleTabChange('video')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-xs transition-colors ${
              mobileTab === 'video'
                ? 'text-purple-400 border-t-2 border-purple-500 -mt-px'
                : 'text-gray-600 hover:text-gray-400'
            }`}
            aria-label="Video"
          >
            <Video size={18} />
            <span>Video</span>
          </button>
          <button
            onClick={() => handleTabChange('chat')}
            className={`relative flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-xs transition-colors ${
              mobileTab === 'chat'
                ? 'text-purple-400 border-t-2 border-purple-500 -mt-px'
                : 'text-gray-600 hover:text-gray-400'
            }`}
            aria-label="Chat"
          >
            <MessageSquare size={18} />
            <span>Chat</span>
            {unread > 0 && mobileTab === 'video' && (
              <span className="absolute top-2 right-[calc(50%-20px)] w-4 h-4 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center font-bold">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
