import PropTypes from 'prop-types';
import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import MessageBubble, { ScrollAnchor } from '../MessageBubble/MessageBubble.jsx';

/**
 * ChatPanel — right 40% of the chat page.
 * Shows the message list and an input bar at the bottom.
 *
 * @param {{
 *   messages: Array,
 *   onSend: Function,
 *   isConnected: boolean,
 * }} props
 */
export default function ChatPanel({ messages, onSend, isConnected }) {
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || !isConnected) return;
    onSend(trimmed);
    setText('');
    inputRef.current?.focus();
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Focus input when connected
  useEffect(() => {
    if (isConnected) inputRef.current?.focus();
  }, [isConnected]);

  return (
    <div className="flex flex-col h-full glass-purple rounded-2xl overflow-hidden">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.8)]' : 'bg-gray-600'}`} />
        <span className="text-sm text-gray-400 font-medium">
          {isConnected ? 'Stranger connected' : 'Waiting...'}
        </span>
      </div>

      {/* ── Message list ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-700 text-sm text-center leading-relaxed">
              Messages will appear here<br />
              <span className="text-gray-600 text-xs">when you're connected to a stranger.</span>
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <ScrollAnchor />
      </div>

      {/* ── Input bar ───────────────────────────────────────────────── */}
      <div className="px-3 pb-3 pt-2 border-t border-white/5">
        <div className="flex items-center gap-2 glass rounded-xl px-3 py-2">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKey}
            disabled={!isConnected}
            placeholder={isConnected ? 'Type a message...' : 'Not connected...'}
            maxLength={1000}
            className="flex-1 bg-transparent text-sm text-gray-200 placeholder:text-gray-600 input-focus outline-none disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={!isConnected || !text.trim()}
            aria-label="Send message"
            className="p-1.5 rounded-lg text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed glow-btn"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

ChatPanel.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.object).isRequired,
  onSend: PropTypes.func.isRequired,
  isConnected: PropTypes.bool.isRequired,
};
