# Judge0 API Setup Guide

## Overview
The Code Clash battle system now uses Judge0 API for LeetCode-style code judging with detailed test case results, execution time, and memory usage tracking.

## Setup Instructions

### 1. Get Judge0 API Key
1. Visit [RapidAPI Judge0 CE](https://rapidapi.com/judge0-official/api/judge0-ce/)
2. Sign up for a RapidAPI account if you don't have one
3. Subscribe to the Judge0 CE API (free tier available)
4. Copy your RapidAPI key from the dashboard

### 2. Configure Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update your `.env` file with your Judge0 API key:
   ```env
   JUDGE0_BASE_URL=https://judge0-ce.p.rapidapi.com
   JUDGE0_API_KEY=your-actual-rapidapi-key-here
   ```

### 3. Install Dependencies
Make sure you have `node-fetch` installed (if using Node.js < 18):
```bash
npm install node-fetch
```

## Features

### LeetCode-Style Judging
- **Per-case verdicts**: Each test case shows individual status (Accepted, Wrong Answer, etc.)
- **Execution metrics**: Time and memory usage for each test case
- **Error handling**: Compilation errors, runtime errors, time limit exceeded
- **Hidden test cases**: Inputs/outputs hidden for failed hidden cases
- **First failed case highlighting**: Quick debugging assistance

### Supported Languages
- Python 3 (ID: 71)
- JavaScript/Node.js (ID: 63)
- TypeScript (ID: 74)
- C++ (ID: 54)
- C (ID: 50)
- Java (ID: 62)
- Go (ID: 60)
- Rust (ID: 73)
- PHP (ID: 68)
- Ruby (ID: 72)
- C# (ID: 51)

### API Response Structure
```json
{
  "verdict": "Wrong Answer",
  "totalCases": 3,
  "passed": 1,
  "failed": 2,
  "totalTime": 0.045,
  "peakMemory": 3584,
  "compilationError": false,
  "firstFailedCase": {
    "caseNumber": 2,
    "status": "Wrong Answer",
    "input": "5 3",
    "expectedOutput": "8",
    "actualOutput": "2"
  },
  "testCaseResults": [...]
}
```

## Testing

### 1. Create a Battle with Test Cases
Make sure your battle problems have test cases with:
- `input`: String input for the test case
- `expectedOutput`: Expected output string
- `hidden`: Boolean (optional, defaults to false)

### 2. Submit Code
Use the battle submission endpoint:
```
POST /api/battles/:battleId/problems/:problemId/submit
{
  "code": "def solution():\n    return 'Hello World'",
  "language": "python3"
}
```

### 3. Check Results
The response will include detailed judging results with per-case verdicts.

## Troubleshooting

### Common Issues
1. **API Key Invalid**: Verify your RapidAPI key is correct and subscription is active
2. **Rate Limits**: Free tier has limited requests per day
3. **Language Not Supported**: Check the language ID mapping in `judge0.js`
4. **Timeout Issues**: Judge0 may take time for complex submissions

### Fallback to Piston
If Judge0 fails, the system can fall back to Piston API. Update the execute logic to handle errors gracefully.

## Performance Notes
- Judge0 polling adds latency (1-3 seconds per submission)
- Consider implementing async judging for better UX
- Cache language mappings to reduce API calls
- Monitor API usage to avoid rate limits
