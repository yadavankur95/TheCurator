import { BirthdayQuote, EventPreset, EventType } from '../types';

export const EVENT_PRESETS: EventPreset[] = [
  {
    id: 'mother-daughter-birthday',
    title: 'Mother & Daughter Shared Birthday',
    shortName: 'Shared Birthday',
    badge: 'Two Birthdays · One Date',
    defaultTitle: 'Two Birthdays, One Beautiful Story',
    defaultSubtitle: 'Celebrating Mom & Daughter sharing the same magical day',
    accentColor: '#b89047',
    description: 'Special tribute for a mother and daughter who share the exact same birthday.',
  },
  {
    id: 'milestone-birthday',
    title: 'Milestone Birthday Celebration',
    shortName: 'Milestone Bday',
    badge: 'Golden Milestone',
    defaultTitle: 'A Life of Grace, Laughter & Milestones',
    defaultSubtitle: 'Celebrating an extraordinary journey and looking forward to many more',
    accentColor: '#d97706',
    description: 'Perfect for 18th, 21st, 30th, 40th, 50th, 60th, and 75th milestone birthdays.',
  },
  {
    id: 'daughter-birthday',
    title: "Daughter's Birthday Celebration",
    shortName: "Daughter's Bday",
    badge: 'Our Sweet Sunshine',
    defaultTitle: 'Watching You Bloom Into Pure Grace',
    defaultSubtitle: 'Every year with you has been life’s sweetest blessing',
    accentColor: '#e11d48',
    description: 'Heartwarming memories celebrating a daughter’s growth, smiles, and dreams.',
  },
  {
    id: 'family-celebration',
    title: 'Family Gathering & Heritage',
    shortName: 'Family Reunion',
    badge: 'Generations of Love',
    defaultTitle: 'The Roots & Wings of Our Family',
    defaultSubtitle: 'Tied by blood, bounded by love, preserved in cherished memories',
    accentColor: '#059669',
    description: 'Celebrating multi-generational family bonds, holidays, and celebrations.',
  },
  {
    id: 'anniversary-love',
    title: 'Anniversary & Romantic Journey',
    shortName: 'Anniversary',
    badge: 'Endless Love Story',
    defaultTitle: 'Two Souls, One Timeless Romance',
    defaultSubtitle: 'Celebrating years of unconditional love, hand-in-hand',
    accentColor: '#db2777',
    description: 'Commemorating wedding anniversaries, dating milestones, and lifelong partnerships.',
  },
  {
    id: 'best-friends',
    title: 'Best Friends & Adventures',
    shortName: 'Best Friends',
    badge: 'Soul Sisters / Brothers',
    defaultTitle: 'Through Every Laugh, Trip & Adventure',
    defaultSubtitle: 'To the one who knows all my stories because they lived them with me',
    accentColor: '#7c3aed',
    description: 'Tribute to lifelong friendships, road trips, secret smiles, and endless laughter.',
  },
  {
    id: 'baby-first-year',
    title: "Baby's First Year & Milestones",
    shortName: 'Baby Year One',
    badge: 'Sweet New Beginning',
    defaultTitle: '365 Days of Pure Wonder',
    defaultSubtitle: 'Tiny hands, big steps, and a lifetime of love just beginning',
    accentColor: '#0284c7',
    description: 'Newborns, first steps, baby showers, and the magical first year of life.',
  },
];

export const MOTHER_DAUGHTER_QUOTES: BirthdayQuote[] = [
  // --- ORIGINAL QUOTES (Retained exactly as requested) ---
  {
    id: 'orig-1',
    text: 'Two Birthdays,\nOne Beautiful Story',
    category: 'shared-birthday',
    isOriginal: true,
  },
  {
    id: 'orig-2',
    text: 'The joy of growing together.',
    category: 'growing-together',
    isOriginal: true,
  },
  {
    id: 'orig-3',
    text: 'One date. Two birthdays.\nCountless memories.',
    category: 'shared-birthday',
    isOriginal: true,
  },
  {
    id: 'orig-4',
    text: 'The little details we will always remember.',
    category: 'growing-together',
    isOriginal: true,
  },
  {
    id: 'orig-5',
    text: 'Watching you grow has been the greatest gift.',
    category: 'mother-love',
    isOriginal: true,
  },
  {
    id: 'orig-6',
    text: 'Happy Birthday to my two favourite people.',
    category: 'wishes',
    isOriginal: true,
  },

  // --- NEW CURATED MOTHER & DAUGHTER SHARED BIRTHDAY QUOTES ---
  {
    id: 'shared-1',
    text: 'Born on the same calendar page, bound forever by the deepest love.',
    author: 'Heartfelt Tribute',
    category: 'shared-birthday',
  },
  {
    id: 'shared-2',
    text: 'The greatest birthday gift a mother ever received was the day you were born on hers.',
    author: 'A Mother’s Heart',
    category: 'shared-birthday',
  },
  {
    id: 'shared-3',
    text: 'Two candles on one cake, two generations of pure magic.',
    author: 'Celebration of Us',
    category: 'shared-birthday',
  },
  {
    id: 'shared-4',
    text: 'Double the wishes, double the grace, celebrating two radiant souls sharing one date.',
    author: 'Birthday Blessing',
    category: 'shared-birthday',
  },
  {
    id: 'shared-5',
    text: 'A daughter is a mother’s sweetest reflection, born on the day love multiplied.',
    author: 'Infinite Bond',
    category: 'daughter-light',
  },
  {
    id: 'shared-6',
    text: 'Like mother, like daughter—two hearts beating to the exact same birthday melody.',
    author: 'Family Harmony',
    category: 'shared-birthday',
  },
  {
    id: 'shared-7',
    text: 'From your very first breath on our shared day, every birthday became twice as magical.',
    author: 'Mother & Daughter Journey',
    category: 'mother-love',
  },
  {
    id: 'shared-8',
    text: 'Side by side or miles apart, we share the same heartbeat and the same special day.',
    author: 'Eternal Connection',
    category: 'growing-together',
  },
  {
    id: 'shared-9',
    text: 'Two birthday queens sharing one crown of laughter, beauty, and boundless joy.',
    author: 'Royal Bond',
    category: 'wishes',
  },
  {
    id: 'shared-10',
    text: 'Every year, the universe reminds us how deeply our destinies were written together.',
    author: 'Written in the Stars',
    category: 'shared-birthday',
  },
  {
    id: 'shared-11',
    text: 'You didn’t just share my birthday; you made every birthday for the rest of my life unforgettable.',
    author: 'Mother to Daughter',
    category: 'mother-love',
  },
  {
    id: 'shared-12',
    text: 'Laughter passed down, courage shared, and matching birthday wishes made upon the stars.',
    author: 'Shared Heritage',
    category: 'growing-together',
  },
  {
    id: 'shared-13',
    text: 'In your eyes I see my yesterday, in your smile I see our tomorrow.',
    author: 'Generations of Love',
    category: 'mother-love',
  },
  {
    id: 'shared-14',
    text: 'A mother holds her daughter’s hand for a little while, but her heart—and her birthday—for a lifetime.',
    author: 'Timeless Grace',
    category: 'daughter-light',
  },
  {
    id: 'shared-15',
    text: 'May our shared day always overflow with laughter that echoes and love that never fades.',
    author: 'Shared Birthday Wish',
    category: 'wishes',
  },
];

export const MILESTONE_BIRTHDAY_QUOTES: BirthdayQuote[] = [
  { id: 'ms-1', text: 'Count your age by friends, not years. Count your life by smiles, not tears.', author: 'John Lennon', category: 'milestones' },
  { id: 'ms-2', text: 'May you live all the days of your life with passion, purpose, and deep joy.', author: 'Jonathan Swift', category: 'wishes' },
  { id: 'ms-3', text: 'The secret of staying young is to live honestly, eat slowly, and lie about your age.', author: 'Lucille Ball', category: 'milestones' },
  { id: 'ms-4', text: 'Wrinkles should merely indicate where the smiles have been.', author: 'Mark Twain', category: 'milestones' },
  { id: 'ms-5', text: 'Here’s to another year of radiating wisdom, kindness, and unforgettable laughter.', author: 'Milestone Tribute', category: 'wishes' },
  { id: 'ms-6', text: 'You are never too old to set another goal or to dream a new dream.', author: 'C.S. Lewis', category: 'milestones' },
  { id: 'ms-7', text: 'A milestone is not a measure of how far we have come, but a celebration of every smile along the way.', author: 'Golden Years', category: 'milestones' },
];

export const DAUGHTER_BIRTHDAY_QUOTES: BirthdayQuote[] = [
  { id: 'd-1', text: 'To my dearest daughter, watching you grow is the greatest masterpiece of my life.', author: 'Parental Love', category: 'daughter-light' },
  { id: 'd-2', text: 'May your birthday shine as brightly as your smile and sparkle like your laughter.', author: 'Sweet Wishes', category: 'wishes' },
  { id: 'd-3', text: 'You are braver than you believe, stronger than you seem, and loved more than you know.', author: 'A.A. Milne', category: 'daughter-light' },
  { id: 'd-4', text: 'A daughter is a bundle of firsts that excite and delight, giggles from deep inside, and pure love.', author: 'Family Warmth', category: 'daughter-light' },
  { id: 'd-5', text: 'Always remember: you are capable of achieving everything your beautiful heart desires.', author: 'Birthday Blessing', category: 'wishes' },
];

export const FAMILY_CELEBRATION_QUOTES: BirthdayQuote[] = [
  { id: 'fam-1', text: 'Family is where life begins and love never ends.', author: 'Family Heritage', category: 'growing-together' },
  { id: 'fam-2', text: 'In family life, love is the oil that eases friction and the music that brings harmony.', author: 'Friedrich Nietzsche', category: 'growing-together' },
  { id: 'fam-3', text: 'The happiest moments of my life have been passed in the warm bosom of my family.', author: 'Thomas Jefferson', category: 'growing-together' },
  { id: 'fam-4', text: 'Generations of laughter, stories around the dinner table, and hugs that heal everything.', author: 'Family Album', category: 'milestones' },
  { id: 'fam-5', text: 'Together is our absolute favorite place to be.', author: 'Cherished Moments', category: 'wishes' },
];

export const ANNIVERSARY_QUOTES: BirthdayQuote[] = [
  { id: 'ann-1', text: 'The best thing to hold onto in life is each other.', author: 'Audrey Hepburn', category: 'growing-together' },
  { id: 'ann-2', text: 'I love you not only for what you are, but for what I am when I am with you.', author: 'Roy Croft', category: 'shared-birthday' },
  { id: 'ann-3', text: 'In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine.', author: 'Maya Angelou', category: 'wishes' },
  { id: 'ann-4', text: 'Grow old along with me! The best is yet to be.', author: 'Robert Browning', category: 'wishes' },
];

export const BEST_FRIENDS_QUOTES: BirthdayQuote[] = [
  { id: 'bf-1', text: 'A real friend is one who walks in when the rest of the world walks out.', author: 'Walter Winchell', category: 'growing-together' },
  { id: 'bf-2', text: 'True friends are like diamonds—bright, beautiful, valuable, and always in style.', author: 'Nicole Richie', category: 'milestones' },
  { id: 'bf-3', text: 'Here’s to the nights that turned into mornings with the friend that turned into family.', author: 'Unbreakable Bond', category: 'wishes' },
  { id: 'bf-4', text: 'We didn’t realize we were making memories; we just knew we were having fun.', author: 'Winnie the Pooh', category: 'growing-together' },
];

export const BABY_FIRST_YEAR_QUOTES: BirthdayQuote[] = [
  { id: 'bb-1', text: 'Ten tiny fingers, ten tiny toes, endless giggles, and a heart full of love.', author: 'Baby Wonder', category: 'milestones' },
  { id: 'bb-2', text: 'The littlest feet make the biggest footprints in our hearts.', author: 'First Year Miracle', category: 'milestones' },
  { id: 'bb-3', text: '365 days of cuddles, sweet firsts, and watching you discover the world.', author: 'Parent’s Diary', category: 'wishes' },
  { id: 'bb-4', text: 'May your life be full of sunshine, warm laughter, and endless wonder.', author: 'First Birthday Wish', category: 'wishes' },
];

export function getQuotesForEvent(eventType: EventType = 'mother-daughter-birthday'): BirthdayQuote[] {
  switch (eventType) {
    case 'milestone-birthday':
      return [...MILESTONE_BIRTHDAY_QUOTES, ...MOTHER_DAUGHTER_QUOTES];
    case 'daughter-birthday':
      return [...DAUGHTER_BIRTHDAY_QUOTES, ...MOTHER_DAUGHTER_QUOTES];
    case 'family-celebration':
      return [...FAMILY_CELEBRATION_QUOTES, ...MOTHER_DAUGHTER_QUOTES];
    case 'anniversary-love':
      return [...ANNIVERSARY_QUOTES, ...MOTHER_DAUGHTER_QUOTES];
    case 'best-friends':
      return [...BEST_FRIENDS_QUOTES, ...MOTHER_DAUGHTER_QUOTES];
    case 'baby-first-year':
      return [...BABY_FIRST_YEAR_QUOTES, ...MOTHER_DAUGHTER_QUOTES];
    case 'mother-daughter-birthday':
    default:
      return MOTHER_DAUGHTER_QUOTES;
  }
}

export function getEventPreset(eventType: EventType = 'mother-daughter-birthday'): EventPreset {
  return EVENT_PRESETS.find((e) => e.id === eventType) || EVENT_PRESETS[0];
}

export function getQuotesByCategory(category?: string, eventType: EventType = 'mother-daughter-birthday'): BirthdayQuote[] {
  const pool = getQuotesForEvent(eventType);
  if (!category || category === 'all') return pool;
  return pool.filter((q) => q.category === category);
}

export function getRandomMotherDaughterQuote(seed = 0): BirthdayQuote {
  const index = Math.abs(seed) % MOTHER_DAUGHTER_QUOTES.length;
  return MOTHER_DAUGHTER_QUOTES[index];
}

export async function fetchOnlineBirthdayQuotes(keyword = 'birthday inspiration'): Promise<BirthdayQuote[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const onlinePool: BirthdayQuote[] = [
    {
      id: `online-${Date.now()}-1`,
      text: 'To love and be loved is to feel the sun from both sides.',
      author: 'David Viscott',
      category: 'growing-together',
    },
    {
      id: `online-${Date.now()}-2`,
      text: 'Because on this day, the world became infinitely brighter and sweeter.',
      author: 'Celebration Anthology',
      category: 'wishes',
    },
    {
      id: `online-${Date.now()}-3`,
      text: 'May every candle on your cake bring a wish fulfilled and a dream come true.',
      author: 'Timeless Blessings',
      category: 'wishes',
    },
  ];

  return onlinePool;
}
