import { Battle } from './types';

export const mockBattles: Battle[] = [
  {
    id: '1',
    title: 'Array Masters Challenge',
    problemsCount: 3,
    difficulty: 'Medium',
    participants: 45,
    maxParticipants: 100,
    duration: '2 hours',
    creator: 'CodeWarrior',
    startTime: '2024-01-20 15:00',
    prizePool: '$500'
  },
  {
    id: '2',
    title: 'Dynamic Programming Duel',
    problemsCount: 4,
    difficulty: 'Hard',
    participants: 23,
    maxParticipants: 50,
    duration: '3 hours',
    creator: 'AlgoMaster',
    startTime: '2024-01-20 18:00',
    prizePool: '$1000'
  },
  {
    id: '3',
    title: 'Binary Search Blitz',
    problemsCount: 5,
    difficulty: 'Easy',
    participants: 78,
    maxParticipants: 150,
    duration: '1.5 hours',
    creator: 'SearchGuru',
    startTime: '2024-01-21 10:00'
  },
  {
    id: '4',
    title: 'Graph Theory Gauntlet',
    problemsCount: 3,
    difficulty: 'Hard',
    participants: 12,
    maxParticipants: 30,
    duration: '4 hours',
    creator: 'GraphNinja',
    startTime: '2024-01-21 14:00',
    prizePool: '$750'
  },
  {
    id: '5',
    title: 'String Manipulation Mayhem',
    problemsCount: 6,
    difficulty: 'Medium',
    participants: 56,
    maxParticipants: 120,
    duration: '2.5 hours',
    creator: 'StringSage',
    startTime: '2024-01-22 16:00'
  },
  {
    id: '6',
    title: 'Beginner Bootcamp',
    problemsCount: 4,
    difficulty: 'Easy',
    participants: 134,
    maxParticipants: 200,
    duration: '2 hours',
    creator: 'CodeCoach',
    startTime: '2024-01-22 12:00'
  }
];
