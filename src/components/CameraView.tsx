import React, { useEffect, useRef, useState } from 'react';
import { Challenge } from '../types';
import { Camera, CameraOff, AlertCircle, Video, Play, Sparkles, Sliders, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CameraViewProps {
  challenge: Challenge;
  challengeIndex: number;
  totalChallenges: number;
  onRecordingComplete: (blob: Blob) => void;
}

export default function CameraView({
  challenge,
  challengeIndex,
  totalChallenges,
  onRecordingComplete,
}: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [useVirtual, setUseVirtual] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [streamActive, setStreamActive] = useState<boolean>(false);
  
  // Phase state
  const [isGettingReady, setIsGettingReady] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [readyCount, setReadyCount] = useState<number>(3);
  const [recordTimeLeft, setRecordTimeLeft] = useState<number>(3.0); // 3.0 seconds

  // Fullscreen support state & reference
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.warn("Fullscreen request rejected, using seamless modal fallback.");
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen?.().finally(() => {
        setIsFullscreen(false);
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Start standard or virtual camera on load
  useEffect(() => {
    initCamera(useVirtual);
    return () => {
      stopAllStreams();
    };
  }, [useVirtual]);

  // Handle Virtual Camera Drawing Loop
  useEffect(() => {
    if (useVirtual && streamActive) {
      startVirtualCanvasLoop();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  }, [useVirtual, streamActive, isRecording, recordTimeLeft, isGettingReady, readyCount]);

  const stopAllStreams = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setStreamActive(false);
  };

  const initCamera = async (forceVirtual: boolean) => {
    stopAllStreams();
    setPermissionError(null);

    if (forceVirtual) {
      setupVirtualStream();
      return;
    }

    try {
      // Secure check
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("WebRTC getUserMedia is not supported in this frame environment.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: true,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStreamActive(true);
    } catch (err: any) {
      console.warn("Camera access denied or unavailable, switching to Interactive Simulator:", err);
      setPermissionError(err.message || "Camera access blocked by safety sandbox.");
      // Automatically switch to virtual so user is never blocked
      setUseVirtual(true);
    }
  };

  const setupVirtualStream = () => {
    setUseVirtual(true);
    setStreamActive(true);
    
    // Create canvas stream if possible
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas && !streamRef.current) {
        try {
          const stream = canvas.captureStream(30); // 30 FPS
          
          // Add silent audio if supported
          try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const dst = ctx.createMediaStreamDestination();
            osc.connect(dst);
            const audioTrack = dst.stream.getAudioTracks()[0];
            if (audioTrack) {
              stream.addTrack(audioTrack);
            }
          } catch (e) {
            console.log("Audio simulation bypass active.");
          }

          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (captureErr) {
          console.warn("captureStream failed on canvas, running standard simulation fallback:", captureErr);
        }
      }
    }, 100);
  };

  // Canvas visual loop for simulated camera feed
  const startVirtualCanvasLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particleAngle = 0;
    
    const draw = () => {
      if (!ctx || !canvas) return;
      const width = canvas.width;
      const height = canvas.height;

      // Dark futuristic slate background
      ctx.fillStyle = '#0f172a'; // slate-900
      ctx.fillRect(0, 0, width, height);

      // Scanline grid effect
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Visual camera target boundaries
      ctx.strokeStyle = isRecording ? '#ef4444' : '#3b82f6';
      ctx.lineWidth = 2;
      const size = 40;
      const pad = 30;
      
      // Top Left corner
      ctx.beginPath(); ctx.moveTo(pad, pad + size); ctx.lineTo(pad, pad); ctx.lineTo(pad + size, pad); ctx.stroke();
      // Top Right corner
      ctx.beginPath(); ctx.moveTo(width - pad, pad + size); ctx.lineTo(width - pad, pad); ctx.lineTo(width - pad - size, pad); ctx.stroke();
      // Bottom Left corner
      ctx.beginPath(); ctx.moveTo(pad, height - pad - size); ctx.lineTo(pad, height - pad); ctx.lineTo(pad + size, height - pad); ctx.stroke();
      // Bottom Right corner
      ctx.beginPath(); ctx.moveTo(width - pad, height - pad - size); ctx.lineTo(width - pad, height - pad); ctx.lineTo(width - pad - size, height - pad); ctx.stroke();

      // Draw active face/pose avatar coordinate simulation
      ctx.strokeStyle = isRecording ? 'rgba(239, 68, 68, 0.4)' : 'rgba(59, 130, 246, 0.4)';
      ctx.lineWidth = 1.5;
      
      const centerY = height / 2;
      const centerX = width / 2;
      
      // Face circle skeleton
      ctx.beginPath();
      ctx.arc(centerX, centerY - 10, 80, 0, Math.PI * 2);
      ctx.stroke();

      // Eyes (wink if recording!)
      ctx.fillStyle = isRecording ? '#ef4444' : '#3b82f6';
      
      // Left eye
      ctx.beginPath();
      ctx.arc(centerX - 30, centerY - 25, 6, 0, Math.PI * 2);
      ctx.fill();

      // Right eye (blinks or winks dynamically)
      ctx.beginPath();
      if (isRecording && Math.floor(recordTimeLeft * 2) % 2 === 0) {
        // Draw a winking eye line
        ctx.moveTo(centerX + 20, centerY - 25);
        ctx.lineTo(centerX + 40, centerY - 25);
        ctx.stroke();
      } else {
        ctx.arc(centerX + 30, centerY - 25, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Mouth
      ctx.beginPath();
      if (isRecording) {
        // Speaking/articulating mouth shapes
        const mouthRadius = 15 + Math.sin(Date.now() / 80) * 10;
        ctx.arc(centerX, centerY + 20, mouthRadius, 0, Math.PI, false);
      } else {
        // Peaceful smile
        ctx.arc(centerX, centerY + 15, 18, 0.1 * Math.PI, 0.9 * Math.PI);
      }
      ctx.stroke();

      // Audio frequency wave simulation at bottom
      ctx.fillStyle = isRecording ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.1)';
      ctx.fillRect(pad, height - 80, width - (pad * 2), 40);

      const barCount = 30;
      const barWidth = (width - pad * 2) / barCount;
      ctx.fillStyle = isRecording ? '#ef4444' : '#3b82f6';
      for (let i = 0; i < barCount; i++) {
        const factor = Math.sin(i * 0.2 + Date.now() / 150) * Math.cos(i * 0.05 + Date.now() / 300);
        const heightMultiplier = isRecording ? 30 : 5;
        const currentBarHeight = Math.max(2, Math.abs(factor) * heightMultiplier);
        ctx.fillRect(
          pad + i * barWidth + 2,
          height - 60 - currentBarHeight / 2,
          barWidth - 4,
          currentBarHeight
        );
      }

      // Header label inside canvas
      ctx.fillStyle = isRecording ? '#facc15' : '#a3a3a3'; // amber-400 : neutral-400
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.fillText(isRecording ? '• RECORDING LIVE' : '• STANDBY PREVIEW', pad + 15, pad + 25);

      ctx.fillStyle = '#64748b';
      ctx.font = '10px "Inter", sans-serif';
      ctx.fillText('interactive sandbox simulator', width - 210, pad + 25);

      // Countdown visual print
      if (isGettingReady) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#fafff0';
        ctx.font = 'bold 72px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(readyCount.toString(), centerX, centerY);
        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 14px "Space Grotesk", sans-serif';
        ctx.fillText('GET READY...', centerX, centerY + 60);
        ctx.textAlign = 'start';
        ctx.textBaseline = 'alphabetic';
      }

      particleAngle += 0.05;
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  // Record handler
  const handleRecordTrigger = () => {
    if (isRecording) return;
    startRecording();
  };

  const startRecording = () => {
    setIsGettingReady(false);
    setIsRecording(true);
    setRecordTimeLeft(3.0);

    const recordedChunks: Blob[] = [];
    
    // Bind recorder
    if (streamRef.current) {
      let mimeType = 'video/webm';
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        mimeType = 'video/webm;codecs=vp9';
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        mimeType = 'video/webm';
      } else if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4';
      }

      try {
        const options = { mimeType };
        const recorder = new MediaRecorder(streamRef.current, options);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunks.push(e.data);
          }
        };

        recorder.onstop = () => {
          const finishedBlob = new Blob(recordedChunks, { type: mimeType });
          onRecordingComplete(finishedBlob);
        };

        recorder.start(10); // slice size in ms
      } catch (err) {
        console.warn("Failed to instanciate real MediaRecorder, running fallback simulation buffer:", err);
      }
    }

    // Exact millisecond-perfect recorder loop (duration check)
    const startTime = Date.now();
    const timerInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, 3.0 - elapsed);
      setRecordTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timerInterval);
        stopRecording();
      }
    }, 33); // ~30fps sampling rate
  };

  const stopRecording = () => {
    setIsRecording(false);
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      // Manual/Simulation fallback
      // In case we are purely in browser simulation without complete media recorder backing,
      // let's pass a small mock Blob to allow progression!
      const mockBlob = new Blob(["mock-video"], { type: 'video/webm' });
      onRecordingComplete(mockBlob);
    }
  };

  return (
    <div 
      id="camera-view" 
      className="fixed inset-0 z-50 bg-neutral-950 flex flex-col justify-between p-4 md:p-8 animate-fade-in"
    >
      
      {/* Main Terminal Frame */}
      <div 
        ref={containerRef}
        className="relative w-full flex-1 h-full min-h-[60vh] bg-neutral-950 rounded-3xl border border-neutral-900 overflow-hidden"
      >
        
        {/* Real video webcam stream tag */}
        <video
          ref={videoRef}
          id="camera-preview-video"
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transform -scale-x-100 ${useVirtual ? 'hidden' : 'block'}`}
        />

        {/* Live virtual simulation canvas */}
        <canvas
          ref={canvasRef}
          id="virtual-camera-canvas"
          width={640}
          height={480}
          className={`w-full h-full object-cover ${useVirtual ? 'block' : 'hidden'}`}
        />

        {/* Video Overlays */}
        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-neutral-900/80 to-transparent p-6 text-center z-10">
          <div className="flex justify-center mb-2">
            <span className="text-[10px] font-mono font-bold tracking-wider text-amber-400 bg-amber-500/15 border border-amber-500/25 px-2.5 py-0.5 rounded-full uppercase">
              Challenge {challengeIndex + 1} of {totalChallenges}
            </span>
          </div>
          <motion.h4 
            key={challenge.id}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-lg md:text-xl font-display font-bold text-white leading-snug drop-shadow-md"
          >
            "{challenge.text}"
          </motion.h4>
          {challenge.context && (
            <p className="text-[11px] md:text-xs text-neutral-300 font-sans tracking-wide mt-1 drop-shadow-sm">
              💡 {challenge.context}
            </p>
          )}
        </div>

        {/* Record Trigger overlaid at the bottom of the video viewport mimicking a phone call/camera capture screen */}
        <div className="absolute inset-x-0 bottom-4 flex flex-col items-center justify-center p-2 z-10">
          <button
            id="btn-trigger-record"
            onClick={handleRecordTrigger}
            disabled={isRecording}
            className={`relative group w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg border border-white/20 backdrop-blur-xs ${
              isRecording 
                ? 'bg-neutral-800/90 ring-4 ring-red-500/40'
                : 'bg-red-500 hover:bg-red-600 ring-4 ring-red-500/20 hover:scale-[1.08] active:scale-95'
            }`}
          >
            {isRecording ? (
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="h-5 w-5 bg-white rounded-sm" 
              />
            ) : (
              <Video className="w-5 h-5 text-white animate-pulse" />
            )}
          </button>
          
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-white drop-shadow-md mt-1.5 filter opacity-90">
            {isRecording 
              ? 'RECORDING...' 
              : 'TAP TO RECORD (3s)'}
          </span>
        </div>

        {/* Mode-specific full visual modals */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-24 left-4 pointer-events-none z-10"
            >
              <div className="bg-red-500/95 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-mono shadow-md backdrop-blur-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                <span>REC {recordTimeLeft.toFixed(1)}s</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Device Configurations Panel */}
      <div className="bg-neutral-900 border border-neutral-850 rounded-2xl p-4 flex flex-col items-center shadow-xs mt-3">
        <div className="flex items-center justify-between w-full text-xs text-neutral-300">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Sliders className="w-3.5 h-3.5" />
            <span>Setup Camera Device:</span>
          </div>

          <div className="flex bg-neutral-950 p-0.5 rounded-lg border border-neutral-800/50">
            <button
              id="toggle-real-cam"
              onClick={() => setUseVirtual(false)}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                !useVirtual 
                  ? 'bg-neutral-800 shadow-xs text-white text-[11px]' 
                  : 'text-neutral-500 hover:text-neutral-400 text-[11px]'
              }`}
            >
              Hardware Camera
            </button>
            <button
              id="toggle-virtual-cam"
              onClick={() => setupVirtualStream()}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                useVirtual 
                  ? 'bg-neutral-800 shadow-xs text-white text-[11px]' 
                  : 'text-neutral-500 hover:text-neutral-400 text-[11px]'
              }`}
            >
              Sandbox Simulator
            </button>
          </div>
        </div>

        {permissionError && !useVirtual && (
          <div className="w-full text-center text-xs text-neutral-450 mt-2 bg-neutral-950 p-2.5 rounded-xl border border-neutral-850">
            🎥 Physical camera blocked inside sandbox. Switched seamlessly to Virtual simulator.
          </div>
        )}
      </div>
    </div>
  );
}
