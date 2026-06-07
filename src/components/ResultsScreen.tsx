import React, { useState, useRef } from 'react';
import { Challenge, RecordedItem } from '../types';
import { Award, Share2, RotateCcw, Play, Pause, ChevronRight, CheckCircle, XCircle, ArrowLeft, Download, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ResultsScreenProps {
  recordedItems: RecordedItem[];
  totalChallenges: number;
  categoryLabel: string;
  onRestart: () => void;
}

export default function ResultsScreen({
  recordedItems,
  totalChallenges,
  categoryLabel,
  onRestart,
}: ResultsScreenProps) {
  const [selectedReviewItem, setSelectedReviewItem] = useState<RecordedItem | null>(null);
  const [reviewPlaying, setReviewPlaying] = useState<boolean>(true);
  const reviewVideoRef = useRef<HTMLVideoElement | null>(null);

  // Calculate score matches
  const correctCount = recordedItems.filter((item) => item.evaluation === 'correct').length;
  const scorePercentage = totalChallenges > 0 ? (correctCount / totalChallenges) * 100 : 0;

  // Grade messages
  let titleMessage = 'Practice Needed';
  let subtitleMessage = 'Keep training to improve your delivery and articulation.';
  let rankColor = 'text-red-500';

  if (scorePercentage >= 90) {
    titleMessage = 'Articulate Champion! 🏆';
    subtitleMessage = 'Phenomenal precision. Every statement was captured with pristine clarity.';
    rankColor = 'text-emerald-500';
  } else if (scorePercentage >= 70) {
    titleMessage = 'Excellent Performance! 🌟';
    subtitleMessage = 'Great coordination and confident delivery on almost all challenges.';
    rankColor = 'text-blue-500';
  } else if (scorePercentage >= 50) {
    titleMessage = 'Solid Progress! 🎯';
    subtitleMessage = 'More than half correct! With a little more speed, you will ace it.';
    rankColor = 'text-amber-500';
  }

  // Handle preview clicks
  const selectReview = (item: RecordedItem) => {
    setSelectedReviewItem(item);
    setReviewPlaying(true);
  };

  const handleExportData = () => {
    try {
      const exportObject = recordedItems.map((item, index) => ({
        challengeId: item.challenge.id,
        challengeText: item.challenge.text,
        challengeContext: item.challenge.context || '',
        evaluation: item.evaluation,
        timestamp: new Date(item.timestamp).toLocaleString(),
      }));

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `Articulation_Report_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      alert("Could not export session reports.");
    }
  };

  return (
    <div id="results-screen" className="w-[100%] max-w-4xl mx-auto flex flex-col lg:flex-row gap-8 px-4 py-8 items-start">
      
      {/* LEFT COLUMN: Main score circular arch card */}
      <div className="w-full lg:w-5/12 bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col items-center text-center space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-mono text-neutral-400 tracking-wider uppercase">{categoryLabel} Category</span>
          <h2 className="text-2xl font-display font-bold text-neutral-800">Final Assessment</h2>
        </div>

        {/* Circular SVG Gauge */}
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Arch circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#f5f5f5"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Action Arch circle */}
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              stroke={scorePercentage >= 70 ? '#10b981' : scorePercentage >= 50 ? '#f59e0b' : '#ef4444'}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray="251.2"
              initial={{ strokeDashoffset: 251.2 }}
              animate={{ strokeDashoffset: 251.2 - (251.2 * scorePercentage) / 100 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </svg>
          
          <div className="text-center">
            <span className="block text-4xl font-display font-extrabold text-neutral-900 font-bold">
              {correctCount}
            </span>
            <span className="text-sm font-semibold text-neutral-400 block border-t border-neutral-100 mt-1 pt-1">
              out of {totalChallenges}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <span className={`block font-display font-extrabold text-lg ${rankColor}`}>
            {titleMessage}
          </span>
          <p className="text-xs text-neutral-400 max-w-xs leading-relaxed mx-auto">
            {subtitleMessage}
          </p>
        </div>

        {/* Custom Actions */}
        <div className="w-full grid grid-cols-2 gap-3 pt-4 border-t border-neutral-50">
          <button
            id="btn-results-restart"
            onClick={onRestart}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Try Again
          </button>
          
          <button
            id="btn-results-export"
            onClick={handleExportData}
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Save Log
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: Sequence scroll history of standard reviews */}
      <div className="w-full lg:w-7/12 space-y-4">
        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider pl-1 font-mono">
          Challenge Video Logs & Saved Results
        </h3>

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {recordedItems.map((item, index) => {
            const isMock = item.videoBlob.size < 100;
            return (
              <div
                key={item.id}
                onClick={() => selectReview(item)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-left group ${
                  selectedReviewItem?.id === item.id
                    ? 'border-neutral-900 bg-neutral-50 shadow-xs'
                    : 'border-neutral-100 bg-white hover:border-neutral-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {item.evaluation === 'correct' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-neutral-400 font-mono">STEP {index + 1}</span>
                    <h4 className="text-xs font-bold text-neutral-800 leading-tight">
                      "{item.challenge.text}"
                    </h4>
                    <p className="text-[10px] text-neutral-400 truncate max-w-sm">
                      {isMock ? '🔋 Virtual Sandbox stream saved' : '🎥 Physical microphone & camera recorded'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-8 w-8 rounded-full bg-neutral-100 group-hover:bg-neutral-900 group-hover:text-white transition flex items-center justify-center text-neutral-500">
                    <Film className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Modal Drawer/Overlay to play back recorded challenges */}
        <AnimatePresence>
          {selectedReviewItem && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="bg-neutral-900 text-white rounded-3xl p-5 border border-neutral-800 space-y-4 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase">Video Record Review</span>
                  <h4 className="text-xs font-bold font-display text-white mt-0.5">
                    "{selectedReviewItem.challenge.text}"
                  </h4>
                </div>
                <button
                  id="btn-close-review"
                  onClick={() => setSelectedReviewItem(null)}
                  className="text-white hover:text-neutral-300 text-xs px-2.5 py-1 rounded bg-neutral-800 border border-neutral-700 cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Loop review player */}
              <div className="relative aspect-video rounded-2xl bg-neutral-950 overflow-hidden border border-neutral-800 flex items-center justify-center">
                {selectedReviewItem.videoBlob.size < 100 ? (
                  // Virtual loop simulated
                  <div className="text-center p-6 space-y-3">
                    <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-ping" />
                    <p className="text-xs text-neutral-300 font-mono">
                      [Virtual Simulation Clip Captured Successfully]
                    </p>
                    <p className="text-[10px] text-neutral-500 max-w-xs leading-normal">
                      Clip saved locally. In physical recording mode, your real camera and sound audio will play here on compile.
                    </p>
                  </div>
                ) : (
                  // Real playback
                  <video
                    ref={reviewVideoRef}
                    id="modal-playback-video"
                    src={selectedReviewItem.videoUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                )}
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-400 text-[10px]">
                  Graded Outcome:{' '}
                  <span className={selectedReviewItem.evaluation === 'correct' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                    {selectedReviewItem.evaluation === 'correct' ? '✅ Correct / True' : '❌ Incorrect / False'}
                  </span>
                </span>
                <span className="text-[10px] text-neutral-400">
                  Recorded {new Date(selectedReviewItem.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
