export enum Scene {
  COVER = 'COVER',
  INTRO = 'INTRO',
  VIDEO_INTRO = 'VIDEO_INTRO',
  WORLD_MAP = 'WORLD_MAP',
  REGION_MAP = 'REGION_MAP',
  LEVEL = 'LEVEL'
}

export interface UserProgress {
  completedLevels: string[];
  inventory: string[];
  unlockedLevels: string[];
  unlockedRegions: string[];
}

export interface Question {
  text: string;
  isTrue: boolean;
  explanation: string;
}

export interface TeachingSlide {
  title: string;
  content: string;
  image: string;
}

export interface LevelReward {
  icon: string;
  name: string;
}

export interface LevelConfig {
  id: string;
  name: string;
  questions: Question[];
  teachingSlides?: TeachingSlide[];
  passingScorePercent: number;
  reward?: LevelReward;
}

export interface Region {
  id: string;
  name: string;
  mapPosition: { x: number; y: number };
  levels: LevelConfig[]; // Updated to use LevelConfig
}
