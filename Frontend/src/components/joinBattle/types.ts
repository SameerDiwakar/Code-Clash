export interface Battle {
  id: string;
  title: string;
  problemsCount: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  participants: number;
  maxParticipants: number;
  duration: string;
  creator: string;
  startTime: string;
  prizePool?: string;
}
