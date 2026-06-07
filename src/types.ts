export interface Challenge {
  id: string;
  text: string;
  context?: string; // Guidance on what to do/say
}

export interface RecordedItem {
  id: string; // matches the challenge id
  challenge: Challenge;
  videoUrl: string;
  videoBlob: Blob;
  evaluation: 'correct' | 'incorrect' | null;
  timestamp: number;
}

export type Category = 'tongue-twisters' | 'emotion-acting' | 'rapid-fire' | 'gestures' | 'custom';

export type AppState = 'welcome' | 'get-ready' | 'recording' | 'reviewing' | 'results';
