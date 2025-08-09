const Battle = require('../models/battle');
const User = require('../models/user');

// Lightweight code execution via Piston (free public API)
// Docs: https://github.com/engineer-man/piston
const PISTON_BASE_URL = process.env.PISTON_BASE_URL || 'https://emkc.org/api/v2/piston';
let cachedRuntimes = null;

async function getFetch() {
  if (typeof fetch !== 'undefined') return fetch;
  try {
    // eslint-disable-next-line global-require
    const nodeFetch = require('node-fetch');
    return nodeFetch;
  } catch (e) {
    throw new Error('Fetch API not available. Install node-fetch or use Node 18+.');
  }
}

// Gemini validation for problem statements (optional)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_VALIDATION_MODE = (process.env.GEMINI_VALIDATION_MODE || 'block').toLowerCase(); // 'block' | 'warn'
// Normalize model aliases (only 2.5 family supported)
function normalizeGeminiModel(input) {
  const raw = (input || '').trim().toLowerCase();
  const aliases = new Map([
    ['2.5', 'gemini-2.5-flash'], // default plain 2.5 -> flash
    ['gemini-2.5', 'gemini-2.5-flash'],
    ['2.5-pro', 'gemini-2.5-pro'],
    ['2.5 pro', 'gemini-2.5-pro'],
    ['gemini-2.5-pro', 'gemini-2.5-pro'],
    ['2.5-flash', 'gemini-2.5-flash'],
    ['2.5 flash', 'gemini-2.5-flash'],
    ['gemini-2.5-flash', 'gemini-2.5-flash']
  ]);
  if (aliases.has(raw)) return aliases.get(raw);
  // If user already supplied a full ID, pass through
  if (raw.startsWith('gemini-')) return raw;
  // Fallback to 2.5-flash only
  return 'gemini-2.5-flash';
}
const GEMINI_MODEL = normalizeGeminiModel(process.env.GEMINI_MODEL || 'gemini-2.5-flash');

async function validateSingleProblemWithGemini(problem) {
  if (!GEMINI_API_KEY) return { skipped: true };
  const _fetch = await getFetch();
  const model = normalizeGeminiModel(GEMINI_MODEL);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
  const prompt = `You are a strict validator for programming problems on a coding battle platform.
Decide if the problem is coherent, well-posed, and realistically solvable with a deterministic evaluation, not vague or nonsensical.
If key parts are missing (clear goal, constraints or examples, meaningful testcases), mark invalid.
Return ONLY strict JSON: {"isValid": boolean, "reason": string, "flags": string[]}. No extra text.

Problem:
Title: ${problem.title || ''}
Description: ${problem.description || ''}
Difficulty: ${problem.difficulty || ''}
Constraints: ${Array.isArray(problem.constraints) ? problem.constraints.join(' | ') : (problem.constraints || '')}
Examples: ${Array.isArray(problem.examples) ? problem.examples.map(e => `{in:${e.input||''}, out:${e.output||''}}`).join(' | ') : ''}
TestCases: ${Array.isArray(problem.testCases) ? problem.testCases.map(t => `{in:${t.input||''}, exp:${t.expectedOutput||''}}`).join(' | ') : ''}
`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }]
  };
  const resp = await _fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!resp.ok) {
    // If Gemini fails
    return { skipped: true, error: `Gemini API error ${resp.status}` };
  }
  const data = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  try {
    const parsed = JSON.parse(text);
    return {
      skipped: false,
      isValid: !!parsed.isValid,
      reason: typeof parsed.reason === 'string' ? parsed.reason : '',
      flags: Array.isArray(parsed.flags) ? parsed.flags : []
    };
  } catch (e) {
    // If response isn't strict JSON, try to extract JSON block
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        return {
          skipped: false,
          isValid: !!parsed.isValid,
          reason: typeof parsed.reason === 'string' ? parsed.reason : '',
          flags: Array.isArray(parsed.flags) ? parsed.flags : []
        };
      } catch {}
    }
    return { skipped: true };
  }
}

async function validateProblemsWithGemini(problems) {
  if (!GEMINI_API_KEY) return { skipped: true, results: [] };
  const results = [];
  for (let i = 0; i < problems.length; i++) {
    // Validate sequentially to avoid rate limits
    // eslint-disable-next-line no-await-in-loop
    const r = await validateSingleProblemWithGemini(problems[i]);
    results.push(r);
  }
  return { skipped: false, results };
}

// Local strict validation to catch obvious junk without LLM
function validateProblemsLocally(problems) {
  const issues = [];
  const minDescLen = 60; // tweakable
  for (let i = 0; i < problems.length; i++) {
    const p = problems[i] || {};
    const probIssues = [];
    const titleOk = typeof p.title === 'string' && p.title.trim().length >= 5;
    const descOk = typeof p.description === 'string' && p.description.trim().length >= minDescLen;
    const diffOk = ['Easy', 'Medium', 'Hard'].includes(p.difficulty);
    const examples = Array.isArray(p.examples) ? p.examples : [];
    const examplesOk = examples.length >= 1 && examples.every(e => (e && typeof e.input === 'string' && e.input.trim() !== '' && typeof e.output === 'string' && e.output.trim() !== ''));
    const tcs = Array.isArray(p.testCases) ? p.testCases : [];
    const tcsOk = tcs.length >= 2 && tcs.every(t => (t && typeof t.input === 'string' && t.input.trim() !== '' && typeof t.expectedOutput === 'string' && t.expectedOutput.trim() !== ''));

    if (!titleOk) probIssues.push('Title too short or missing');
    if (!descOk) probIssues.push(`Description too short (min ${minDescLen} chars)`);
    if (!diffOk) probIssues.push('Invalid difficulty');
    if (!examplesOk) probIssues.push('At least 1 example with non-empty input/output required');
    if (!tcsOk) probIssues.push('At least 2 test cases with non-empty input/expectedOutput required');

    if (probIssues.length) issues.push({ index: i, reason: probIssues.join('; ') });
  }
  return issues;
}

async function loadPistonRuntimes() {
  if (cachedRuntimes) return cachedRuntimes;
  const _fetch = await getFetch();
  const resp = await _fetch(`${PISTON_BASE_URL}/runtimes`);
  if (!resp.ok) throw new Error('Failed to load Piston runtimes');
  cachedRuntimes = await resp.json();
  return cachedRuntimes;
}

function mapLanguageToPiston(lang) {
  if (!lang) return 'python';
  const l = String(lang).toLowerCase();
  if (['py', 'python', 'python3'].includes(l)) return 'python';
  if (['js', 'javascript', 'node', 'nodejs'].includes(l)) return 'javascript';
  if (['ts', 'typescript'].includes(l)) return 'typescript';
  if (['cpp', 'c++'].includes(l)) return 'c++';
  if (['c'].includes(l)) return 'c';
  if (['java'].includes(l)) return 'java';
  if (['go', 'golang'].includes(l)) return 'go';
  if (['rb', 'ruby'].includes(l)) return 'ruby';
  if (['php'].includes(l)) return 'php';
  return l; // fallback
}

async function getLatestVersionFor(lang) {
  const runtimes = await loadPistonRuntimes();
  const matches = runtimes.filter(r => r.language === lang);
  if (matches.length === 0) return null;
  // Pick the highest version lexicographically (versions are strings like '3.10.0')
  matches.sort((a, b) => String(a.version).localeCompare(String(b.version)));
  return matches[matches.length - 1].version;
}

async function executeCodeWithPiston({ language, code, stdin }) {
  const _fetch = await getFetch();
  const lang = mapLanguageToPiston(language);
  const version = await getLatestVersionFor(lang);
  if (!version) {
    return { error: `Language not supported by runtime: ${language}` };
  }
  const body = {
    language: lang,
    version,
    files: [{ name: `main.${lang}`, content: code || '' }],
    stdin: stdin || ''
  };
  const resp = await _fetch(`${PISTON_BASE_URL}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!resp.ok) {
    const tx = await resp.text();
    return { error: `Execution failed: ${resp.status} ${tx}` };
  }
  const data = await resp.json();
  // data.run: { stdout, stderr, code, signal, output }
  return {
    stdout: data?.run?.stdout || '',
    stderr: data?.run?.stderr || '',
    code: data?.run?.code,
    time: data?.run?.time,
    memory: data?.run?.memory,
    output: data?.run?.output || (data?.run?.stdout || data?.run?.stderr || '')
  };
}

// Create a new battle
const createBattle = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const {
      title,
      description,
      problems,
      difficulty,
      duration,
      maxParticipants,
      startTime,
      isPublic,
      tags
    } = req.body;

    // Validation
    if (!title || !description || !problems || !Array.isArray(problems) || problems.length === 0) {
      return res.status(400).json({
        error: 'Title, description, and at least one problem are required'
      });
    }

    if (!difficulty || !['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      return res.status(400).json({
        error: 'Valid difficulty (Easy, Medium, Hard) is required'
      });
    }

    if (!duration || duration < 15 || duration > 480) {
      return res.status(400).json({
        error: 'Duration must be between 15 and 480 minutes'
      });
    }

    // Validate problems
    for (let i = 0; i < problems.length; i++) {
      const problem = problems[i];
      if (!problem.title || !problem.description || !problem.difficulty) {
        return res.status(400).json({
          error: `Problem ${i + 1} is missing required fields (title, description, difficulty)`
        });
      }
    }

    // Local strict validation first
    const localIssues = validateProblemsLocally(problems);
    if (localIssues.length) {
      return res.status(400).json({ error: 'Problem validation failed (local)', issues: localIssues });
    }

    // Gemini validation before persisting
    try {
      const validation = await validateProblemsWithGemini(problems);
      if (validation.skipped) {
        if (GEMINI_VALIDATION_MODE === 'block') {
          return res.status(400).json({ error: 'Gemini validation is required but unavailable. Configure GEMINI_API_KEY and GEMINI_MODEL (2.5 / 2.5 pro / 2.5 flash).' });
        }
      } else {
        const issues = [];
        validation.results.forEach((r, idx) => {
          if (r.skipped) {
            if (GEMINI_VALIDATION_MODE === 'block') {
              issues.push({ index: idx, reason: 'Validation skipped/unavailable for this problem' });
            }
            return;
          }
          if (r.isValid === false) {
            issues.push({ index: idx, reason: r.reason, flags: r.flags });
          }
        });
        if (issues.length > 0) {
          return res.status(400).json({ error: 'One or more problems failed validation (gemini)', issues });
        }
      }
    } catch (gemErr) {
      if (GEMINI_VALIDATION_MODE === 'block') {
        return res.status(400).json({ error: 'Gemini validation error', detail: gemErr?.message || String(gemErr) });
      }
      console.warn('Gemini validation warning:', gemErr?.message || gemErr);
    }

    const battleStartTime = startTime ? new Date(startTime) : new Date(Date.now() + 5 * 60 * 1000); // Default: 5 minutes from now

    const battle = new Battle({
      title,
      description,
      creator: user._id,
      problems,
      difficulty,
      duration,
      maxParticipants: maxParticipants || 100,
      startTime: battleStartTime,
      isPublic: isPublic !== false, // Default to true
      tags: tags || [],
      status: 'Scheduled'
    });

    await battle.save();
    await battle.populate('creator', 'username email');

    res.status(201).json({
      message: 'Battle created successfully',
      battle
    });

  } catch (error) {
    console.error('Create battle error:', error);
    res.status(500).json({
      error: error.message || 'Failed to create battle'
    });
  }
};

// Get all battles (with filters)
const getBattles = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, difficulty, search, creator, isPublic } = req.query;

    const filter = {};
    
    // Build dynamic status filtering with time-window awareness for 'Active'
    const now = new Date();
    let statusOrConditions = [];
    if (status) {
      const statusArray = status.split(',').map(s => s.trim());
      const otherStatuses = statusArray.filter(s => s !== 'Active');
      // If 'Active' requested, include ONLY time-window active condition
      if (statusArray.includes('Active')) {
        statusOrConditions.push({ $and: [ { startTime: { $lte: now } }, { endTime: { $gte: now } } ] });
      }
      // If 'Scheduled' requested, include only future scheduled (start in future)
      if (statusArray.includes('Scheduled')) {
        statusOrConditions.push({ $and: [ { status: 'Scheduled' }, { startTime: { $gt: now } } ] });
      }
      if (otherStatuses.length > 0) {
        statusOrConditions.push({ status: { $in: otherStatuses } });
      }

      // If 'Completed' is NOT included, exclude ended battles globally
      if (!statusArray.includes('Completed')) {
        // Apply as an additional $and filter later; we'll append to query
        filter.endTime = { $gt: now };
      }
    }
    if (difficulty) filter.difficulty = difficulty;
    if (creator) filter.creator = creator;
    if (isPublic !== undefined) filter.isPublic = isPublic === 'true';
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Combine filters. If we have statusOrConditions, wrap everything in $and to preserve search $or
    let query = { ...filter };
    if (statusOrConditions.length > 0) {
      // Convert simple time-window object into $or group properly
      const normalizedStatusOr = statusOrConditions; // already normalized above
      const andClauses = [];
      // Move existing search $or into $and as well
      if (query.$or) {
        andClauses.push({ $or: query.$or });
        delete query.$or;
      }
      // Any remaining simple key filters
      const remainingKeys = Object.keys(query);
      if (remainingKeys.length > 0) {
        andClauses.push(query);
      }
      andClauses.push({ $or: normalizedStatusOr });
      query = { $and: andClauses };
    }

    const battles = await Battle.find(query)
      .populate('creator', 'username email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Battle.countDocuments(query);

    res.json({
      battles,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get battles error:', error);
    res.status(500).json({
      error: 'Failed to fetch battles'
    });
  }
};

// Get battle by ID
const getBattleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const battle = await Battle.findById(id)
      .populate('creator', 'username email')
      .populate('participants.user', 'username email')
      .populate('leaderboard.user', 'username email');

    if (!battle) {
      return res.status(404).json({
        error: 'Battle not found'
      });
    }

    res.json({ battle });

  } catch (error) {
    console.error('Get battle error:', error);
    res.status(500).json({
      error: 'Failed to fetch battle'
    });
  }
};

// Join a battle
const joinBattle = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { id } = req.params;

    const battle = await Battle.findById(id);
    if (!battle) {
      return res.status(404).json({
        error: 'Battle not found'
      });
    }
    
    console.log('Debug - Battle found:', {
      id: battle._id,
      title: battle.title,
      creator: battle.creator,
      participantCount: battle.participants.length
    });

    // Check if user can join and provide specific error messages
    const now = new Date();
    
    // Check if battle is completed or cancelled
    if (battle.status === 'Completed' || battle.status === 'Cancelled') {
      return res.status(400).json({
        error: `Cannot join a ${battle.status.toLowerCase()} battle`
      });
    }
    
    // Check if battle has ended
    if (battle.endTime && now > battle.endTime) {
      return res.status(400).json({
        error: 'This battle has already ended'
      });
    }
    
    // Check if at max capacity
    if (battle.participants.length >= battle.maxParticipants) {
      return res.status(400).json({
        error: 'Battle is full - maximum participants reached'
      });
    }
    
    // Check if already joined - this is the main fix
    console.log('Debug - Battle ID:', id);
    console.log('Debug - Battle Creator:', battle.creator.toString());
    console.log('Debug - Current User ID:', user._id.toString());
    console.log('Debug - User from req.userId:', req.userId);
    console.log('Debug - User object:', { id: user._id, username: user.username, email: user.email });
    console.log('Debug - Current participants:', battle.participants.map(p => ({
      userId: p.user.toString(),
      joinedAt: p.joinedAt,
      matchesCurrentUser: p.user.toString() === user._id.toString()
    })));
    
    // More robust participant check with multiple comparison methods
    const userIdString = user._id.toString();
    const alreadyJoined = battle.participants.some(p => {
      const participantIdString = p.user.toString();
      const match = participantIdString === userIdString;
      console.log('Debug - Comparing participant:', participantIdString, 'with user:', userIdString, 'match:', match);
      return match;
    });
    
    console.log('Debug - Already joined check result:', alreadyJoined);
    console.log('Debug - Is creator trying to join own battle:', battle.creator.toString() === user._id.toString());
    
    // Additional debug info about participants
    console.log('Debug - Total participants in battle:', battle.participants.length);
    console.log('Debug - Participant user IDs:', battle.participants.map(p => p.user.toString()));
    
    if (alreadyJoined) {
      return res.status(400).json({
        error: 'You have already joined this battle'
      });
    }
    
    // For scheduled battles, check if within joining window
    if (battle.status === 'Scheduled') {
      const timeUntilStart = battle.startTime.getTime() - now.getTime();
      const fifteenMinutes = 15 * 60 * 1000;
      if (timeUntilStart > fifteenMinutes) {
        const minutesUntilJoin = Math.ceil((timeUntilStart - fifteenMinutes) / (60 * 1000));
        return res.status(400).json({
          error: `Battle opens for joining ${minutesUntilJoin} minutes before start time`
        });
      }
    }

    // Add user to participants
    battle.participants.push({
      user: user._id,
      joinedAt: new Date()
    });

    await battle.save();
    await battle.populate('participants.user', 'username email');

    res.json({
      message: 'Successfully joined the battle',
      battle
    });

  } catch (error) {
    console.error('Join battle error:', error);
    res.status(500).json({
      error: error.message || 'Failed to join battle'
    });
  }
};

// Start a battle (for creators)
const startBattle = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { id } = req.params;

    const battle = await Battle.findById(id);
    if (!battle) {
      return res.status(404).json({
        error: 'Battle not found'
      });
    }

    if (battle.creator.toString() !== user._id.toString()) {
      return res.status(403).json({
        error: 'Only the battle creator can start the battle'
      });
    }

    if (battle.status !== 'Scheduled') {
      return res.status(400).json({
        error: 'Battle cannot be started'
      });
    }

    battle.status = 'Active';
    battle.startTime = new Date();
    await battle.save();

    res.json({
      message: 'Battle started successfully',
      battle
    });

  } catch (error) {
    console.error('Start battle error:', error);
    res.status(500).json({
      error: error.message || 'Failed to start battle'
    });
  }
};

// Get user's battles
const getUserBattles = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { type = 'all' } = req.query; // 'created', 'joined', 'all'

    let filter = {};
    
    if (type === 'created') {
      filter.creator = user._id;
    } else if (type === 'joined') {
      filter['participants.user'] = user._id;
    } else {
      filter.$or = [
        { creator: user._id },
        { 'participants.user': user._id }
      ];
    }

    const battles = await Battle.find(filter)
      .populate('creator', 'username email')
      .sort({ createdAt: -1 });

    res.json({ battles });

  } catch (error) {
    console.error('Get user battles error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch user battles'
    });
  }
};

// Submit solution for a problem
const submitSolution = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { battleId, problemId } = req.params;
    const { code, language } = req.body;

    const battle = await Battle.findById(battleId);
    if (!battle) {
      return res.status(404).json({
        error: 'Battle not found'
      });
    }

    if (!battle.isActive()) {
      return res.status(400).json({
        error: 'Battle is not active'
      });
    }

    const participant = battle.participants.find(p => p.user.toString() === user._id.toString());
    if (!participant) {
      return res.status(400).json({
        error: 'You are not a participant in this battle'
      });
    }

    const problem = battle.problems.id(problemId);
    if (!problem) {
      return res.status(404).json({
        error: 'Problem not found'
      });
    }

    // Add submission (initial: Pending)
    participant.submissions.push({
      problemId,
      code,
      language,
      submittedAt: new Date(),
      result: {
        status: 'Pending',
        score: 0
      }
    });

    await battle.save();

    // Execute against all test cases (including hidden)
    const testCases = Array.isArray(problem.testCases) ? problem.testCases : [];
    const details = [];
    let passed = 0;
    let totalTime = 0;
    let peakMem = 0;
    for (const tc of testCases) {
      const exec = await executeCodeWithPiston({ language, code, stdin: tc.input || '' });
      const got = (exec.stdout || '').trim();
      const exp = String(tc.expectedOutput || '').trim();
      const ok = got === exp;
      if (ok) passed += 1;
      totalTime += Number(exec.time || 0);
      peakMem = Math.max(peakMem, Number(exec.memory || 0));
      details.push({
        input: tc.input || '',
        expected: exp,
        stdout: exec.stdout || '',
        stderr: exec.stderr || '',
        passed: ok
      });
      // Optional early stop if heavy: continue full to provide detailed report
    }

    const submission = participant.submissions[participant.submissions.length - 1];
    const allPassed = passed === testCases.length && testCases.length > 0;
    submission.result = {
      status: allPassed ? 'Accepted' : 'Wrong Answer',
      score: allPassed ? (problem.points || 100) : Math.round(((passed / Math.max(1, testCases.length)) * (problem.points || 100))),
      executionTime: Math.round(totalTime * 1000) / 1000,
      memory: peakMem,
      details
    };

    await battle.save();

    res.json({
      message: 'Solution submitted successfully',
      submission
    });

  } catch (error) {
    console.error('Submit solution error:', error);
    res.status(500).json({
      error: error.message || 'Failed to submit solution'
    });
  }
};

// Run code with custom input (without judging)
const runCode = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { battleId, problemId } = req.params;
    const { code, language, stdin } = req.body;

    const battle = await Battle.findById(battleId);
    if (!battle) return res.status(404).json({ error: 'Battle not found' });
    const problem = battle.problems.id(problemId);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    // Optional: ensure user is a participant
    const participant = battle.participants.find(p => p.user.toString() === user._id.toString());
    if (!participant) return res.status(400).json({ error: 'You are not a participant in this battle' });

    const exec = await executeCodeWithPiston({ language, code, stdin });
    if (exec.error) return res.status(400).json({ error: exec.error });
    res.json({
      stdout: exec.stdout,
      stderr: exec.stderr,
      code: exec.code,
      time: exec.time,
      memory: exec.memory,
      output: exec.output
    });
  } catch (error) {
    console.error('Run code error:', error);
    res.status(500).json({ error: error.message || 'Failed to run code' });
  }
};

// Debug endpoint to check battle participants
const debugBattle = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { id } = req.params;
    const battle = await Battle.findById(id).populate('participants.user', 'username email');
    
    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }
    
    res.json({
      battleId: battle._id,
      battleTitle: battle.title,
      currentUserId: user._id,
      currentUsername: user.username,
      participants: battle.participants.map(p => ({
        userId: p.user._id,
        username: p.user.username,
        joinedAt: p.joinedAt,
        isCurrentUser: p.user._id.toString() === user._id.toString()
      })),
      participantCount: battle.participants.length,
      maxParticipants: battle.maxParticipants
    });
  } catch (error) {
    console.error('Debug battle error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Leave battle endpoint (for debugging and cleanup)
const leaveBattle = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { id } = req.params;
    const battle = await Battle.findById(id);
    
    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }
    
    // Remove user from participants
    const initialCount = battle.participants.length;
    battle.participants = battle.participants.filter(p => p.user.toString() !== user._id.toString());
    const finalCount = battle.participants.length;
    
    await battle.save();
    
    res.json({
      message: 'Successfully left the battle',
      removed: initialCount - finalCount,
      remainingParticipants: finalCount
    });
  } catch (error) {
    console.error('Leave battle error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createBattle,
  getBattles,
  getBattleById,
  joinBattle,
  startBattle,
  getUserBattles,
  submitSolution,
  runCode,
  debugBattle,
  leaveBattle
};
