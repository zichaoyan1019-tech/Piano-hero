import { UserProgress, Region } from './types';

export const INITIAL_PROGRESS: UserProgress = {
  completedLevels: [],
  inventory: [],
  unlockedLevels: ['level_1_1'],
  unlockedRegions: ['region_1']
};

export const GAME_DATA: { regions: Region[] } = {
  regions: [
    {
      id: 'region_1',
      name: 'Home Village',
      mapPosition: { x: 10, y: 88 },
      levels: [
        { 
          id: 'level_1_1', 
          name: 'First Steps',
          questions: [
            { text: 'A piano has 88 keys.', isTrue: true, explanation: 'Most modern pianos have 88 keys!' },
            { text: 'Middle C is the only C on the piano.', isTrue: false, explanation: 'There are many C notes!' }
          ],
          passingScorePercent: 50,
          teachingSlides: [
            { title: 'Welcome', content: 'Let us learn about the piano.', image: 'https://picsum.photos/seed/piano1/400/300' }
          ]
        },
        { 
          id: 'level_1_2', 
          name: 'Melody Basics',
          questions: [],
          passingScorePercent: 50
        },
        { 
          id: 'level_1_3', 
          name: 'Rhythm Practice',
          questions: [],
          passingScorePercent: 50
        },
        { 
          id: 'level_1_4', 
          name: 'Final Challenge',
          questions: [],
          passingScorePercent: 50
        }
      ]
    },
    {
      id: 'region_2',
      name: 'Mushroom Forest',
      mapPosition: { x: 34, y: 86.9 },
      levels: []
    },
    {
      id: 'region_3',
      name: 'Cactus Desert',
      mapPosition: { x: 30, y: 45 },
      levels: []
    },
    {
      id: 'region_4',
      name: 'Volcano',
      mapPosition: { x: 65, y: 80 },
      levels: []
    },
    {
      id: 'region_5',
      name: 'Snowy Peaks',
      mapPosition: { x: 70, y: 50 },
      levels: []
    },
    {
      id: 'region_6',
      name: 'Cloud Kingdom',
      mapPosition: { x: 90, y: 40 },
      levels: []
    },
    {
      id: 'region_7',
      name: 'Rainbow Bridge',
      mapPosition: { x: 62.5, y: 23.5 },
      levels: []
    }
  ]
};
