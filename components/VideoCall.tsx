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
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Phone, X, Volume2, VolumeX, Minimize2, Maximize2, MonitorUp, MonitorOff } from "lucide-react";

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
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const activeCallIdRef = useRef<string>("");
  const pendingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  // Audio synthesizer for call sounds
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
      try { ringAudioContextRef.current.close(); } catch {}
      ringAudioContextRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (status === "ringing") startRingSound(!!existingCallId);
    else stopRingSound();
    return () => stopRingSound();
  }, [status, existingCallId, startRingSound, stopRingSound]);

  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = isScreenSharing && screenStreamRef.current ? screenStreamRef.current : localStreamRef.current;
    }
    if (remoteVideoRef.current && remoteStreamRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  }, [isMinimized, status, isScreenSharing]);

  const setupPeerConnection = useCallback((resolvedCallId: string) => {
    pendingIceCandidatesRef.current = [];
    const turnUser = process.env.NEXT_PUBLIC_TURN_USERNAME || "";
    const turnCred = process.env.NEXT_PUBLIC_TURN_CREDENTIAL || "";

    const iceServers: RTCIceServer[] = [
      { urls: "stun:stun.relay.metered.ca:80" },
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "turn:global.relay.metered.ca:80", username: turnUser, credential: turnCred },
      { urls: "turn:global.relay.metered.ca:80?transport=tcp", username: turnUser, credential: turnCred },
      { urls: "turn:global.relay.metered.ca:443", username: turnUser, credential: turnCred },
      { urls: "turns:global.relay.metered.ca:443?transport=tcp", username: turnUser, credential: turnCred },
    ];

    const pc = new RTCPeerConnection({ iceServers, iceCandidatePoolSize: 10 });

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
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
    };

    pc.oniceconnectionstatechange = () => {
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
          if (pc.signalingState !== "closed") pc.restartIce();
          break;
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [receiverId, user]);

  useEffect(() => {
    if (!user || existingCallId) return;

    async function startCall() {
      try {
        const id = await initiateCall(user!.uid, user!.displayName || "User", receiverId, receiverName, type);
        setCallId(id);
        activeCallIdRef.current = id;

        const pc = setupPeerConnection(id);
        const stream = await navigator.mediaDevices.getUserMedia({ video: type === "video", audio: true });

        if (pc.signalingState === "closed") {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

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
          setError("Database Access Error: Missing permissions.");
        } else {
          setError("Could not access Camera/Mic. Please check permissions.");
        }
        setTimeout(onEnd, 5000);
      }
    }
    startCall();
  }, [user, existingCallId, receiverId, receiverName, type, onEnd, setupPeerConnection]);

  useEffect(() => {
    if (!callId) return;
    const unsubscribe = onCallStatusChange(callId, (call) => {
      setStatus(call.status);
      if (call.status === "ended" || call.status === "declined" || call.status === "missed") {
        cleanup();
        onEnd();
      }
    });
    return unsubscribe;
  }, [callId, onEnd]);

  const flushPendingIceCandidates = useCallback(async (pc: RTCPeerConnection) => {
    const candidates = pendingIceCandidatesRef.current;
    pendingIceCandidatesRef.current = [];
    for (const candidate of candidates) {
      try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
    }
  }, []);

  useEffect(() => {
    if (!callId || !user) return;
    const unsubscribe = onSignal(callId, user.uid, async (signal) => {
      const pc = peerConnectionRef.current;
      if (signal.type === "offer") {
        pendingOfferRef.current = signal.data;
        if (pc && !pc.remoteDescription) {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
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
          await flushPendingIceCandidates(pc);
        }
      } else if (signal.type === "ice-candidate") {
        if (pc && pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.data)).catch(() => {});
        } else {
          pendingIceCandidatesRef.current.push(signal.data);
        }
      }
    });
    return unsubscribe;
  }, [callId, user, flushPendingIceCandidates]);

  useEffect(() => {
    if (status === "active") {
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status]);

  async function cleanup() {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    peerConnectionRef.current?.close();
    if (timerRef.current) clearInterval(timerRef.current);
    const idToClean = activeCallIdRef.current || callId;
    if (idToClean) {
      try { await cleanupCallSignals(idToClean); } catch {}
    }
  }

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

      if (pendingOfferRef.current) {
        await pc.setRemoteDescription(new RTCSessionDescription(pendingOfferRef.current));
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
    try { if (callId) await endCall(callId); } catch {} finally { await cleanup(); onEnd(); }
  }

  async function handleDecline() {
    try { if (callId) await declineCall(callId); } catch {} finally { onEnd(); }
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

  async function toggleScreenShare() {
    if (!peerConnectionRef.current) return;

    try {
      if (isScreenSharing) {
        screenStreamRef.current?.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;

        if (localStreamRef.current) {
          const videoTrack = localStreamRef.current.getVideoTracks()[0];
          const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === "video");
          if (sender && videoTrack) await sender.replaceTrack(videoTrack);
          if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
        }
        setIsScreenSharing(false);
      } else {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;

        const screenTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === "video");
        if (sender && screenTrack) await sender.replaceTrack(screenTrack);
        if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;

        setIsScreenSharing(true);

        screenTrack.onended = () => {
          screenStreamRef.current = null;
          if (localStreamRef.current && peerConnectionRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            const s = peerConnectionRef.current.getSenders().find(send => send.track?.kind === "video");
            if (s && videoTrack) s.replaceTrack(videoTrack).catch(() => {});
            if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
          }
          setIsScreenSharing(false);
        };
      }
    } catch (err) {
      console.error("Screen share error:", err);
    }
  }

  async function toggleSpeaker() {
    const videoEl = remoteVideoRef.current;
    if (!videoEl) return;
    if (typeof (videoEl as any).setSinkId !== "function") {
      setIsSpeakerOn(!isSpeakerOn);
      return;
    }
    try {
      if (isSpeakerOn) await (videoEl as any).setSinkId("");
      else {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const speaker = devices.find(d => d.kind === "audiooutput");
        if (speaker) await (videoEl as any).setSinkId(speaker.deviceId);
      }
      setIsSpeakerOn(!isSpeakerOn);
    } catch {}
  }

  const formatDuration = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "(")}`;

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 w-80 bg-[#1E293B] border border-white/10 rounded-3xl shadow-2xl z-[150] overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
        <div className="relative aspect-video w-full bg-black">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
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
          {type === "video" && status === "active" && (
            <div className="absolute top-2 right-2 w-20 aspect-video bg-black/40 rounded-lg overflow-hidden border border-white/10 z-10">
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            </div>
          )}
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
              <button onClick={() => setIsMinimized(false)} className="w-8 h-8 bg-white/15 hover:bg-white/25 rounded-xl flex items-center justify-center text-white backdrop-blur-sm transition-all" title="Expand">
                <Maximize2 className="w-4 h-4" />
              </button>
              <button onClick={handleEnd} className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-xl flex items-center justify-center text-white transition-all shadow-md" title="End Call">
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
        <div className="absolute inset-0">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          {(status === "ringing" || !remoteVideoRef.current?.srcObject) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#1E293B] to-[#0F172A]">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center text-3xl font-serif font-bold text-orange-800 shadow-xl ring-4 ring-orange-500/20">
                  {receiverName[0]}
                </div>
                {status === "ringing" && <div className="absolute inset-0 rounded-full border-4 border-orange-500/30 animate-ping" />}
              </div>
              <h2 className="text-2xl font-serif font-bold text-white mb-2">{receiverName}</h2>
              <p className="text-orange-400 font-medium tracking-wide">
                {error || (status === "ringing" ? (existingCallId ? "Incoming call..." : "Calling...") : "Connecting...")}
              </p>
            </div>
          )}
        </div>

        {type === "video" && (
          <div className="absolute top-6 right-20 w-32 sm:w-48 aspect-video bg-black/40 rounded-2xl overflow-hidden shadow-lg border border-white/10 backdrop-blur-sm z-10">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          </div>
        )}

        <div className="absolute top-6 left-6 flex items-center gap-3 z-10">
          {status === "active" && (
            <div className="bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-sm font-bold flex items-center gap-2 border border-white/10">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {formatDuration(duration)}
            </div>
          )}
        </div>

        <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
          <button onClick={() => setIsMinimized(true)} className="bg-black/40 hover:bg-black/60 backdrop-blur-md text-white p-2.5 rounded-2xl border border-white/10 shadow-lg transition-all" title="Minimize">
            <Minimize2 className="w-5 h-5" />
          </button>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 z-20">
          {status === "ringing" && existingCallId ? (
            <div className="flex gap-8">
              <button onClick={handleAnswer} className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-green-600 hover:scale-110 transition-all active:scale-95 group">
                <Phone className="w-7 h-7 group-hover:rotate-12 transition-transform" />
              </button>
              <button onClick={handleDecline} className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-red-600 hover:scale-110 transition-all active:scale-95">
                <X className="w-8 h-8" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 sm:gap-6 bg-black/30 backdrop-blur-xl px-6 py-4 rounded-[2rem] border border-white/10 shadow-2xl">
              <button onClick={toggleMute} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${isMuted ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"}`} title={isMuted ? "Unmute" : "Mute"}>
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <button onClick={toggleSpeaker} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${!isSpeakerOn ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"}`} title={isSpeakerOn ? "Speaker On" : "Speaker Off"}>
                {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              {type === "video" && (
                <>
                  <button onClick={toggleVideo} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${isVideoOff ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"}`} title={isVideoOff ? "Turn Video On" : "Turn Video Off"}>
                    {isVideoOff ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
                  </button>

                  <button onClick={toggleScreenShare} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${isScreenSharing ? "bg-[var(--primary)] text-white" : "bg-white/10 text-white hover:bg-white/20"}`} title={isScreenSharing ? "Stop Screen Share" : "Start Screen Share"}>
                    {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <MonitorUp className="w-5 h-5" />}
                  </button>
                </>
              )}

              <div className="w-px h-8 bg-white/10 mx-2" />

              <button onClick={handleEnd} className="w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg hover:bg-red-600 hover:scale-110 transition-all active:scale-95" title="End Call">
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
