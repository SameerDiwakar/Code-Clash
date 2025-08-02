import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CodeEditor } from '@/components/index/CodeEditor';
import { 
  ArrowLeft, Clock, Trophy, User, CheckCircle, XCircle, 
  AlertCircle, Users, Eye 
} from 'lucide-react';
import SpectateBattleHeader from '@/components/spectate/SpectateBattleHeader';
import SpectateProblemPanel from '@/components/spectate/SpectateProblemPanel';
import SpectateSubmissionsPanel from '@/components/spectate/SpectateSubmissionsPanel';

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  inputSample: string;
  outputSample: string;
  constraints: string[];
}

interface Participant {
  id: string;
  username: string;
  avatar: string;
  code: string;
  language: string;
  submissionTime: string;
  verdict: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error' | 'Pending';
  executionTime?: string;
  memoryUsed?: string;
  testsPassed?: number;
  totalTests?: number;
}

interface BattleData {
  id: string;
  problem: Problem;
  participants: Participant[];
  status: 'ongoing' | 'completed';
  startTime: string;
  duration: number; // minutes
}

const mockBattleData: BattleData = {
  id: "battle-123",
  problem: {
    id: "two-sum",
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    difficulty: "Easy",
    inputSample: "nums = [2,7,11,15], target = 9",
    outputSample: "[0,1]",
    constraints: [
      "2 ≤ nums.length ≤ 10⁴",
      "-10⁹ ≤ nums[i] ≤ 10⁹", 
      "-10⁹ ≤ target ≤ 10⁹",
      "Only one valid answer exists."
    ]
  },
  participants: [
    {
      id: "user1",
      username: "codemaster99",
      avatar: "👨‍💻",
      code: `def two_sum(nums, target):
    hash_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in hash_map:
            return [hash_map[complement], i]
        hash_map[num] = i
    return []

# Test case
nums = [2, 7, 11, 15]
target = 9
result = two_sum(nums, target)
print(result)`,
      language: "python",
      submissionTime: "2 minutes ago",
      verdict: "Accepted",
      executionTime: "64ms",
      memoryUsed: "14.2MB",
      testsPassed: 57,
      totalTests: 57
    },
    {
      id: "user2", 
      username: "pythoninja",
      avatar: "🥷",
      code: `class Solution:
    def twoSum(self, nums, target):
        for i in range(len(nums)):
            for j in range(i + 1, len(nums)):
                if nums[i] + nums[j] == target:
                    return [i, j]
        return []

# Test
solution = Solution()
nums = [2, 7, 11, 15]
target = 9
print(solution.twoSum(nums, target))`,
      language: "python", 
      submissionTime: "5 minutes ago",
      verdict: "Time Limit Exceeded",
      executionTime: "> 2000ms",
      memoryUsed: "13.8MB",
      testsPassed: 45,
      totalTests: 57
    }
  ],
  status: "completed",
  startTime: "10 minutes ago",
  duration: 30
};

export const SpectateBattle = () => {
  const { battleId } = useParams();
  const [selectedParticipant, setSelectedParticipant] = useState(0);
  const battleData = mockBattleData; // In real app, fetch by battleId

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'Accepted':
        return 'text-green-400';
      case 'Wrong Answer':
      case 'Time Limit Exceeded':
      case 'Runtime Error':
        return 'text-red-400';
      case 'Pending':
        return 'text-yellow-400';
      default:
        return 'text-muted-foreground';
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'Accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'Wrong Answer':
      case 'Time Limit Exceeded':
      case 'Runtime Error':
        return <XCircle className="h-4 w-4" />;
      case 'Pending':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.03%22%3E%3Ccircle%20cx=%2230%22%20cy=%2230%22%20r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] animate-pulse"></div>

      <main className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <SpectateBattleHeader battleData={battleData} />
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* Problem Panel */}
          <SpectateProblemPanel problem={battleData.problem} />
          {/* Code Viewer Panel */}
          <SpectateSubmissionsPanel
            participants={battleData.participants}
            selectedParticipant={selectedParticipant}
            setSelectedParticipant={setSelectedParticipant}
            getVerdictColor={getVerdictColor}
            getVerdictIcon={getVerdictIcon}
          />
        </div>
      </main>
    </div>
  );
};