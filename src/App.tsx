import React, { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import CameraView from './components/CameraView';
import PlaybackView from './components/PlaybackView';
import ResultsScreen from './components/ResultsScreen';
import { Challenge, RecordedItem, AppState, Category } from './types';
import { Video, Award, RefreshCw, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [deckCategory, setDeckCategory] = useState<Category>('tongue-twisters');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Accumulation state for recorded answers
  const [recordedItems, setRecordedItems] = useState<RecordedItem[]>([]);
  const [tempVideoUrl, setTempVideoUrl] = useState<string | null>(null);
  const [tempVideoBlob, setTempVideoBlob] = useState<Blob | null>(null);

  // Basic permission indicators
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState<boolean>(false);

  // Revoke object URLs on component unmount / change to free memory
  useEffect(() => {
    return () => {
      clearAllVideoUrls();
    };
  }, []);

  const clearAllVideoUrls = () => {
    recordedItems.forEach((item) => {
      try {
        URL.revokeObjectURL(item.videoUrl);
      } catch (e) {
        // Safe bypass
      }
    });
    if (tempVideoUrl) {
      try {
        URL.revokeObjectURL(tempVideoUrl);
      } catch (e) {
        // Safe bypass
      }
    }
  };

  const handleStartSession = (selectedChallenges: Challenge[], categoryId: Category) => {
    // Revoke old urls
    clearAllVideoUrls();
    
    setChallenges(selectedChallenges);
    setDeckCategory(categoryId);
    setRecordedItems([]);
    setCurrentIndex(0);
    setTempVideoUrl(null);
    setTempVideoBlob(null);
    setAppState('recording');
  };

  const handleRecordingComplete = (blob: Blob) => {
    // Generate temporary playback link
    const videoUrl = URL.createObjectURL(blob);
    setTempVideoUrl(videoUrl);
    setTempVideoBlob(blob);
    setAppState('reviewing');
  };

  const handleEvaluate = (status: 'correct' | 'incorrect') => {
    if (!tempVideoUrl || !tempVideoBlob) return;

    const currentChallenge = challenges[currentIndex];
    const item: RecordedItem = {
      id: currentChallenge.id,
      challenge: currentChallenge,
      videoUrl: tempVideoUrl,
      videoBlob: tempVideoBlob,
      evaluation: status,
      timestamp: Date.now(),
    };

    const updatedRecorded = [...recordedItems, item];
    setRecordedItems(updatedRecorded);

    // Transition or loop
    if (currentIndex + 1 < challenges.length) {
      setCurrentIndex((prev) => prev + 1);
      setTempVideoUrl(null);
      setTempVideoBlob(null);
      setAppState('recording');
    } else {
      setAppState('results');
    }
  };

  const handleRetryRecording = () => {
    // Revoke current temp URL to prevent leak
    if (tempVideoUrl) {
      try {
        URL.revokeObjectURL(tempVideoUrl);
      } catch (e) {}
    }
    setTempVideoUrl(null);
    setTempVideoBlob(null);
    setAppState('recording');
  };

  const handleRestartSession = () => {
    clearAllVideoUrls();
    setRecordedItems([]);
    setCurrentIndex(0);
    setTempVideoUrl(null);
    setTempVideoBlob(null);
    setAppState('welcome');
  };

  const requestPermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setCameraPermissionGranted(true);
      return true;
    } catch (e) {
      setCameraPermissionGranted(false);
      return false;
    }
  };

  const getCategoryLabel = () => {
    switch (deckCategory) {
      case 'tongue-twisters':
        return 'Tongue Twisters 👅';
      case 'emotion-acting':
        return 'Emotion Acting 🎭';
      case 'rapid-fire':
        return 'Rapid Fire ⚡';
      case 'gestures':
        return 'Action Gestures 🖐️';
      case 'custom':
        return 'Custom Challenge Set ✍️';
      default:
        return 'Challenge';
    }
  };

  return (
    <div id="application-root" className="min-h-screen bg-neutral-50/50 flex flex-col font-sans text-neutral-800">
      
      {/* Top Main Navigation Header */}
      <header className="border-b border-neutral-100 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            onClick={handleRestartSession}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition"
          >
            <div className="h-8 w-8 bg-red-500 rounded-lg flex items-center justify-center text-white font-semibold">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-neutral-900 font-display">
                Articulate to Video
              </h1>
              <p className="text-[10px] text-neutral-400 font-mono">3S CAPTURE & EVALUATION</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            {appState !== 'welcome' && (
              <span className="hidden sm:inline-flex items-center gap-1 text-neutral-400">
                <Layers className="w-3.5 h-3.5" />
                Category: <strong className="text-neutral-700">{getCategoryLabel()}</strong>
              </span>
            )}
            
            {appState === 'welcome' ? (
              <span className="text-[11px] text-emerald-500 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full font-sans font-medium flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                App Online
              </span>
            ) : (
              <button
                id="btn-header-reset"
                onClick={handleRestartSession}
                className="text-neutral-500 hover:text-neutral-900 font-sans font-semibold transition flex items-center gap-1 border border-neutral-100 bg-neutral-50 px-3 py-1.5 rounded-full cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container Stage */}
      <main className="flex-1 flex items-center justify-center py-6 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={appState}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="w-full flex justify-center"
          >
            {appState === 'welcome' && (
              <WelcomeScreen
                onStartSession={handleStartSession}
                isCameraAllowed={cameraPermissionGranted}
                requestPermission={requestPermission}
              />
            )}

            {appState === 'recording' && challenges.length > 0 && (
              <CameraView
                challenge={challenges[currentIndex]}
                challengeIndex={currentIndex}
                totalChallenges={challenges.length}
                onRecordingComplete={handleRecordingComplete}
              />
            )}

            {appState === 'reviewing' && tempVideoUrl && tempVideoBlob && challenges.length > 0 && (
              <PlaybackView
                challenge={challenges[currentIndex]}
                challengeIndex={currentIndex}
                totalChallenges={challenges.length}
                videoUrl={tempVideoUrl}
                videoBlob={tempVideoBlob}
                onEvaluate={handleEvaluate}
                onRetry={handleRetryRecording}
              />
            )}

            {appState === 'results' && (
              <ResultsScreen
                recordedItems={recordedItems}
                totalChallenges={challenges.length}
                categoryLabel={getCategoryLabel()}
                onRestart={handleRestartSession}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Humble Footer */}
      <footer className="border-t border-neutral-100 bg-white/50 py-4 text-center text-[10px] text-neutral-400 font-sans tracking-wide">
        Articulate to Video &bull; Record, review, and evaluate standard statements in 3 seconds.
      </footer>

    </div>
  );
}
