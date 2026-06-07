import { Challenge, Category } from './types';

export const CATEGORIES: { id: Category; label: string; description: string; emoji: string }[] = [
  {
    id: 'tongue-twisters',
    label: 'Tongue Twisters',
    description: 'Test your speech coordination and articulation under pressure.',
    emoji: '👅',
  },
  {
    id: 'emotion-acting',
    label: 'Emotion Acting',
    description: 'Express rapid shifting emotions using facial and vocal cues.',
    emoji: '🎭',
  },
  {
    id: 'rapid-fire',
    label: 'Rapid Fire Q&A',
    description: 'Answer fast-paced questions or complete phrases in 3 seconds.',
    emoji: '⚡',
  },
  {
    id: 'gestures',
    label: 'Action Gestures',
    description: 'Perform precise physical movements and symbols in frame.',
    emoji: '🖐️',
  },
];

export const PRESET_CHALLENGES: Record<Exclude<Category, 'custom'>, Challenge[]> = {
  'tongue-twisters': [
    {
      id: 'tt-1',
      text: "Peter Piper picked a peck of pickled peppers.",
      context: "Articulate every 'P' clearly without stumbling.",
    },
    {
      id: 'tt-2',
      text: "How can a clam cram in a clean cream can?",
      context: "Emphasize the crisp 'C' and 'M' sounds.",
    },
    {
      id: 'tt-3',
      text: "She sells sea shells by the sea shore.",
      context: "Sibilant s-sounds! Do not slip them.",
    },
    {
      id: 'tt-4',
      text: "Red lorry, yellow lorry, red lorry, yellow lorry.",
      context: "Quick shifts between 'R' and 'L'. Repeat twice!",
    },
    {
      id: 'tt-5',
      text: "Six sticky skeletons slithered silently.",
      context: "Keep your speed high and the consonants dry.",
    },
    {
      id: 'tt-6',
      text: "Which witch wished to watch the wrist watch?",
      context: "Clear vocal differences between 'W' and 'CH'.",
    },
    {
      id: 'tt-7',
      text: "A proper copper coffee pot.",
      context: "A hard, snappy tongue twister. Repeat three times!",
    },
    {
      id: 'tt-8',
      text: "Truly rural, truly rural, truly rural.",
      context: "Extremely difficult for liquid consonants. Say it clearly.",
    },
    {
      id: 'tt-9',
      text: "Fuzzy Wuzzy was a bear, Fuzzy Wuzzy had no hair.",
      context: "Fast articulation of double 'Z' sounds.",
    },
    {
      id: 'tt-10',
      text: "The blue bluebird blinks beautifully.",
      context: "End strong with these explosive 'B' sounds!",
    },
  ],
  'emotion-acting': [
    {
      id: 'ea-1',
      text: "Look absolutely astonished!",
      context: "Gasps, wide eyes, hand on cheek - full surprise.",
    },
    {
      id: 'ea-2',
      text: "Deliver a classic, subtle side-eye glance.",
      context: "Keep your face blank and pan your eyes to the left suspiciously.",
    },
    {
      id: 'ea-3',
      text: "Say 'Oh, really?' with dripping sarcasm.",
      context: "Skeptical brow raise, slow head tilt, lingering tone.",
    },
    {
      id: 'ea-4',
      text: "Express deep deep sorrow of losing a precious donut.",
      context: "Frown, eyes squeezed shut, micro-grief.",
    },
    {
      id: 'ea-5',
      text: "Burst into standard, jolly Santa Claus laughter.",
      context: "Give a full, hearty 'Ho, Ho, Ho!' with a beaming smile.",
    },
    {
      id: 'ea-6',
      text: "Convey mysterious, spy-like suspicion.",
      context: "Squint slightly, glance over your shoulders rapidly.",
    },
    {
      id: 'ea-7',
      text: "Look incredibly proud of yourself.",
      context: "Chest out, chin raised high, a smug but happy grin.",
    },
    {
      id: 'ea-8',
      text: "Yee-haw! Celebrate winning a state lottery.",
      context: "Fist pump, wide grin, and shout 'Woohoo!'",
    },
    {
      id: 'ea-9',
      text: "Deliver a chilling 'villain laugh' in whisper mode.",
      context: "Lean toward the lens, soft manic grin, soft giggle.",
    },
    {
      id: 'ea-10',
      text: "Look extremely bored - yawn mid-sentence.",
      context: "Exhausted eyes, hand covering mouth as you start to yawn.",
    },
  ],
  'rapid-fire': [
    {
      id: 'rf-1',
      text: "What is 25 multiplied by 4? Speak it instantly!",
      context: "Immediate mental math. Don't look away from current frame.",
    },
    {
      id: 'rf-2',
      text: "Quick: Name the three primary colors!",
      context: "Say them as fast as humanly possible.",
    },
    {
      id: 'rf-3',
      text: "Complete the saying: 'Birds of a feather...'",
      context: "Slam-dunk the ending phrase with confidence.",
    },
    {
      id: 'rf-4',
      text: "What is the capital of France?",
      context: "No hesitation! Immediate response.",
    },
    {
      id: 'rf-5',
      text: "Say 'Hello' in 3 different languages!",
      context: "Example: Spanish, French, and Japanese.",
    },
    {
      id: 'rf-6',
      text: "Quickly spell the word 'COCOON' out loud.",
      context: "Rapid letter articulation.",
    },
    {
      id: 'rf-7',
      text: "Who was the first president of the United States?",
      context: "Say the name clearly in one breath.",
    },
    {
      id: 'rf-8',
      text: "Spell the word 'CLIMATE' backwards!",
      context: "Rapidly reverse the letters. (E-T-A-M-I-L-C)",
    },
    {
      id: 'rf-9',
      text: "Quick: Name 3 animals that start with 'K'!",
      context: "Kangaroo, Koala, Kingfisher...",
    },
    {
      id: 'rf-10',
      text: "How many hours are in 2 full days?",
      context: "Instantly state the calculation.",
    },
  ],
  'gestures': [
    {
      id: 'g-1',
      text: "Give a crisp military-style salute.",
      context: "Sharp right hand position at your brow, look confident.",
    },
    {
      id: 'g-2',
      text: "Trace an elegant heart outline in the air.",
      context: "Use index fingers to draw a symmetrical heart in the air.",
    },
    {
      id: 'g-3',
      text: "Perform perfect 'Rock on!' sign on both hands.",
      context: "Index and pinky fingers up, snap them in frame.",
    },
    {
      id: 'g-4',
      text: "Show a solid thumbs-up, then flip it down.",
      context: "Approval followed instantly by disapproval.",
    },
    {
      id: 'g-5',
      text: "Form an 'OK' sign over your right eye.",
      context: "Circled finger and thumb, look through it like a lens.",
    },
    {
      id: 'g-6',
      text: "Frame your face with a wide L-shape 'Camera' gesture.",
      context: "Both thumbs and forefingers forming a box around your face.",
    },
    {
      id: 'g-7',
      text: "Wink and give a friendly finger gun point.",
      context: "Directly point and lock eye contact.",
    },
    {
      id: 'g-8',
      text: "Cross your arms and make a super heroic pose.",
      context: "Sturdy chest, brave eyebrows, majestic nod.",
    },
    {
      id: 'g-9',
      text: "Make an hourglass figure outline using your palms.",
      context: "Smooth hand motion tracing curves vertically in front of you.",
    },
    {
      id: 'g-10',
      text: "Count '1, 2, 3' with your fingers very sharply.",
      context: "Index, middle, ring finger popping up in rhythm.",
    },
  ],
};
