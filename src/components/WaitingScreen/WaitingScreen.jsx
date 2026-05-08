import { useNavigate } from 'react-router-dom';

/**
 * WaitingScreen — animated "searching for a stranger" screen.
 * @param {{ onCancel: Function }} props
 */
export default function WaitingScreen({ onCancel }) {
  const navigate = useNavigate();

  const handleCancel = () => {
    if (onCancel) onCancel();
    else navigate('/');
  };

  return (
    <div className="min-h-screen bg-void-950 flex flex-col items-center justify-center px-4 animate-fade-in">
      {/* ── Orb animation ─────────────────────────────────────────────── */}
      <div className="relative flex items-center justify-center mb-10">
        {/* Expanding rings */}
        <div className="absolute w-48 h-48 rounded-full border border-purple-600/20 ring-animate" />
        <div className="absolute w-48 h-48 rounded-full border border-purple-500/15 ring-animate-delay" />
        <div className="absolute w-48 h-48 rounded-full border border-purple-400/10 ring-animate-delay-2" />

        {/* Inner rings */}
        <div className="absolute w-32 h-32 rounded-full border border-purple-600/30 animate-spin-slow opacity-50" />

        {/* Core orb */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-950 to-purple-900 border border-purple-600/40 orb-pulse flex items-center justify-center shadow-[inset_0_0_30px_rgba(124,58,237,0.3)]">
          <div className="w-10 h-10 rounded-full bg-purple-600/30 blur-sm" />
          <div className="absolute w-8 h-8 rounded-full bg-purple-500/20" />
        </div>
      </div>

      {/* ── Text ──────────────────────────────────────────────────────── */}
      <h2 className="text-2xl font-semibold text-gray-200 mb-2">
        Searching the void
      </h2>
      <p className="text-gray-500 text-sm mb-8">Finding a stranger in the void...</p>

      {/* ── Bouncing dots ─────────────────────────────────────────────── */}
      <div className="flex gap-2 mb-10">
        <div className="w-2.5 h-2.5 rounded-full bg-purple-500 dot-1" />
        <div className="w-2.5 h-2.5 rounded-full bg-purple-400 dot-2" />
        <div className="w-2.5 h-2.5 rounded-full bg-purple-300 dot-3" />
      </div>

      {/* ── Cancel ────────────────────────────────────────────────────── */}
      <button
        onClick={handleCancel}
        className="px-6 py-2.5 rounded-xl glass border border-white/10 text-gray-400 text-sm hover:text-gray-200 hover:border-white/20 transition-all duration-200"
      >
        Cancel
      </button>
    </div>
  );
}
