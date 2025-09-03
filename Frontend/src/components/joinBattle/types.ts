export interface Battle {
  _id: string;
  id: string;
  title: string;
  description: string;
  problems: Array<{
    title: string;
    description: string;
    difficulty: string;
  }>;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  participants: string[];
  maxParticipants: number;
  status: 'Draft' | 'Scheduled' | 'Active' | 'Completed' | 'Cancelled';
  startTime: string;
  endTime?: string;
  duration: number;
  creator: {
    _id: string;
    username: string;
  };
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}
