export interface Activity {
  id: string;
  nameKey: string;
  arasaacId: number;
}

export interface SavedTransition {
  id: string;
  firstId: string;
  thenId: string;
  createdAt: number;
}

export interface EmotionOption {
  id: string;
  nameKey: string;
  arasaacId: number;
  emoji: string;
  color: string;
}

export interface TransitionStoryStep {
  textKey: string;
  arasaacId: number;
}

export interface TransitionStory {
  id: string;
  titleKey: string;
  steps: TransitionStoryStep[];
}

export const ARASAAC_IDS = {
  first: 32745,
  then: 32749
} as const;

export const TIMER_PRESETS = [1, 3, 5, 10, 15] as const;

// These activities use motifs already checked against their ARASAAC labels.
export const ACTIVITIES: Activity[] = [
  { id: 'wake-up', nameKey: 'th.activity.wakeUp', arasaacId: 8989 },
  { id: 'get-dressed', nameKey: 'th.activity.getDressed', arasaacId: 6627 },
  { id: 'brush-teeth', nameKey: 'th.activity.brushTeeth', arasaacId: 2694 },
  { id: 'eat-breakfast', nameKey: 'th.activity.eatBreakfast', arasaacId: 4626 },
  { id: 'go-to-school', nameKey: 'th.activity.goToSchool', arasaacId: 32446 },
  { id: 'play', nameKey: 'th.activity.play', arasaacId: 23392 },
  { id: 'eat', nameKey: 'th.activity.eat', arasaacId: 4611 },
  { id: 'go-home', nameKey: 'th.activity.goHome', arasaacId: 29714 },
  { id: 'take-a-bath', nameKey: 'th.activity.takeBath', arasaacId: 2272 },
  { id: 'read', nameKey: 'th.activity.read', arasaacId: 7141 },
  { id: 'go-to-bed', nameKey: 'th.activity.goToBed', arasaacId: 6027 }
];

export const EMOTIONS: EmotionOption[] = [
  { id: 'happy', nameKey: 'th.emotion.happy', arasaacId: 35533, emoji: '🙂', color: '#3d7b56' },
  { id: 'sad', nameKey: 'th.emotion.sad', arasaacId: 35545, emoji: '😢', color: '#47768d' },
  { id: 'angry', nameKey: 'th.emotion.angry', arasaacId: 35539, emoji: '😠', color: '#a84f48' },
  { id: 'surprised', nameKey: 'th.emotion.surprised', arasaacId: 35529, emoji: '😮', color: '#81638c' }
];

export const TRANSITION_STORIES: TransitionStory[] = [
  {
    id: 'school',
    titleKey: 'th.story.school.title',
    steps: [
      { textKey: 'th.story.school.step1', arasaacId: 6627 },
      { textKey: 'th.story.school.step2', arasaacId: 4626 },
      { textKey: 'th.story.school.step3', arasaacId: 32446 }
    ]
  },
  {
    id: 'playground',
    titleKey: 'th.story.playground.title',
    steps: [
      { textKey: 'th.story.playground.step1', arasaacId: 23392 },
      { textKey: 'th.story.playground.step2', arasaacId: 22633 },
      { textKey: 'th.story.playground.step3', arasaacId: 29714 }
    ]
  },
  {
    id: 'bedtime',
    titleKey: 'th.story.bedtime.title',
    steps: [
      { textKey: 'th.story.bedtime.step1', arasaacId: 2272 },
      { textKey: 'th.story.bedtime.step2', arasaacId: 2694 },
      { textKey: 'th.story.bedtime.step3', arasaacId: 6027 }
    ]
  }
];

export function getArasaacUrl(id: number): string {
  return `https://static.arasaac.org/pictograms/${id}/${id}_500.png`;
}
