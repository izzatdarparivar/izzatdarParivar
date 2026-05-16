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
  CallSession,
} from "@/lib/video-call";
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Phone, X, Volume2, VolumeX } from "lucide-react";


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


  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);


  // Setup WebRTC
  const setupPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });


    pc.onicecandidate = (event) => {
      if (event.candidate && callId && user) {
        sendSignal(callId, {
          type: "ice-candidate",
          from: user.uid,
          to: receiverId,
          data: event.candidate.toJSON(),
        }).catch(err => console.error("Signal error:", err));
      }
    };


    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };


    peerConnectionRef.current = pc;
    return pc;
  }, [callId, receiverId, user]);


  // Start call (Caller Side)
  useEffect(() => {
    if (!user || existingCallId) return;


    async function startCall() {
      try {
        // 1. Create the signaling document in Firestore
        const id = await initiateCall(user!.uid, user!.displayName || "User", receiverId, receiverName, type);
        setCallId(id);
        
        // 2. Setup Peer Connection
        const pc = setupPeerConnection();
        
        // 3. Get Media Stream
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: type === "video", 
          audio: true 
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        
        // 4. Add tracks to PC
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        // 5. Create Offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // 6. Send Offer Signal
        await sendSignal(id, { 
          type: "offer", 
          from: user!.uid, 
          to: receiverId, 
          data: { type: offer.type, sdp: offer.sdp } 
        });

      } catch (err: any) {
        console.error("Failed to start call:", err);
        if (err.message?.includes("permission") || err.code === "permission-denied") {
          setError("Database Access Error: Missing or insufficient permissions. (Check Firestore Rules)");
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


  // Listen to signals (Receiver/Answerer Side logic mostly)
  useEffect(() => {
    if (!callId || !user) return;
    try {
      const unsubscribe = onSignal(callId, user.uid, async (signal) => {
        const pc = peerConnectionRef.current;
        if (!pc) return;

        try {
          if (signal.type === "offer") {
            // Receiver handles the offer
            await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await sendSignal(callId, { type: "answer", from: user.uid, to: signal.from, data: { type: answer.type, sdp: answer.sdp } });
          } else if (signal.type === "answer") {
            // Caller handles the answer
            if (!pc.currentRemoteDescription) {
              await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
            }
          } else if (signal.type === "ice-candidate") {
            // Both handle ICE candidates
            await pc.addIceCandidate(new RTCIceCandidate(signal.data));
          }
        } catch (e) {
          console.error("Signaling processing error:", e);
        }
      });
      return unsubscribe;
    } catch (err) {
      console.error("Signal listener error:", err);
    }
  }, [callId, user]);


  // Duration timer
  useEffect(() => {
    if (status === "active") {
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status]);


  function cleanup() {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    peerConnectionRef.current?.close();
    if (timerRef.current) clearInterval(timerRef.current);
  }


  async function handleAnswer() {
    if (!callId) return;
    try {
      await answerCall(callId);
      const pc = setupPeerConnection();
      const stream = await navigator.mediaDevices.getUserMedia({ video: type === "video", audio: true });
      localStreamRef.current = stream;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
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
      cleanup();
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


  const formatDuration = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;


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
          <div className="absolute top-6 right-6 w-32 sm:w-48 aspect-video bg-black/40 rounded-2xl overflow-hidden shadow-lg border border-white/10 backdrop-blur-sm z-10">
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
              
              <button 
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
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

