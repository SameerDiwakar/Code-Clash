export type PresetExample = {
  input: string;
  output: string;
  explanation: string;
};

export type PresetTestCase = {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
};

export type PresetProblem = {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  constraints: string;
  examples: PresetExample[];
  testCases: PresetTestCase[];
  points: number;
};

export const problemPresets: PresetProblem[] = [
  {
    title: 'Two Sum',
    description:
      'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    difficulty: 'Easy',
    constraints:
      '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists',
    examples: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: '2 + 7 = 9' }],
    testCases: [
      { input: '2 7 11 15\n9', expectedOutput: '0 1', isHidden: false },
      { input: '3 2 4\n6', expectedOutput: '1 2', isHidden: true },
    ],
    points: 100,
  },
  {
    title: 'Valid Parentheses',
    description:
      'Given a string s containing just the characters ( ) { } [ ], determine if the input string is valid.',
    difficulty: 'Easy',
    constraints: '1 <= s.length <= 10^4',
    examples: [{ input: 's = "()[]{}"', output: 'true', explanation: 'All brackets closed in order' }],
    testCases: [
      { input: '()[]{}', expectedOutput: 'true', isHidden: false },
      { input: '(]', expectedOutput: 'false', isHidden: true },
    ],
    points: 100,
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    difficulty: 'Medium',
    constraints: '0 <= s.length <= 5 * 10^4',
    examples: [{ input: 's = "abcabcbb"', output: '3', explanation: 'abc' }],
    testCases: [
      { input: 'abcabcbb', expectedOutput: '3', isHidden: false },
      { input: 'bbbbb', expectedOutput: '1', isHidden: true },
    ],
    points: 150,
  },
  {
    title: 'Number of Islands',
    description:
      'Given a 2D grid map of 1s (land) and 0s (water), count the number of islands. Use DFS/BFS.',
    difficulty: 'Medium',
    constraints: '1 <= m, n <= 300',
    examples: [
      { input: 'grid = [[1,1,0],[1,0,0],[0,0,1]]', output: '2', explanation: 'Two separate islands' },
    ],
    testCases: [
      { input: '[[1,1,0],[1,0,0],[0,0,1]]', expectedOutput: '2', isHidden: false },
      { input: '[[0,0],[0,0]]', expectedOutput: '0', isHidden: true },
    ],
    points: 200,
  },
  {
    title: 'Merge Intervals',
    description: 'Given an array of intervals, merge all overlapping intervals.',
    difficulty: 'Medium',
    constraints: '1 <= intervals.length <= 10^4\n-10^9 <= start, end <= 10^9\nFor each interval [start,end], start <= end\nOutput must be a list of non-overlapping intervals sorted by start',
    examples: [{ input: '[[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]', explanation: 'Merge [1,3] and [2,6] -> [1,6]; others remain' }],
    testCases: [
      { input: '[[1,3],[2,6],[8,10],[15,18]]', expectedOutput: '[[1,6],[8,10],[15,18]]', isHidden: false },
      { input: '[[1,4],[4,5]]', expectedOutput: '[[1,5]]', isHidden: true },
    ],
    points: 180,
  },
  {
    title: 'Climbing Stairs',
    description: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can climb 1 or 2 steps.',
    difficulty: 'Easy',
    constraints: '1 <= n <= 45',
    examples: [{ input: 'n = 2', output: '2', explanation: '1+1, 2' }],
    testCases: [
      { input: '2', expectedOutput: '2', isHidden: false },
      { input: '3', expectedOutput: '3', isHidden: true },
    ],
    points: 80,
  },
  {
    title: 'Kth Largest Element in an Array',
    description: 'Find the kth largest element in an unsorted array.',
    difficulty: 'Medium',
    constraints: '1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9\n1 <= k <= nums.length\nOutput is a single integer: the kth largest value',
    examples: [{ input: 'nums = [3,2,1,5,6,4], k = 2', output: '5', explanation: 'Sorted desc -> [6,5,4,3,2,1], 2nd is 5' }],
    testCases: [
      { input: '3 2 1 5 6 4\n2', expectedOutput: '5', isHidden: false },
      { input: '3 2 3 1 2 4 5 5 6\n4', expectedOutput: '4', isHidden: true },
    ],
    points: 170,
  },
  {
    title: 'Coin Change',
    description: 'Given coins of different denominations and a total amount, compute the fewest coins needed.',
    difficulty: 'Medium',
    constraints: '1 <= amount <= 10^4\n1 <= coins.length <= 100\n1 <= coins[i] <= 10^4 (positive integers)\nIf amount cannot be formed, return -1',
    examples: [{ input: 'coins = [1,2,5], amount = 11', output: '3', explanation: 'Optimal: 5+5+1' }],
    testCases: [
      { input: '1 2 5\n11', expectedOutput: '3', isHidden: false },
      { input: '2\n3', expectedOutput: '-1', isHidden: true },
    ],
    points: 190,
  },
  {
    title: 'Binary Tree Level Order Traversal',
    description: 'Return the level order traversal of a binary tree nodes values.',
    difficulty: 'Medium',
    constraints: '0 <= nodes <= 10^4',
    examples: [{ input: '[3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]', explanation: '' }],
    testCases: [
      { input: '[3,9,20,null,null,15,7]', expectedOutput: '[[3],[9,20],[15,7]]', isHidden: false },
      { input: '[]', expectedOutput: '[]', isHidden: true },
    ],
    points: 160,
  },
  {
    title: 'Maximum Subarray',
    description: 'Find the contiguous subarray with the largest sum and return its sum.',
    difficulty: 'Easy',
    constraints: '1 <= nums.length <= 10^5',
    examples: [{ input: '[-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: '4 + (-1) + 2 + 1' }],
    testCases: [
      { input: '-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6', isHidden: false },
      { input: '1', expectedOutput: '1', isHidden: true },
    ],
    points: 120,
  },
  {
    title: 'LRU Cache',
    description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.',
    difficulty: 'Hard',
    constraints: 'Operations must be O(1) average time complexity',
    examples: [
      { input: 'put(1,1); put(2,2); get(1); put(3,3); get(2);', output: '1,-1', explanation: '' },
    ],
    testCases: [
      { input: 'ops=put(1,1),put(2,2),get(1),put(3,3),get(2)', expectedOutput: '1,-1', isHidden: false },
      { input: 'ops=put(2,1),put(1,1),put(2,3),put(4,1),get(1),get(2)', expectedOutput: '-1,3', isHidden: true },
    ],
    points: 250,
  },
];
