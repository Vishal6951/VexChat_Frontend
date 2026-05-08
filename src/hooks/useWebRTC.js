import { useEffect, useRef, useCallback, useState } from 'react';
import { useSocket } from '../context/SocketContext.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * useWebRTC — manages the RTCPeerConnection lifecycle.
 *
 * Responsibilities:
 *  - Fetch ICE config from the backend
 *  - Create peer connection and add local tracks
 *  - Create/send SDP offer when `isInitiator` is true
 *  - Handle incoming offer → send answer
 *  - Handle incoming answer → setRemoteDescription
 *  - Trickle ICE candidates
 *  - Expose remote stream via `remoteStream` state
 *
 * @param {{ localStream: MediaStream|null, isInitiator: boolean, enabled: boolean }} opts
 * @returns {{ remoteStream: MediaStream|null, resetPeer: Function }}
 */
export function useWebRTC({ localStream, isInitiator, enabled }) {
  const { sendMessage, on } = useSocket();
  const pcRef = useRef(/** @type {RTCPeerConnection|null} */ (null));
  const iceCfgRef = useRef(null);
  const [remoteStream, setRemoteStream] = useState(null);

  // Fetch ICE config once
  useEffect(() => {
    fetch(`${API_URL}/api/ice-config`)
      .then((r) => r.json())
      .then((cfg) => { iceCfgRef.current = cfg; })
      .catch(() => {
        // Fallback to Google STUN if backend is unreachable
        iceCfgRef.current = {
          iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
        };
      });
  }, []);

  /** createPeer — builds a new RTCPeerConnection and attaches local tracks. */
  const createPeer = useCallback(() => {
    // Tear down any existing connection first
    pcRef.current?.close();

    const pc = new RTCPeerConnection(iceCfgRef.current || {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });
    pcRef.current = pc;

    // Attach local tracks to the connection
    if (localStream) {
      localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
    }

    // Collect ICE candidates and send them via the signaling channel
    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        sendMessage({ type: 'ice-candidate', candidate });
      }
    };

    // Receive remote tracks and expose as a MediaStream
    const remoteMs = new MediaStream();
    pc.ontrack = ({ track }) => {
      remoteMs.addTrack(track);
      setRemoteStream(new MediaStream(remoteMs.getTracks()));
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setRemoteStream(null);
      }
    };

    return pc;
  }, [localStream, sendMessage]);

  /** startCall — called by the matched initiator to kick off the WebRTC handshake. */
  const startCall = useCallback(async () => {
    const pc = createPeer();
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendMessage({ type: 'offer', sdp: pc.localDescription.sdp });
    } catch (err) {
      console.error('Failed to create offer:', err);
    }
  }, [createPeer, sendMessage]);

  /** resetPeer — tears down the peer connection (called on skip/end). */
  const resetPeer = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    setRemoteStream(null);
  }, []);

  // ── Subscribe to signaling messages ──────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;

    const unsubs = [
      // Incoming SDP offer → create peer (as non-initiator) and send answer
      on('offer', async (msg) => {
        const pc = createPeer();
        try {
          await pc.setRemoteDescription({ type: 'offer', sdp: msg.sdp });
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendMessage({ type: 'answer', sdp: pc.localDescription.sdp });
        } catch (err) {
          console.error('Failed to handle offer:', err);
        }
      }),

      // Incoming SDP answer → set remote description
      on('answer', async (msg) => {
        try {
          await pcRef.current?.setRemoteDescription({
            type: 'answer',
            sdp: msg.sdp,
          });
        } catch (err) {
          console.error('Failed to set answer:', err);
        }
      }),

      // Incoming ICE candidate → add to peer connection
      on('ice-candidate', async (msg) => {
        try {
          if (pcRef.current && msg.candidate) {
            await pcRef.current.addIceCandidate(msg.candidate);
          }
        } catch (err) {
          console.error('Failed to add ICE candidate:', err);
        }
      }),
    ];

    return () => unsubs.forEach((fn) => fn());
  }, [enabled, on, createPeer, sendMessage]);

  // When matched and we are the initiator, start the call
  useEffect(() => {
    if (enabled && isInitiator && localStream) {
      startCall();
    }
  }, [enabled, isInitiator, localStream, startCall]);

  // Cleanup on unmount
  useEffect(() => () => { pcRef.current?.close(); }, []);

  return { remoteStream, resetPeer };
}
