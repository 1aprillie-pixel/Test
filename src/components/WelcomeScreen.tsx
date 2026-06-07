import React, { useState } from 'react';
import { CATEGORIES, PRESET_CHALLENGES } from '../data';
import { Challenge, Category } from '../types';
import { Camera, Sparkles, Video, Keyboard, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface WelcomeScreenProps {
  onStartSession: (challenges: Challenge[], categoryId: Category) => void;
  isCameraAllowed: boolean;
  requestPermission: () => Promise<boolean>;
}

export default function WelcomeScreen({ onStartSession, isCameraAllowed, requestPermission }: WelcomeScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>('tongue-twisters');
  const [customInput, setCustomInput] = useState<string>('');
  const [errorText, setErrorText] = useState<string | null>(null);

  const startSession = async () => {
    if (selectedCategory === 'custom') {
      const parsed = customInput
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (parsed.length < 1) {
        setErrorText('Please enter at least one custom challenge line.');
        return;
      }

      const challenges: Challenge[] = parsed.map((text, i) => ({
        id: `custom-${i}`,
        text,
        context: 'Read and articulate clearly in 3 seconds.',
      }));

      onStartSession(challenges, 'custom');
    } else {
      const presets = PRESET_CHALLENGES[selectedCategory];
      onStartSession(presets, selectedCategory);
    }
  };

  return (
    <div id="welcome-screen" className="flex flex-col items-center justify-center p-4 max-w-2xl mx-auto space-y-8 py-10">
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 mb-2"
        >
          <Video className="w-8 h-8" />
        </motion.div>
        
        <h1 className="text-4xl font-display font-bold tracking-tight text-neutral-900">
          Articulate to Video
        </h1>
        <p className="text-neutral-500 max-w-md mx-auto text-sm leading-relaxed">
          Record a short 3-second video statement or action, review your playback, and grade your performance. Perfect for pronunciation, drama, and quick-reflex challenges!
        </p>
      </div>

      {/* Category selector */}
      <div className="w-full bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-display font-semibold text-neutral-800 flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Choose Challenge Category
          </h2>
          <p className="text-xs text-neutral-400">Select one of our collections of 10 items or create your own.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              id={`cat-${category.id}`}
              onClick={() => {
                setSelectedCategory(category.id);
                setErrorText(null);
              }}
              className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                selectedCategory === category.id
                  ? 'border-neutral-900 bg-neutral-900/5 shadow-sm scale-[1.02]'
                  : 'border-neutral-100 hover:border-neutral-300 hover:bg-neutral-50/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">{category.emoji}</span>
                <div className="space-y-1">
                  <h3 className={`font-semibold text-sm ${selectedCategory === category.id ? 'text-neutral-900' : 'text-neutral-800'}`}>
                    {category.label}
                  </h3>
                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {category.description}
                  </p>
                </div>
              </div>
            </button>
          ))}

          <button
            id="cat-custom"
            onClick={() => {
              setSelectedCategory('custom');
              setErrorText(null);
            }}
            className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
              selectedCategory === 'custom'
                ? 'border-neutral-900 bg-neutral-900/5 shadow-sm scale-[1.02]'
                : 'border-neutral-100 hover:border-neutral-300 hover:bg-neutral-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">✍️</span>
              <div className="space-y-1">
                <h3 className={`font-semibold text-sm ${selectedCategory === 'custom' ? 'text-neutral-900' : 'text-neutral-800'}`}>
                  Custom Deck
                </h3>
                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                  Enter your own sequence of prompts, statements, or questions.
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Custom Input Textarea */}
        {selectedCategory === 'custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3 pt-2"
          >
            <label className="text-xs font-semibold text-neutral-600 flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5 text-neutral-500" />
              Enter statements (one per line)
            </label>
            <textarea
              id="custom-input-textarea"
              placeholder="Example:&#10;Say 'Red leather, yellow leather' 3 times!&#10;Give your best James Bond introduction&#10;Do a thumbs-up and wink"
              rows={5}
              value={customInput}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setCustomInput(e.target.value);
                setErrorText(null);
              }}
              className="w-full p-3 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 font-sans leading-relaxed"
            />
            <p className="text-[11px] text-neutral-400">
              Each line will represent one video challenge (max 10 highly recommended).
            </p>
          </motion.div>
        )}

        {errorText && (
          <div className="text-xs font-semibold text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
            {errorText}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-neutral-50">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <HelpCircle className="w-4 h-4 text-neutral-300" />
            <span>Permissions needed: Camera & Mic</span>
          </div>

          <button
            id="btn-start-session"
            onClick={startSession}
            className="w-full sm:w-auto px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold shadow-sm transition-all duration-150 hover:shadow-md cursor-pointer text-sm flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4" />
            Begin Challenge Deck
          </button>
        </div>
      </div>

      {/* Instructional Walkthrough */}
      <div className="w-full bg-neutral-50 rounded-2xl p-6 border border-neutral-100/80">
        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">How it works</h3>
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-neutral-200 text-neutral-700 text-xs font-bold font-mono">
              1
            </div>
            <h4 className="font-semibold text-xs text-neutral-800">Record 3s Video</h4>
            <p className="text-[11px] text-neutral-400 leading-normal">
              Press record! You have exactly three seconds to vocalize or perform the prompt shown.
            </p>
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-neutral-200 text-neutral-700 text-xs font-bold font-mono">
              2
            </div>
            <h4 className="font-semibold text-xs text-neutral-800">Auto Playback</h4>
            <p className="text-[11px] text-neutral-400 leading-normal">
              The camera stops automatically and loops your video right away so you can analyze your statement.
            </p>
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-neutral-200 text-neutral-700 text-xs font-bold font-mono">
              3
            </div>
            <h4 className="font-semibold text-xs text-neutral-800">Self-Evaluate</h4>
            <p className="text-[11px] text-neutral-400 leading-normal">
              Mark whether your articulation or gesture was ✅ Correct or ❌ Incorrect. Watch the running score!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
