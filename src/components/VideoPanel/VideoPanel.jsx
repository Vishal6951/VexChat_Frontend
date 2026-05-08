import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import ControlBar from '../ControlBar/ControlBar.jsx';

/**
 * VideoPanel — left 60% of the chat page.
 * Shows the remote video feed (full panel) with a local PiP overlay (bottom-right).
 *
 * @param {{
 *   localStream: MediaStream|null,
 *   remoteStream: MediaStream|null,
 *   isMuted: boolean,
 *   isCameraOff: boolean,
 *   onToggleMute: Function,
 *   onToggleCamera: Function,
 *   onSkip: Function,
 *   onEnd: Function,
 *   isConnected: boolean,
 * }} props
 */
export default function VideoPanel({
  localStream,
  remoteStream,
  isMuted,
  isCameraOff,
  onToggleMute,
  onToggleCamera,
  onSkip,
  onEnd,
  isConnected,
}) {
  const localRef = useRef(null);
  const remoteRef = useRef(null);

  // Attach streams to video elements
  useEffect(() => {
    if (localRef.current && localStream) {
      localRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteRef.current) {
      remoteRef.current.srcObject = remoteStream || null;
    }
  }, [remoteStream]);

  return (
    <div className="relative flex flex-col h-full bg-void-900 rounded-2xl overflow-hidden">
      {/* ── Remote video (main) ──────────────────────────────────────────── */}
      <div className="relative flex-1 bg-void-950">
        {remoteStream ? (
          <video
            ref={remoteRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <WaitingPlaceholder isConnected={isConnected} />
        )}

        {/* ── Local video PiP ─────────────────────────────────────────── */}
        <div className="absolute bottom-3 right-3 w-24 h-16 sm:w-36 sm:h-24 md:w-44 md:h-28 rounded-xl overflow-hidden border border-purple-600/30 shadow-[0_0_20px_rgba(124,58,237,0.3)] z-10">
          {localStream && !isCameraOff ? (
            <video
              ref={localRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            <div className="w-full h-full bg-void-800 flex items-center justify-center">
              <span className="text-xs text-gray-600">Camera off</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Controls ────────────────────────────────────────────────────── */}
      <div className="p-3 bg-void-900/80 border-t border-white/5">
        <ControlBar
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          onToggleMute={onToggleMute}
          onToggleCamera={onToggleCamera}
          onSkip={onSkip}
          onEnd={onEnd}
          disabled={!isConnected}
        />
      </div>
    </div>
  );
}

VideoPanel.propTypes = {
  localStream: PropTypes.object,
  remoteStream: PropTypes.object,
  isMuted: PropTypes.bool.isRequired,
  isCameraOff: PropTypes.bool.isRequired,
  onToggleMute: PropTypes.func.isRequired,
  onToggleCamera: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired,
  onEnd: PropTypes.func.isRequired,
  isConnected: PropTypes.bool.isRequired,
};

/** WaitingPlaceholder — shown in the remote video area when not connected. */
function WaitingPlaceholder({ isConnected }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      {/* Pulsing orb */}
      <div className="relative flex items-center justify-center">
        <div className="absolute w-24 h-24 rounded-full bg-purple-600/10 ring-animate" />
        <div className="absolute w-24 h-24 rounded-full bg-purple-600/10 ring-animate-delay" />
        <div className="w-16 h-16 rounded-full bg-purple-950/60 border border-purple-600/30 orb-pulse flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-purple-600/40" />
        </div>
      </div>
      <p className="text-gray-600 text-sm">
        {isConnected ? 'Waiting for stranger...' : 'Not connected'}
      </p>
    </div>
  );
}
