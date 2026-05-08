import PropTypes from 'prop-types';
import { Mic, MicOff, Video, VideoOff, SkipForward, PhoneOff } from 'lucide-react';

/**
 * ControlBar — bottom controls for the video panel.
 *
 * @param {{
 *   isMuted: boolean,
 *   isCameraOff: boolean,
 *   onToggleMute: Function,
 *   onToggleCamera: Function,
 *   onSkip: Function,
 *   onEnd: Function,
 *   disabled: boolean,
 * }} props
 */
export default function ControlBar({
  isMuted,
  isCameraOff,
  onToggleMute,
  onToggleCamera,
  onSkip,
  onEnd,
  disabled,
}) {
  return (
    <div className="flex items-center justify-center gap-3 p-4 glass rounded-2xl">
      {/* Mute */}
      <ControlButton
        onClick={onToggleMute}
        active={isMuted}
        activeClass="bg-red-500/20 border-red-500/50 text-red-400"
        label={isMuted ? 'Unmute' : 'Mute'}
        disabled={disabled}
      >
        {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
      </ControlButton>

      {/* Camera */}
      <ControlButton
        onClick={onToggleCamera}
        active={isCameraOff}
        activeClass="bg-red-500/20 border-red-500/50 text-red-400"
        label={isCameraOff ? 'Show camera' : 'Hide camera'}
        disabled={disabled}
      >
        {isCameraOff ? <VideoOff size={20} /> : <Video size={20} />}
      </ControlButton>

      {/* Skip */}
      <ControlButton
        onClick={onSkip}
        label="Skip stranger"
        disabled={disabled}
        className="px-5"
      >
        <SkipForward size={20} />
        <span className="text-sm font-medium hidden sm:inline">Skip</span>
      </ControlButton>

      {/* End call */}
      <ControlButton
        onClick={onEnd}
        label="End call"
        className="bg-red-600/20 border-red-500/40 text-red-400 hover:bg-red-600/40 hover:border-red-500/70 hover:shadow-[0_0_16px_rgba(239,68,68,0.4)] px-5"
      >
        <PhoneOff size={20} />
        <span className="text-sm font-medium hidden sm:inline">End</span>
      </ControlButton>
    </div>
  );
}

ControlBar.propTypes = {
  isMuted: PropTypes.bool.isRequired,
  isCameraOff: PropTypes.bool.isRequired,
  onToggleMute: PropTypes.func.isRequired,
  onToggleCamera: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired,
  onEnd: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

ControlBar.defaultProps = { disabled: false };

/**
 * ControlButton — individual icon button inside the control bar.
 */
function ControlButton({ children, onClick, label, active, activeClass, disabled, className = '' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`
        flex items-center gap-2 px-3 py-2.5 rounded-xl border
        text-gray-400 transition-all duration-200
        glass glow-btn
        disabled:opacity-40 disabled:cursor-not-allowed
        ${active ? activeClass : 'hover:text-purple-400 hover:border-purple-500/50 hover:bg-purple-500/10'}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
