// Import all battle functions from focused files
const { createBattle } = require('./battle/create');
const { getBattles, getBattleById, getUserBattles } = require('./battle/list');
const { joinBattle, startBattle, leaveBattle } = require('./battle/participate');
const { submitSolution, runCode } = require('./battle/execute');
const { debugBattle } = require('./battle/debug');

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


