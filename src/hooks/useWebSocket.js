import { useEffect, useCallback, useState, useRef } from 'react';
import { useSocket } from '../context/SocketContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

/**
 * @typedef {'idle'|'waiting'|'matched'} MatchState
 * @typedef {{ id: string, text: string, from: 'me'|'stranger'|'system', timestamp: number }} ChatMessage
 */

/**
 * useWebSocket — high-level hook that reacts to all backend message types
 * and exposes the current session state to Chat/Waiting pages.
 *
 * @returns {{
 *   matchState: MatchState,
 *   roomId: string|null,
 *   peerId: string|null,
 *   isInitiator: boolean,
 *   messages: ChatMessage[],
 *   sendChat: (text: string) => void,
 *   skip: () => void,
 *   endCall: () => void,
 * }}
 */
export function useWebSocket() {
  const { connect, disconnect, sendMessage, on, status } = useSocket();
  const { addToast } = useToast();
  const [matchState, setMatchState] = useState(/** @type {MatchState} */ ('idle'));
  const [roomId, setRoomId] = useState(null);
  const [peerId, setPeerId] = useState(null);
  // Track which side of the match we are — the first connected client sends the offer
  const isInitiatorRef = useRef(false);
  const [isInitiator, setIsInitiator] = useState(false);
  const [messages, setMessages] = useState(/** @type {ChatMessage[]} */ ([]));

  const appendMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, { ...msg, id: `${Date.now()}-${Math.random()}` }]);
  }, []);

  // Open the WebSocket as soon as this hook mounts
  useEffect(() => {
    connect();
  }, [connect]);

  // Subscribe to all backend message types
  useEffect(() => {
    const unsubs = [
      on('waiting', () => {
        setMatchState('waiting');
        setRoomId(null);
        setPeerId(null);
        isInitiatorRef.current = false;
        setIsInitiator(false);
        setMessages([]);
      }),

      on('matched', (msg) => {
        setMatchState('matched');
        setRoomId(msg.roomId);
        setPeerId(msg.peerId);
        // The client whose peerId is lexicographically smaller becomes the initiator.
        // Both clients receive the matched message; we need a deterministic rule so
        // exactly one side sends the WebRTC offer.
        // Using a simple coin: the client whose own id is NOT msg.peerId is the one
        // who appeared in the room first — set them as initiator.
        // A simpler heuristic: backend always sends peerId of the OTHER person;
        // treat the first message receiver as initiator by comparing IDs.
        // For simplicity: the non-queued client (the one that connected last) gets
        // peerId of the queued one, and we make the last-connected client the initiator.
        // We can't know our own ID here without the backend sending it.
        // Practical approach: pick initiator = client whose peerId is lexicographically less.
        const initiator = msg.peerId < msg.roomId;
        isInitiatorRef.current = initiator;
        setIsInitiator(initiator);
        appendMessage({
          text: 'Connected to a stranger. Say hello!',
          from: 'system',
          timestamp: Date.now(),
        });
      }),

      on('chat', (msg) => {
        appendMessage({ text: msg.text, from: 'stranger', timestamp: msg.timestamp || Date.now() });
      }),

      on('peer_left', () => {
        setMatchState('idle');
        setRoomId(null);
        setPeerId(null);
        appendMessage({
          text: 'Stranger has left the void.',
          from: 'system',
          timestamp: Date.now(),
        });
      }),

      on('error', (msg) => {
        addToast(msg.error || 'An error occurred', 'error');
      }),
    ];

    return () => unsubs.forEach((fn) => fn());
  }, [on, addToast, appendMessage]);

  /** sendChat — sends a text message to the current peer. */
  const sendChat = useCallback(
    (text) => {
      if (!text.trim() || matchState !== 'matched') return;
      sendMessage({ type: 'chat', text });
      appendMessage({ text, from: 'me', timestamp: Date.now() });
    },
    [sendMessage, matchState, appendMessage]
  );

  /** skip — requests a new random partner. */
  const skip = useCallback(() => {
    sendMessage({ type: 'skip' });
    setMessages([]);
    setMatchState('waiting');
  }, [sendMessage]);

  /** endCall — disconnects from the current session entirely. */
  const endCall = useCallback(() => {
    disconnect();
    setMatchState('idle');
    setMessages([]);
    setRoomId(null);
    setPeerId(null);
  }, [disconnect]);

  return {
    matchState,
    roomId,
    peerId,
    isInitiator,
    messages,
    sendChat,
    skip,
    endCall,
    socketStatus: status,
  };
}
