import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';

/**
 * MessageBubble — renders a single chat message.
 *
 * @param {{ message: { id: string, text: string, from: 'me'|'stranger'|'system', timestamp: number } }} props
 */
export default function MessageBubble({ message }) {
  const { text, from, timestamp } = message;
  const isMe = from === 'me';
  const isSystem = from === 'system';
  const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isSystem) {
    return (
      <div className="flex justify-center my-2 animate-fade-in">
        <span className="text-xs text-gray-600 bg-void-800/60 px-3 py-1 rounded-full border border-white/5">
          {text}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-3 animate-slide-up`}>
      <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isMe
              ? 'bg-purple-600 text-white rounded-br-sm shadow-[0_0_12px_rgba(124,58,237,0.3)]'
              : 'bg-void-700/80 text-gray-300 rounded-bl-sm border border-white/5'
          }`}
        >
          {text}
        </div>
        <span className="text-[10px] text-gray-600 px-1">{time}</span>
      </div>
    </div>
  );
}

MessageBubble.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    from: PropTypes.oneOf(['me', 'stranger', 'system']).isRequired,
    timestamp: PropTypes.number.isRequired,
  }).isRequired,
};

/**
 * ScrollAnchor — auto-scrolls to keep the latest message visible.
 */
export function ScrollAnchor() {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  });
  return <div ref={ref} />;
}
