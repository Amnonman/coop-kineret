const SHEET_ID = 'PUT_SHEET_ID_HERE';
const ANSWERS = ['B','C','A','B','C'];
const PASS_THRESHOLD = 4;
const TOKEN_TTL_SECONDS = 15 * 60;

function doGet(e) {
  const p = (e && e.parameter && e.parameter.p) || 'welcome';
  if (p === 'register') {
    const token = e.parameter.token || '';
    if (!validateToken(token)) {
      return HtmlService.createHtmlOutput('<h3>Access denied. Please complete the quiz first.</h3><a href="?p=quiz">Back to quiz</a>');
    }
    consumeToken(token);
    return HtmlService.createTemplateFromFile('Register').evaluate().setTitle('Registration');
  }
  if (p === 'quiz') {
    return HtmlService.createTemplateFromFile('Index').evaluate().setTitle('Quiz');
  }
  return HtmlService.createTemplateFromFile('Welcome').evaluate().setTitle('Welcome');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function grade(payload) {
  const answers = payload.answers || [];
  if (answers.length !== ANSWERS.length) throw new Error('Malformed submission');
  const score = answers.reduce((acc, a, i) => acc + (a === ANSWERS[i] ? 1 : 0), 0);
  const pass = score >= PASS_THRESHOLD;
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sh = ss.getSheetByName('Responses') || ss.insertSheet('Responses');
  sh.appendRow([new Date(), payload.email || '', score, JSON.stringify(answers)]);
  if (!pass) {
    return { pass: false, score };
  }
  const token = createPassToken(payload.email || '');
  return { pass: true, score, token };
}

function createPassToken(email) {
  const token = Utilities.getUuid();
  const cache = CacheService.getScriptCache();
  const data = JSON.stringify({ email: email || '', at: Date.now() });
  cache.put('PASS_' + token, data, TOKEN_TTL_SECONDS);
  return token;
}

function validateToken(token) {
  if (!token) return false;
  const cache = CacheService.getScriptCache();
  const data = cache.get('PASS_' + token);
  return !!data;
}

function consumeToken(token) {
  const cache = CacheService.getScriptCache();
  cache.remove('PASS_' + token);
}

function gradeDryRun() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sh = ss.getSheetByName('Responses') || ss.insertSheet('Responses');
  sh.appendRow([new Date(), 'dry@run', 5, '["A","B","C","B","C"]']);
  Logger.log('OK');
}


