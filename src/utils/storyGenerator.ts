import { Chapter, EventType, Layout, MediaItem, MemoryStory, Scene, ThemeStyle } from '../types';
import { getEventPreset, getQuotesForEvent } from '../data/quotes';

/** Shuffle an array in‑place using Fisher–Yates and return the shuffled copy. */
function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}


interface StoryGenerationOptions {
  theme?: ThemeStyle;
  eventType?: EventType;
  variation?: number;
  motherName?: string;
  daughterName?: string;
  sharedDate?: string;
}

const CHAPTER_THEMES: Record<EventType, { title: string; subtitle: string; description: string }[]> = {
  'mother-daughter-birthday': [
    { title: 'Prologue: Two Birthdays, One Bond', subtitle: 'Where one date holds two miracles.', description: 'Celebrating the incredible coincidence and destiny of mother and daughter sharing the same special day.' },
    { title: 'Golden Moments & Sweet Smiles', subtitle: 'Laughter passed down through the years.', description: 'The tender smiles, quiet embraces, and sunshine moments that defined our journey.' },
    { title: 'Living Color & Shared Adventures', subtitle: 'Every step taken together is a memory kept forever.', description: 'Trips, celebrations, and outdoor wonders filled with bright energy.' },
    { title: 'Living Memories & Video Highlights', subtitle: 'The movement, laughter, and voices we cherish.', description: 'Cherished moments caught on video that bring the magic to life.' },
    { title: 'The Joy of Growing Together', subtitle: 'Watching you bloom into grace and beauty.', description: 'Witnessing each milestone, achievement, and gentle triumph side by side.' },
    { title: 'Grand Finale: Double the Wishes', subtitle: 'Happy Birthday to our two favourite queens.', description: 'Looking forward to countless more candles, shared cakes, and cherished years.' },
  ],
  'milestone-birthday': [
    { title: 'Prologue: The Journey of a Lifetime', subtitle: 'Celebrating years of strength, joy, and wisdom.', description: 'Honoring the milestones, lessons, and radiant light brought to everyone around.' },
    { title: 'Golden Chapters & Classic Smiles', subtitle: 'Every year added another layer of beauty.', description: 'Memories of timeless grace, achievements, and hearty laughs.' },
    { title: 'Living Memories & Toasts', subtitle: 'Moving moments that defined who we are.', description: 'Video highlights capturing the voice, laughter, and heart of the celebrant.' },
    { title: 'Surrounded by Love & Family', subtitle: 'The lives you have touched along the way.', description: 'Moments with friends, family, and loved ones who cherish you deeply.' },
    { title: 'Grand Finale: Cheers to the Next Chapter', subtitle: 'Wishing you endless health, joy, and peace.', description: 'Looking forward to all the bright adventures still waiting ahead.' },
  ],
  'daughter-birthday': [
    { title: 'Prologue: Our Brightest Star', subtitle: 'From your first smile to today.', description: 'Celebrating our sweetest daughter and the pure sunshine she brings into our world.' },
    { title: 'Sweet Innocence & Wonder Years', subtitle: 'Watching you grow has been our greatest gift.', description: 'Little footsteps, joyful giggles, and innocent discoveries.' },
    { title: 'Living Memories & Living Light', subtitle: 'Videos of laughter and spontaneous joy.', description: 'Memories in motion that capture her sparkling personality.' },
    { title: 'Blooming Into Grace', subtitle: 'Kind, brave, and infinitely loved.', description: 'Cherishing her accomplishments, dreams, and gentle heart.' },
    { title: 'Grand Finale: May All Your Dreams Come True', subtitle: 'Happy Birthday to our precious daughter.', description: 'Wishes for a magnificent year filled with love, laughter, and success.' },
  ],
  'family-celebration': [
    { title: 'Prologue: Roots & Wings', subtitle: 'The eternal bond of family.', description: 'Gathered together to celebrate history, heritage, and unconditional connection.' },
    { title: 'Generations of Smiles', subtitle: 'Laughter around the dinner table.', description: 'Warm hugs, holidays, reunions, and everyday magic.' },
    { title: 'Living Memories in Color', subtitle: 'The sounds and movements of our home.', description: 'Home videos and candid celebrations preserved forever.' },
    { title: 'Together Through Every Season', subtitle: 'Always side-by-side.', description: 'Supporting one another and growing closer with every passing year.' },
    { title: 'Grand Finale: Blessings on Our Family', subtitle: 'Forever connected by love.', description: 'Cheers to many more reunions, shared meals, and happy milestones.' },
  ],
  'anniversary-love': [
    { title: 'Prologue: Two Hearts, One Journey', subtitle: 'Celebrating the romance that grows with time.', description: 'From the first spark to a lifetime of partnership and mutual devotion.' },
    { title: 'Hand in Hand Through the Years', subtitle: 'Building our sweetest dreams together.', description: 'Adventures, quiet evenings, shared triumphs, and unwavering love.' },
    { title: 'Living Memories of Romance', subtitle: 'Dances, smiles, and loving whispers in motion.', description: 'Living footage celebrating our favorite days together.' },
    { title: 'Grand Finale: Forever & Always', subtitle: 'Cheers to our eternal love story.', description: 'Wishes for countless more years of romance, laughter, and peace.' },
  ],
  'best-friends': [
    { title: 'Prologue: Partners in Adventure', subtitle: 'To the one who was there through it all.', description: 'Celebrating an unbreakable friendship filled with stories only we understand.' },
    { title: 'Crazy Days & Midnight Laughs', subtitle: 'Making memories we will talk about when we are 90.', description: 'Road trips, candid pictures, silly dances, and secret jokes.' },
    { title: 'Living Highlights & Video Shenanigans', subtitle: 'Movement and loud laughter caught on camera.', description: 'Our favorite moments in action that prove friendship is life’s greatest gift.' },
    { title: 'Grand Finale: Forever My Best Friend', subtitle: 'Happy Birthday to my favorite partner in crime.', description: 'Cheers to a lifetime of more spontaneous trips and endless fun.' },
  ],
  'baby-first-year': [
    { title: 'Prologue: Welcome to the World, Little Miracle', subtitle: '365 days of unconditional love.', description: 'The precious beginning of a lifetime of wonder and warmth.' },
    { title: 'Tiny Hands & Sweet Firsts', subtitle: 'First smiles, first rolls, and first giggles.', description: 'Every single month brought a brand new surprise and joyous discovery.' },
    { title: 'Living Video Firsts', subtitle: 'First baby steps and cheerful babbling.', description: 'Living video memories of the most magical year of growth.' },
    { title: 'Grand Finale: Happy 1st Birthday Sweet Baby', subtitle: 'May your future be as bright as your eyes.', description: 'Wishes of endless health, love, and sweet adventures.' },
  ],
};

export function generateComprehensiveStory(
  mediaList: MediaItem[],
  options: StoryGenerationOptions = {}
): MemoryStory {
  const {
    theme = 'Birthday',
    eventType = 'mother-daughter-birthday',
    variation = 0,
    motherName = 'Mom',
    daughterName = 'Daughter',
    sharedDate = 'Every Special Year',
  } = options;

  const eventPreset = getEventPreset(eventType);
  const chapterThemeList = CHAPTER_THEMES[eventType] || CHAPTER_THEMES['mother-daughter-birthday'];

  if (!mediaList || mediaList.length === 0) {
    return {
      title: eventPreset.defaultTitle,
      subtitle: eventPreset.defaultSubtitle,
      theme,
      eventType,
      motherName,
      daughterName,
      sharedDate,
      sections: ['Opening', 'Ending'],
      chapters: [],
      scenes: [],
      totalMediaCount: 0,
      totalDurationSeconds: 0,
    };
  }

  // Filter selected media (or all if none specifically marked)
  const availableMedia = mediaList.filter((m) => m.selected !== false);
  const mediaToUse = availableMedia.length > 0 ? availableMedia : mediaList;

  // Quotes pool for selected event (shuffled for random assignment)
  const quotesPool = shuffleArray(getQuotesForEvent(eventType));

  const scenes: Scene[] = [];
  let mediaPointer = 0;
  let quoteIndex = 0;

  const getNextQuote = () => {
    const quote = quotesPool[(quoteIndex + variation) % quotesPool.length];
    quoteIndex++;
    return quote;
  };

  // 1. OPENING SCENE (Always uses 1 premier media item)
  const openingMedia = mediaToUse[0];
  scenes.push({
    id: `scene-opening-${variation}`,
    layout: 'opening',
    media: [openingMedia],
    chapterTitle: chapterThemeList[0]?.title || 'Prologue',
    text: eventPreset.defaultTitle.includes('\n') ? eventPreset.defaultTitle : eventPreset.defaultTitle.replace(', ', ',\n'),
    subtitle: eventPreset.defaultSubtitle,
    date: openingMedia.date || 'The Most Special Day',
    duration: openingMedia.duration ? Math.max(7000, openingMedia.duration * 1000) : 7000,
  });
  mediaPointer = 1;

  // 2. Iterate through all remaining media items, chunking them into diverse artistic layouts
  // Layout patterns cycle to keep the video/story dynamic and aesthetically pleasing
  const layoutCycle: Layout[] = ['pair', 'quote', 'video-focus', 'collage', 'full', 'trio', 'portrait', 'mosaic'];
  let cycleIdx = variation % layoutCycle.length;

  while (mediaPointer < mediaToUse.length) {
    const remainingCount = mediaToUse.length - mediaPointer;

    // If only 1 item remains and we are near the end, save it for ending or make a full scene
    if (remainingCount === 1) {
      const single = mediaToUse[mediaPointer];
      scenes.push({
        id: `scene-${scenes.length}-${variation}`,
        layout: single.type === 'video' ? 'video-focus' : 'portrait',
        media: [single],
        text: getNextQuote().text,
        date: single.date,
        duration: single.duration ? Math.max(6500, single.duration * 1000) : 6500,
      });
      mediaPointer += 1;
      break;
    }

    const nextMedia = mediaToUse[mediaPointer];

    // Priority for video items: give videos dedicated or paired layouts
    if (nextMedia.type === 'video') {
      const videoDurationMs = nextMedia.duration ? Math.max(6000, nextMedia.duration * 1000) : 7500;
      scenes.push({
        id: `scene-video-${scenes.length}-${variation}`,
        layout: 'video-focus',
        media: [nextMedia],
        text: getNextQuote().text,
        caption: nextMedia.name || 'Living Memories in Motion',
        date: nextMedia.date,
        duration: videoDurationMs,
      });
      mediaPointer += 1;
      continue;
    }

    // Determine layout for current chunk
    const layout = layoutCycle[cycleIdx % layoutCycle.length];
    cycleIdx++;

    switch (layout) {
      case 'pair': {
        const count = Math.min(2, remainingCount);
        const chunk = mediaToUse.slice(mediaPointer, mediaPointer + count);
        scenes.push({
          id: `scene-pair-${scenes.length}-${variation}`,
          layout: 'pair',
          media: chunk,
          caption: getNextQuote().text,
          duration: 6500,
        });
        mediaPointer += count;
        break;
      }

      case 'quote': {
        const quoteObj = getNextQuote();
        const single = mediaToUse[mediaPointer];
        scenes.push({
          id: `scene-quote-${scenes.length}-${variation}`,
          layout: 'quote',
          media: [single],
          text: quoteObj.text,
          quoteAuthor: quoteObj.author,
          duration: 6500,
        });
        mediaPointer += 1;
        break;
      }

      case 'trio': {
        const count = Math.min(3, remainingCount);
        const chunk = mediaToUse.slice(mediaPointer, mediaPointer + count);
        scenes.push({
          id: `scene-trio-${scenes.length}-${variation}`,
          layout: count === 3 ? 'trio' : count === 2 ? 'pair' : 'full',
          media: chunk,
          caption: 'Shared laughter and timeless moments.',
          duration: 7000,
        });
        mediaPointer += count;
        break;
      }

      case 'collage': {
        const count = Math.min(4, remainingCount);
        const chunk = mediaToUse.slice(mediaPointer, mediaPointer + count);
        scenes.push({
          id: `scene-collage-${scenes.length}-${variation}`,
          layout: count >= 3 ? 'collage' : 'pair',
          media: chunk,
          caption: 'The little details we will always remember.',
          duration: 7500,
        });
        mediaPointer += count;
        break;
      }

      case 'mosaic': {
        // Great when handling 50-120+ media items
        const count = Math.min(6, remainingCount);
        const chunk = mediaToUse.slice(mediaPointer, mediaPointer + count);
        scenes.push({
          id: `scene-mosaic-${scenes.length}-${variation}`,
          layout: count >= 5 ? 'mosaic' : 'collage',
          media: chunk,
          caption: 'A tapestry of love, growth, and double celebrations.',
          duration: 8000,
        });
        mediaPointer += count;
        break;
      }

      case 'portrait': {
        const single = mediaToUse[mediaPointer];
        scenes.push({
          id: `scene-portrait-${scenes.length}-${variation}`,
          layout: 'portrait',
          media: [single],
          text: getNextQuote().text,
          duration: 6000,
        });
        mediaPointer += 1;
        break;
      }

      case 'full':
      default: {
        const single = mediaToUse[mediaPointer];
        scenes.push({
          id: `scene-full-${scenes.length}-${variation}`,
          layout: 'full',
          media: [single],
          date: single.date,
          text: '',
          duration: 6000,
        });
        mediaPointer += 1;
        break;
      }
    }
  }

  // 3. FINALE SCENE
  // Pick a high quality media item for the ending
  const endingMedia = mediaToUse[mediaToUse.length - 1] || mediaToUse[0];
  const lastChapter = chapterThemeList[chapterThemeList.length - 1];
  scenes.push({
    id: `scene-ending-${variation}`,
    layout: 'ending',
    media: [endingMedia],
    chapterTitle: lastChapter?.title || 'Grand Finale',
    text: eventType === 'mother-daughter-birthday' ? 'Happy Birthday to my two favourite people.' : 'Wishing you a magnificent celebration and endless love.',
    subtitle: eventPreset.defaultSubtitle,
    duration: 8500,
  });

  // 4. GROUP SCENES INTO CHAPTERS FOR INTERACTIVE TIMELINE / WEBSITE
  const chapterCount = Math.min(chapterThemeList.length, Math.max(3, Math.ceil(scenes.length / 3)));
  const scenesPerChapter = Math.ceil(scenes.length / chapterCount);

  const chapters: Chapter[] = [];
  for (let i = 0; i < chapterCount; i++) {
    const chapterTheme = chapterThemeList[i % chapterThemeList.length];
    const chapterScenes = scenes.slice(i * scenesPerChapter, (i + 1) * scenesPerChapter);
    if (chapterScenes.length > 0) {
      // tag scenes with chapter title
      chapterScenes.forEach((s) => {
        if (!s.chapterTitle) s.chapterTitle = chapterTheme.title;
      });

      const mediaCountInChapter = chapterScenes.reduce((acc, sc) => acc + sc.media.length, 0);

      chapters.push({
        id: `chapter-${i + 1}`,
        title: chapterTheme.title,
        subtitle: chapterTheme.subtitle,
        description: chapterTheme.description,
        scenes: chapterScenes,
        mediaCount: mediaCountInChapter,
      });
    }
  }

  const totalDurationMs = scenes.reduce((acc, s) => acc + s.duration, 0);
  const sectionsList = chapters.map((c) => c.title.split(':')[0].trim());

  return {
    title: eventPreset.defaultTitle,
    subtitle: `${eventPreset.defaultSubtitle} · ${mediaToUse.length} Treasured Moments`,
    theme,
    eventType,
    motherName,
    daughterName,
    sharedDate,
    sections: sectionsList,
    chapters,
    scenes,
    totalMediaCount: mediaToUse.length,
    totalDurationSeconds: Math.round(totalDurationMs / 1000),
  };
}
