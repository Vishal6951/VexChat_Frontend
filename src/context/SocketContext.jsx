import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { useAuth } from './AuthContext.jsx';

/**
 * SocketContext — provides a singleton WebSocket connection and a stable
 * `sendMessage` helper to the entire component tree.
 *
 * The WS connection is NOT opened until the consumer calls `connect()`.
 * This prevents an eager connection on the landing page.
 */
const SocketContext = createContext(null);

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';

/**
 * @typedef {'idle'|'connecting'|'open'|'closed'|'error'} SocketStatus
 */

/**
 * SocketProvider — wraps the app and owns the WebSocket lifecycle.
 * @param {{ children: React.ReactNode }} props
 */
export function SocketProvider({ children }) {
  const wsRef = useRef(/** @type {WebSocket|null} */ (null));
  const listenersRef = useRef(/** @type {Map<string, Set<Function>>} */ (new Map()));
  const [status, setStatus] = useState(/** @type {SocketStatus} */ ('idle'));

  /**
   * connect — opens the WebSocket.  Safe to call multiple times:
   * if already open/connecting this is a no-op.
   */
  const { accessToken } = useAuth();

  /**
   * connect — opens the WebSocket with the current JWT as a query param.
   * Safe to call multiple times: if already open/connecting this is a no-op.
   */
  const connect = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState <= WebSocket.OPEN) return;

    // Browser WebSocket API cannot set custom headers, so we pass the JWT
    // as a ?token= query parameter instead. The backend RequireAuth middleware
    // reads it from the query string for WebSocket upgrade requests.
    const url = accessToken ? `${WS_URL}?token=${encodeURIComponent(accessToken)}` : WS_URL;

    setStatus('connecting');
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setStatus('open');

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const handlers = listenersRef.current.get(msg.type);
        if (handlers) handlers.forEach((fn) => fn(msg));
        const wildcards = listenersRef.current.get('*');
        if (wildcards) wildcards.forEach((fn) => fn(msg));
      } catch {
        /* ignore malformed frames */
      }
    };

    ws.onerror = () => setStatus('error');

    ws.onclose = () => {
      setStatus('closed');
      wsRef.current = null;
    };
  }, [accessToken]);

  /** disconnect — gracefully closes the WebSocket. */
  const disconnect = useCallback(() => {
    wsRef.current?.close();
  }, []);

  /**
   * sendMessage — serialises `payload` and writes it to the socket.
   * Drops silently if the socket is not open.
   * @param {object} payload
   */
  const sendMessage = useCallback((payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  }, []);

  /**
   * on — subscribe to a message type.
   * @param {string} type - message `type` field, or `'*'` for all
   * @param {Function} handler
   * @returns {Function} unsubscribe
   */
  const on = useCallback((type, handler) => {
    if (!listenersRef.current.has(type)) {
      listenersRef.current.set(type, new Set());
    }
    listenersRef.current.get(type).add(handler);
    return () => listenersRef.current.get(type)?.delete(handler);
  }, []);

  // Clean up on unmount
  useEffect(() => () => wsRef.current?.close(), []);

  return (
    <SocketContext.Provider value={{ status, connect, disconnect, sendMessage, on }}>
      {children}
    </SocketContext.Provider>
  );
}

/** @returns {{ status: SocketStatus, connect: Function, disconnect: Function, sendMessage: Function, on: Function }} */
export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used inside <SocketProvider>');
  return ctx;
}
