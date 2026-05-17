"use client";


import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  initiateCall,
  answerCall,
  endCall,
  declineCall,
  onCallStatusChange,
  sendSignal,
  onSignal,
  cleanupCallSignals,
  CallSession,
} from "@/lib/video-call";
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Phone, X, Volume2, VolumeX, Minimize2, Maximize2 } from "lucide-react";


interface VideoCallProps {
  callId?: string;
  receiverId: string;
  receiverName: string;
  type: "video" | "voice";
  onEnd: () => void;
}


export default function VideoCall({ callId: existingCallId, receiverId, receiverName, type, onEnd }: VideoCallProps) {
  const { user } = useAuth();
  const [callId, setCallId] = useState(existingCallId || "");
  const [status, setStatus] = useState<CallSession["status"]>("ringing");
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(type === "voice");
  const [error, setError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);


  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // CALL-02 fix: track callId synchronously via ref to avoid stale closure
  const activeCallIdRef = useRef<string>("");
  // CALL-03 fix: store incoming offer before peer connection exists
  const pendingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);
  // CALL-06 fix: queue ICE candidates that arrive before remoteDescription is set
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  // Audio synthesizer for call sounds (ringback/incoming ringtone)
  const ringAudioContextRef = useRef<AudioContext | null>(null);
  const ringIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRingSound = useCallback((isIncoming: boolean) => {
    stopRingSound();
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const ctx = new AudioContextClass();
      ringAudioContextRef.current = ctx;

      if (isIncoming) {
        // beautiful melodious chime ringtone for incoming calls
        let toggle = true;
        const playTone = () => {
          if (ctx.state === "suspended") ctx.resume();
          const now = ctx.currentTime;
          
          const freqs = toggle ? [523.25, 659.25, 783.99] : [587.33, 698.46, 880.00];
          toggle = !toggle;

          freqs.forEach((f, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = "sine";
            osc.frequency.setValueAtTime(f, now);
            
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6 + idx * 0.1);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(now);
            osc.stop(now + 0.8 + idx * 0.1);
          });
        };

        playTone();
        ringIntervalRef.current = setInterval(playTone, 1000);
      } else {
        // standard dual-frequency ringback tone (dual sine 400Hz + 450Hz, 2s on, 4s off)
        const playRingback = () => {
          if (ctx.state === "suspended") ctx.resume();
          const now = ctx.currentTime;

          const frequencies = [400, 450];
          frequencies.map(f => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "sine";
            osc.frequency.setValueAtTime(f, now);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.08, now + 0.05);
            gain.gain.setValueAtTime(0.08, now + 1.8);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 2.0);
            return osc;
          });
        };

        playRingback();
        ringIntervalRef.current = setInterval(playRingback, 4000);
      }
    } catch (err) {
      console.warn("Web Audio API failed to initialize ringtone:", err);
    }
  }, []);

  const stopRingSound = useCallback(() => {
    if (ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
    }
    if (ringAudioContextRef.current) {
      try {
        ringAudioContextRef.current.close();
      } catch {}
      ringAudioContextRef.current = null;
    }
  }, []);

  // Handle call sounds based on status
  useEffect(() => {
    if (status === "ringing") {
      startRingSound(!!existingCallId);
    } else {
      stopRingSound();
    }
    return () => stopRingSound();
  }, [status, existingCallId, startRingSound, stopRingSound]);

  // Re-bind media streams when minimized state toggles
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
    if (remoteVideoRef.current && remoteStreamRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  }, [isMinimized, status]);


  // CALL-01 + CALL-02 fix: accept resolvedCallId as param so ICE candidates
  // use the correct path even before React state update propagates.
  const setupPeerConnection = useCallback((resolvedCallId: string) => {
    // Clear any previously queued ICE candidates for this new connection
    pendingIceCandidatesRef.current = [];

    const iceServers: RTCIceServer[] = [
      // STUN — for simple NAT traversal (multiple for redundancy)
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
    ];

    // TURN — required for CGNAT / symmetric NAT (Indian mobile networks, corporate Wi-Fi)
    if (process.env.NEXT_PUBLIC_TURN_URL) {
      iceServers.push(
        {
          urls: process.env.NEXT_PUBLIC_TURN_URL,
          username: process.env.NEXT_PUBLIC_TURN_USERNAME || "",
          credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL || "",
        },
        {
          urls: process.env.NEXT_PUBLIC_TURN_URL.replace("turn:", "turns:"),
          username: process.env.NEXT_PUBLIC_TURN_USERNAME || "",
          credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL || "",
        }
      );
    }

    const pc = new RTCPeerConnection({ iceServers, iceCandidatePoolSize: 10 });

    // CALL-02 fix: use resolvedCallId parameter, not the stale callId state
    pc.onicecandidate = (event) => {
      if (event.candidate && resolvedCallId && user) {
        sendSignal(resolvedCallId, {
          type: "ice-candidate",
          from: user.uid,
          to: receiverId,
          data: event.candidate.toJSON(),
        }).catch(err => console.error("ICE signal error:", err));
      }
    };

    pc.ontrack = (event) => {
      console.log("[WebRTC] Remote track received:", event.track.kind);
      remoteStreamRef.current = event.streams[0];
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // CALL-07: Monitor ICE connection state for errors & user feedback
    pc.oniceconnectionstatechange = () => {
      console.log("[WebRTC] ICE state:", pc.iceConnectionState);
      switch (pc.iceConnectionState) {
        case "connected":
        case "completed":
          setError(null);
          break;
        case "disconnected":
          setError("Connection interrupted. Reconnecting...");
          break;
        case "failed":
          setError("Connection failed. Please check your network.");
          // Attempt ICE restart
          if (pc.signalingState !== "closed") {
            pc.restartIce();
          }
          break;
        case "closed":
          break;
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("[WebRTC] Connection state:", pc.connectionState);
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [receiverId, user]);


  // Start call (Caller Side) — CALL-02 fix: use resolved id, not state
  useEffect(() => {
    if (!user || existingCallId) return;

    async function startCall() {
      try {
        // 1. Create signaling doc first to get the id
        const id = await initiateCall(user!.uid, user!.displayName || "User", receiverId, receiverName, type);
        setCallId(id);
        activeCallIdRef.current = id; // sync update — available immediately

        // 2. Setup PC with the resolved id (not from React state)
        const pc = setupPeerConnection(id);

        // 3. Get media stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: type === "video",
          audio: true,
        });

        if (pc.signalingState === "closed") {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        // 4. Create and send offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await sendSignal(id, {
          type: "offer",
          from: user!.uid,
          to: receiverId,
          data: { type: offer.type, sdp: offer.sdp },
        });

      } catch (err: any) {
        console.error("Failed to start call:", err);
        if (err.message?.includes("permission") || err.code === "permission-denied") {
          setError("Database Access Error: Missing or insufficient permissions.");
        } else {
          setError("Could not access Camera/Mic. Please check your browser permissions.");
        }
        setTimeout(onEnd, 5000);
      }
    }
    startCall();
  }, [user, existingCallId, receiverId, receiverName, type, onEnd, setupPeerConnection]);


  // Listen to call status
  useEffect(() => {
    if (!callId) return;
    try {
      const unsubscribe = onCallStatusChange(callId, (call) => {
        setStatus(call.status);
        if (call.status === "ended" || call.status === "declined" || call.status === "missed") {
          cleanup();
          onEnd();
        }
      });
      return unsubscribe;
    } catch (err) {
      console.error("Status listener error:", err);
    }
  }, [callId, onEnd]);


  // CALL-06 fix: helper to flush queued ICE candidates after remoteDescription is set
  const flushPendingIceCandidates = useCallback(async (pc: RTCPeerConnection) => {
    const candidates = pendingIceCandidatesRef.current;
    pendingIceCandidatesRef.current = [];
    console.log(`[WebRTC] Flushing ${candidates.length} queued ICE candidates`);
    for (const candidate of candidates) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn("[WebRTC] Failed to add queued ICE candidate:", err);
      }
    }
  }, []);

  // CALL-03 + CALL-06 fix: signal handler with proper ICE candidate queuing
  useEffect(() => {
    if (!callId || !user) return;
    try {
      const unsubscribe = onSignal(callId, user.uid, async (signal) => {
        const pc = peerConnectionRef.current;
        if (signal.type === "offer") {
          // Store offer — peer connection may not be ready yet (receiver case)
          pendingOfferRef.current = signal.data;
          if (pc && !pc.remoteDescription) {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
            // Flush any ICE candidates that arrived before the offer
            await flushPendingIceCandidates(pc);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await sendSignal(callId, {
              type: "answer",
              from: user.uid,
              to: signal.from,
              data: { type: answer.type, sdp: answer.sdp },
            });
          }
        } else if (signal.type === "answer") {
          if (pc && !pc.currentRemoteDescription) {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
            // Flush any ICE candidates that arrived before the answer
            await flushPendingIceCandidates(pc);
          }
        } else if (signal.type === "ice-candidate") {
          if (pc && pc.remoteDescription) {
            // Remote description is set — add candidate immediately
            await pc.addIceCandidate(new RTCIceCandidate(signal.data)).catch(err => {
              console.warn("[WebRTC] addIceCandidate error:", err);
            });
          } else {
            // CALL-06 fix: Queue the candidate — it arrived before remoteDescription
            console.log("[WebRTC] Queuing ICE candidate (no remoteDescription yet)");
            pendingIceCandidatesRef.current.push(signal.data);
          }
        }
      });
      return unsubscribe;
    } catch (err) {
      console.error("Signal listener error:", err);
    }
  }, [callId, user, flushPendingIceCandidates]);


  // Duration timer
  useEffect(() => {
    if (status === "active") {
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status]);


  // CALL-04 fix: cleanup also purges the signals subcollection
  async function cleanup() {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    peerConnectionRef.current?.close();
    if (timerRef.current) clearInterval(timerRef.current);
    const idToClean = activeCallIdRef.current || callId;
    if (idToClean) {
      try { await cleanupCallSignals(idToClean); } catch {}
    }
  }


  // CALL-03 + CALL-06 fix: handleAnswer processes the stored pending offer & flushes ICE queue
  async function handleAnswer() {
    if (!callId) return;
    try {
      await answerCall(callId);
      activeCallIdRef.current = callId;
      const pc = setupPeerConnection(callId);
      const stream = await navigator.mediaDevices.getUserMedia({ video: type === "video", audio: true });
      if (pc.signalingState === "closed") {
        stream.getTracks().forEach(t => t.stop());
        return;
      }
      localStreamRef.current = stream;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      // Process the offer that arrived before PC was ready
      if (pendingOfferRef.current) {
        await pc.setRemoteDescription(new RTCSessionDescription(pendingOfferRef.current));
        // CALL-06: Flush any ICE candidates queued while waiting for the offer
        await flushPendingIceCandidates(pc);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await sendSignal(callId, {
          type: "answer",
          from: user!.uid,
          to: receiverId,
          data: { type: answer.type, sdp: answer.sdp },
        });
        pendingOfferRef.current = null;
      }
    } catch (err) {
      console.error("Answer error:", err);
      setError("Could not answer call.");
      setTimeout(onEnd, 2000);
    }
  }


  async function handleEnd() {
    try {
      if (callId) await endCall(callId);
    } catch (err) {
      console.error("End call error:", err);
    } finally {
      await cleanup();
      onEnd();
    }
  }


  async function handleDecline() {
    try {
      if (callId) await declineCall(callId);
    } catch (err) {
      console.error("Decline error:", err);
    } finally {
      onEnd();
    }
  }


  function toggleMute() {
    if (!localStreamRef.current) return;
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  }


  function toggleVideo() {
    if (!localStreamRef.current) return;
    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
    }
  }


  // CALL-05 fix: actually call setSinkId to route audio to speaker/earpiece
  async function toggleSpeaker() {
    const videoEl = remoteVideoRef.current;
    if (!videoEl) return;
    if (typeof (videoEl as any).setSinkId !== "function") {
      // setSinkId not supported (Firefox, Safari) — just toggle state for UI
      setIsSpeakerOn(!isSpeakerOn);
      return;
    }
    try {
      if (isSpeakerOn) {
        await (videoEl as any).setSinkId("");
      } else {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const speaker = devices.find(d => d.kind === "audiooutput");
        if (speaker) await (videoEl as any).setSinkId(speaker.deviceId);
      }
      setIsSpeakerOn(!isSpeakerOn);
    } catch (err) {
      console.error("setSinkId failed:", err);
    }
  }


  const formatDuration = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;


  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 w-80 bg-[#1E293B] border border-white/10 rounded-3xl shadow-2xl z-[150] overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
        <div className="relative aspect-video w-full bg-black">
          {/* Remote video stream */}
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          
          {/* If voice or remote stream not active/ringing */}
          {(status === "ringing" || type === "voice" || !remoteStreamRef.current) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#1E293B] to-[#0F172A] p-3 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-lg font-serif font-bold text-orange-800 shadow-md ring-2 ring-orange-500/20 mb-2">
                {receiverName[0]}
              </div>
              <p className="text-xs font-bold text-white truncate max-w-[150px]">{receiverName}</p>
              <p className="text-[10px] text-orange-400 font-medium animate-pulse">
                {status === "ringing" ? "Calling..." : "On Call"}
              </p>
            </div>
          )}

          {/* Local PIP for video calls */}
          {type === "video" && status === "active" && (
            <div className="absolute top-2 right-2 w-20 aspect-video bg-black/40 rounded-lg overflow-hidden border border-white/10 z-10">
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            </div>
          )}
          
          {/* Overlay info */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-3 text-white flex items-end justify-between z-20">
            <div>
              <p className="font-bold text-xs truncate max-w-[120px]">{receiverName}</p>
              {status === "active" && (
                <span className="text-[10px] font-mono text-gray-300 bg-black/40 px-1.5 py-0.5 rounded">
                  {formatDuration(duration)}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(false)}
                className="w-8 h-8 bg-white/15 hover:bg-white/25 rounded-xl flex items-center justify-center text-white backdrop-blur-sm transition-all"
                title="Expand to Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleEnd}
                className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-xl flex items-center justify-center text-white transition-all shadow-md"
                title="End Call"
              >
                <PhoneOff className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="fixed inset-0 bg-[#0F172A] z-[100] flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-[#1E293B] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 aspect-video">
        
        {/* Remote video / Placeholder */}
        <div className="absolute inset-0">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          
          {(status === "ringing" || !remoteVideoRef.current?.srcObject) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#1E293B] to-[#0F172A]">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center text-3xl font-serif font-bold text-orange-800 shadow-xl ring-4 ring-orange-500/20">
                  {receiverName[0]}
                </div>
                {status === "ringing" && (
                  <div className="absolute inset-0 rounded-full border-4 border-orange-500/30 animate-ping" />
                )}
              </div>
              <h2 className="text-2xl font-serif font-bold text-white mb-2">{receiverName}</h2>
              <p className="text-orange-400 font-medium tracking-wide">
                {error || (status === "ringing" ? (existingCallId ? "Incoming call..." : "Calling...") : "Connecting...")}
              </p>
            </div>
          )}
        </div>


        {/* Local video (picture-in-picture) */}
        {type === "video" && (
          <div className="absolute top-6 right-20 w-32 sm:w-48 aspect-video bg-black/40 rounded-2xl overflow-hidden shadow-lg border border-white/10 backdrop-blur-sm z-10">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          </div>
        )}


        {/* Top Info */}
        <div className="absolute top-6 left-6 flex items-center gap-3 z-10">
          {status === "active" && (
            <div className="bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-sm font-bold flex items-center gap-2 border border-white/10">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {formatDuration(duration)}
            </div>
          )}
        </div>

        {/* Minimize Button */}
        <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
          <button 
            onClick={() => setIsMinimized(true)}
            className="bg-black/40 hover:bg-black/60 backdrop-blur-md text-white p-2.5 rounded-2xl border border-white/10 shadow-lg transition-all"
            title="Minimize Call"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
        </div>


        {/* Controls */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 z-20">
          {status === "ringing" && existingCallId ? (
            <div className="flex gap-8">
              <button 
                onClick={handleAnswer} 
                className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-green-600 hover:scale-110 transition-all active:scale-95 group"
              >
                <Phone className="w-7 h-7 group-hover:rotate-12 transition-transform" />
              </button>
              <button 
                onClick={handleDecline} 
                className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-red-600 hover:scale-110 transition-all active:scale-95"
              >
                <X className="w-8 h-8" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 sm:gap-6 bg-black/30 backdrop-blur-xl px-6 py-4 rounded-[2rem] border border-white/10 shadow-2xl">
              <button 
                onClick={toggleMute} 
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${isMuted ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              {/* CALL-05: now calls toggleSpeaker which actually routes audio */}
              <button 
                onClick={toggleSpeaker}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${!isSpeakerOn ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
                title={isSpeakerOn ? "Speaker On" : "Speaker Off"}
              >
                {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>


              {type === "video" && (
                <button 
                  onClick={toggleVideo} 
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${isVideoOff ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
                  title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
                >
                  {isVideoOff ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
                </button>
              )}


              <div className="w-px h-8 bg-white/10 mx-2" />


              <button 
                onClick={handleEnd} 
                className="w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg hover:bg-red-600 hover:scale-110 transition-all active:scale-95"
                title="End Call"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
