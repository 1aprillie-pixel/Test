import React, { useEffect, useRef, useState } from 'react';
import { Challenge } from '../types';
import { Check, X, Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PlaybackViewProps {
  challenge: Challenge;
  challengeIndex: number;
  totalChallenges: number;
  videoUrl: string;
  videoBlob: Blob;
  onEvaluate: (status: 'correct' | 'incorrect') => void;
  onRetry: () => void;
}

// Synthesized Sound FX utilizing the standard Web Audio API
const playHappySound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    // Happy cascading chime arpeggio (A4 -> C#5 -> E5 -> A5)
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.11);
      
      gain.gain.setValueAtTime(0, now + idx * 0.11);
      gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.11 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.11 + 0.45);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + idx * 0.11);
      osc.stop(now + idx * 0.11 + 0.5);
    });

    // Simulated organic cheering / applause bursts using quick white noise envelopes
    for (let i = 0; i < 15; i++) {
      const clapTime = now + 0.15 + i * (0.07 + Math.random() * 0.05);
      const bufferSize = ctx.sampleRate * 0.12; 
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      // Seed randomized audio values to approximate applause
      for (let s = 0; s < bufferSize; s++) {
        data[s] = Math.random() * 2 - 1;
      }
      
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1100, clapTime);
      filter.Q.setValueAtTime(2.0, clapTime);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.12, clapTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, clapTime + 0.1);
      
      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      noiseSource.start(clapTime);
      noiseSource.stop(clapTime + 0.12);
    }
  } catch (e) {
    console.warn("Audio Context synthesis blocked by browser safety standards.");
  }
};

const playSadSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    // Disappointed sliding "ohhh" voice frequency drop
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(210, now);
    osc.frequency.exponentialRampToValueAtTime(105, now + 0.8);
    
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(320, now + 0.8);
    filter.Q.setValueAtTime(3.0, now);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.9);
  } catch (e) {
    console.warn("Audio Context synthesis blocked by browser safety standards.");
  }
};

export default function PlaybackView({
  challenge,
  challengeIndex,
  totalChallenges,
  videoUrl,
  videoBlob,
  onEvaluate,
  onRetry,
}: PlaybackViewProps) {
  const playbackVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [useVirtualPlayback, setUseVirtualPlayback] = useState<boolean>(false);

  // Evaluation visual/audio feedback state
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [particles, setParticles] = useState<{ id: number; char?: string; x: number; scale: number; delay: number; color?: string }[]>([]);

  // Detect whether the video blob is a simulation trigger
  useEffect(() => {
    if (videoBlob.size < 100) {
      setUseVirtualPlayback(true);
    } else {
      setUseVirtualPlayback(false);
    }
  }, [videoBlob]);

  // Hook up real player events
  useEffect(() => {
    const video = playbackVideoRef.current;
    if (video) {
      if (isPlaying) {
        video.play().catch(() => {
          setIsPlaying(false);
        });
      } else {
        video.pause();
      }
    }
  }, [isPlaying, videoUrl]);

  // Handle virtual canvas playback rendering
  useEffect(() => {
    if (useVirtualPlayback) {
      startVirtualPlaybackLoop();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [useVirtualPlayback, isPlaying]);

  const startVirtualPlaybackLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;

    const draw = () => {
      if (!ctx || !canvas) return;
      const width = canvas.width;
      const height = canvas.height;

      // Slate twilight playback background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Simple grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      // Playback outline indicator
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(20, 20, width - 40, height - 40);

      // Playback label
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.fillText('◀ REPLAYING CAPTURED STREAM', 40, 45);

      // Draw avatar reacting
      const centerY = height / 2;
      const centerX = width / 2;
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(centerX, centerY - 10, 80, 0, Math.PI * 2);
      ctx.stroke();

      // Eyes
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(centerX - 30, centerY - 25, 6, 0, Math.PI * 2);
      ctx.arc(centerX + 30, centerY - 25, 6, 0, Math.PI * 2);
      ctx.fill();

      // Fun speaking loop
      ctx.beginPath();
      if (isPlaying) {
        const shape = Math.sin(frame / 6) * 15 + 10;
        ctx.arc(centerX, centerY + 20, shape, 0, Math.PI, false);
      } else {
        ctx.arc(centerX, centerY + 15, 12, 0, Math.PI, false);
      }
      ctx.stroke();

      // Audio waves looping at base
      const barCount = 40;
      const barWidth = (width - 80) / barCount;
      ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
      for (let i = 0; i < barCount; i++) {
        const audioFactor = frictionWave(i, frame);
        const barHeight = isPlaying ? Math.max(3, audioFactor * 45) : 3;
        ctx.fillRect(
          40 + i * barWidth + 2,
          height - 50 - barHeight,
          barWidth - 4,
          barHeight
        );
      }

      if (isPlaying) {
        frame += 1.25;
      }
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    const frictionWave = (x: number, t: number) => {
      return (
        Math.abs(Math.sin(x * 0.15 + t * 0.1) * Math.cos(x * 0.08 - t * 0.05)) *
        Math.exp(-Math.pow((x - 20) / 10, 2))
      );
    };

    draw();
  };

  const handleTogglePlayback = () => {
    setIsPlaying((prev) => !prev);
  };

  // Perform delightful reactive delay with synthesized sounds & floating element streams
  const handleEvaluateTrigger = (status: 'correct' | 'incorrect') => {
    if (feedbackState !== 'idle') return;

    setFeedbackState(status);

    // Initialize custom randomized particle parameters
    const list: typeof particles = [];
    if (status === 'correct') {
      playHappySound();
      
      const colors = ['#34d399', '#fabc3f', '#60a5fa', '#f472b6', '#a78bfa'];
      for (let i = 0; i < 28; i++) {
        list.push({
          id: i,
          x: Math.floor(Math.random() * 88) + 6, // percentage based
          scale: Number((0.5 + Math.random() * 1.5).toFixed(2)),
          delay: Number((Math.random() * 0.4).toFixed(2)),
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    } else {
      playSadSound();
      
      // Drifting sad face emojis & tickers
      const sadEmojis = ['😢', '😭', '😞', '🤕', '💔', '😿', '😟'];
      for (let i = 0; i < 7; i++) {
        list.push({
          id: i,
          char: sadEmojis[i % sadEmojis.length],
          x: Math.floor(Math.random() * 80) + 10, // percentage based
          scale: Number((0.8 + Math.random() * 1.3).toFixed(2)),
          delay: Number((Math.random() * 0.5).toFixed(2)),
        });
      }
    }

    setParticles(list);

    // Pause for 1.8 seconds to display immersive effects, then step program to parent state
    setTimeout(() => {
      onEvaluate(status);
    }, 1800);
  };

  return (
    <div id="playback-view" className="w-[100%] max-w-2xl mx-auto flex flex-col space-y-4 px-4">
      
      {/* Top breadcrumb navigation */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-medium text-neutral-400 bg-neutral-100 px-2.5 py-1 rounded-full">
          Evaluating Challenge {challengeIndex + 1} of {totalChallenges}
        </span>
        <button
          id="btn-retry-recording"
          onClick={onRetry}
          disabled={feedbackState !== 'idle'}
          className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 disabled:opacity-40 flex items-center gap-1 bg-white border border-neutral-200 px-3 py-1.5 rounded-full transition-all cursor-pointer shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Re-record
        </button>
      </div>

      {/* Main Playback screen viewport with call overlays */}
      <div className="relative w-full aspect-video bg-neutral-950 rounded-3xl overflow-hidden shadow-lg border border-neutral-900 group">
        
        {/* Real MP4/WebM output tag */}
        <video
          ref={playbackVideoRef}
          id="playback-video-player"
          src={videoUrl}
          autoPlay
          loop
          playsInline
          muted={isMuted}
          className={`w-full h-full object-cover transform -scale-x-100 ${useVirtualPlayback ? 'hidden' : 'block'}`}
        />

        {/* Live virtual simulation canvas */}
        <canvas
          ref={canvasRef}
          id="playback-simulation-canvas"
          width={640}
          height={480}
          className={`w-full h-full object-cover ${useVirtualPlayback ? 'block' : 'hidden'}`}
        />

        {/* Video Prompt Backdrop Header */}
        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-neutral-950/90 to-transparent p-6 text-center z-10">
          <h4 className="text-lg md:text-xl font-display font-bold text-white leading-snug drop-shadow-md">
            "{challenge.text}"
          </h4>
          <span className="inline-block mt-2 text-[10px] text-emerald-400 font-mono tracking-wider bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/20">
            AUTO-PLAYING AUDIO REVIEW
          </span>
        </div>

        {/* INTERACTIVE CALL SCREEN BUTTON OVERLAYS FLOATING RIGHT INSIDE THE VIDEO ITSELF */}
        {feedbackState === 'idle' && (
          <div className="absolute inset-x-0 bottom-6 flex justify-center gap-12 sm:gap-16 items-center px-4 z-20">
            {/* ❌ DECLINE BUTTON */}
            <div className="flex flex-col items-center">
              <button
                id="btn-evaluate-incorrect"
                onClick={() => handleEvaluateTrigger('incorrect')}
                className="relative group w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 ring-4 ring-red-500/10 hover:ring-red-500/30"
              >
                {/* Radial call pulse */}
                <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping group-hover:animate-none opacity-40" />
                <X className="w-5 h-5 text-white stroke-[3.5]" />
              </button>
              <span className="text-[9px] font-extrabold tracking-wider text-red-100 drop-shadow-md mt-1.5 uppercase bg-neutral-950/40 px-2 py-0.5 rounded backdrop-blur-xs">
                ❌ DECLINE
              </span>
            </div>

            {/* ✅ ACCEPT BUTTON */}
            <div className="flex flex-col items-center">
              <button
                id="btn-evaluate-correct"
                onClick={() => handleEvaluateTrigger('correct')}
                className="relative group w-14 h-14 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 ring-4 ring-emerald-500/10 hover:ring-emerald-500/30"
              >
                {/* Radial call pulse */}
                <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping group-hover:animate-none opacity-40 delay-200" />
                <Check className="w-5 h-5 text-white stroke-[3.5]" />
              </button>
              <span className="text-[9px] font-extrabold tracking-wider text-emerald-100 drop-shadow-md mt-1.5 uppercase bg-neutral-950/40 px-2 py-0.5 rounded backdrop-blur-xs">
                ✅ ACCEPT
              </span>
            </div>
          </div>
        )}

        {/* Dynamic player utility controllers in top-right or overlay margins */}
        {feedbackState === 'idle' && (
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button
              id="btn-playback-playpause"
              onClick={handleTogglePlayback}
              className="p-1.5 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs cursor-pointer transition flex items-center justify-center"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white text-white" /> : <Play className="w-3.5 h-3.5 fill-white text-white" />}
            </button>
            {!useVirtualPlayback && (
              <button
                id="btn-playback-mute"
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs cursor-pointer transition flex items-center justify-center"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        )}

        {/* Visual feedback bubbles/fireworks and sad face stickers absolutely overlaid */}
        <AnimatePresence>
          {feedbackState !== 'idle' && (
            <div className="absolute inset-0 bg-neutral-950/60 flex flex-col items-center justify-center z-30 overflow-hidden pointer-events-none">
              
              {/* Giant status banner */}
              <motion.div
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="text-center z-10"
              >
                <span className={`font-display font-extrabold text-2xl tracking-wider uppercase drop-shadow-lg px-6 py-2 rounded-full border ${
                  feedbackState === 'correct' 
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 glow-green' 
                    : 'text-red-400 bg-red-500/10 border-red-500/30 glow-red'
                }`}>
                  {feedbackState === 'correct' ? '🎉 APPROVED! (+1)' : '😢 INCORRECT'}
                </span>
              </motion.div>

              {/* Rendering of correct particles (bubbles & star sparkles) */}
              {feedbackState === 'correct' && (
                <div className="absolute inset-0">
                  {particles.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0.1, x: `${p.x}%`, y: '100%', scale: 0.4 }}
                      animate={{ 
                        opacity: [0.1, 0.9, 0],
                        y: ['100%', '-10%', '-30%'],
                        x: [`${p.x}%`, `${p.x + (Math.sin(p.id) * 15)}%`, `${p.x + (Math.cos(p.id) * 20)}%`],
                        scale: [0.4, p.scale, 0.2]
                      }}
                      transition={{ duration: 1.6, ease: 'easeOut', delay: p.delay }}
                      className="absolute rounded-full pointer-events-none"
                      style={{
                        backgroundColor: p.color || 'rgba(52, 211, 153, 0.6)',
                        width: '18px',
                        height: '18px',
                        boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)'
                      }}
                    />
                  ))}
                  
                  {/* Plus extra little pop star icons to represent fireworks */}
                  {[...Array(12)].map((_, idx) => {
                    const angle = (idx / 12) * Math.PI * 2;
                    const r = 160;
                    return (
                      <motion.div
                        key={`star-${idx}`}
                        initial={{ opacity: 0.2, x: '50%', y: '50%', scale: 0.3 }}
                        animate={{ 
                          opacity: [0.2, 1, 0],
                          x: [`50%`, `calc(50% + ${Math.cos(angle) * r}px)`],
                          y: [`50%`, `calc(50% + ${Math.sin(angle) * r}px)`],
                          scale: [0.3, 1.2, 0.2],
                        }}
                        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.05 }}
                        className="absolute text-xl pointer-events-none"
                        style={{ left: '46%', top: '44%' }}
                      >
                        ✨
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Rendering of sad stickers */}
              {feedbackState === 'incorrect' && (
                <div className="absolute inset-0">
                  {particles.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: `${p.x}%`, y: '90%', scale: 0.5, rotate: -20 }}
                      animate={{ 
                        opacity: [0, 1, 0.9, 0],
                        y: ['95%', '15%', '-20%'],
                        x: [`${p.x}%`, `${p.x + Math.sin(p.id * 2) * 15}%`],
                        scale: [0.5, p.scale, p.scale + 0.3, 0.1],
                        rotate: [-20, 20, -10, p.id % 2 === 0 ? 35 : -35]
                      }}
                      transition={{ duration: 1.8, ease: 'easeInOut', delay: p.delay }}
                      className="absolute text-4xl pointer-events-none select-none filter drop-shadow-md"
                    >
                      {p.char}
                    </motion.div>
                  ))}
                </div>
              )}

            </div>
          )}
        </AnimatePresence>

      </div>

      {/* Minimal status bar underneath to provide professional tips and keep the outer frame uncluttered */}
      <div className="bg-white border border-neutral-100 rounded-2xl p-4 text-center">
        <p className="text-[11px] text-neutral-400 font-serif italic max-w-md mx-auto leading-normal">
          "Review speech playback. Grade objectively with Accept ✅ or Decline ❌ overlays directly on the video screen."
        </p>
      </div>

    </div>
  );
}
