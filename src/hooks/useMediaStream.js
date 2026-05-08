import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * useMediaStream — acquires a local media stream via getUserMedia.
 *
 * @returns {{
 *   localStream: MediaStream|null,
 *   isMuted: boolean,
 *   isCameraOff: boolean,
 *   permissionError: string|null,
 *   toggleMute: Function,
 *   toggleCamera: Function,
 *   stopStream: Function,
 * }}
 */
export function useMediaStream() {
  const streamRef = useRef(/** @type {MediaStream|null} */ (null));
  const [localStream, setLocalStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [permissionError, setPermissionError] = useState(null);

  // Request camera + mic on mount
  useEffect(() => {
    let mounted = true;

    async function acquire() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        setLocalStream(stream);
      } catch (err) {
        if (!mounted) return;
        setPermissionError(
          err.name === 'NotAllowedError'
            ? 'Camera and microphone access was denied. Please allow access and refresh.'
            : `Could not access media devices: ${err.message}`
        );
      }
    }

    acquire();
    return () => {
      mounted = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  /** toggleMute — enables/disables all audio tracks on the local stream. */
  const toggleMute = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsMuted((prev) => !prev);
  }, []);

  /** toggleCamera — enables/disables all video tracks on the local stream. */
  const toggleCamera = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) return;
    stream.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsCameraOff((prev) => !prev);
  }, []);

  /** stopStream — fully stops all tracks (call on session end). */
  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setLocalStream(null);
  }, []);

  return {
    localStream,
    isMuted,
    isCameraOff,
    permissionError,
    toggleMute,
    toggleCamera,
    stopStream,
  };
}
