const SHEET_ID = '1BliQQUida5bLLJjmEBRvWKpr8MKHtmF2KKezbuxBiIg'; // Spreadsheet ID
const ANSWERS = ['B','C','A','B','C'];
const PASS_THRESHOLD = 4;
const TOKEN_TTL_SECONDS = 15 * 60;
const APP_VERSION = 'v1.2.0'; // update when sources change
const BUILD_STAMP = Utilities.formatDate(new Date(), 'Asia/Jerusalem', 'yyyy-MM-dd HH:mm:ss');
// Optional page background. Put a publicly accessible image URL here.
const BACKGROUND_URL = 'PUT_BACKGROUND_IMAGE_URL_HERE';

function doGet(e) {
  const p = (e && e.parameter && e.parameter.p) || 'welcome';
  const baseUrl = ScriptApp.getService().getUrl();
  if (p === 'register') {
    const token = e.parameter.token || '';
    if (!validateToken(token)) {
      return HtmlService.createHtmlOutput('<h3>Access denied. Please complete the quiz first.</h3><a href="?p=quiz">Back to quiz</a>');
    }
    consumeToken(token);
    const t = HtmlService.createTemplateFromFile('Register');
    t.appVersion = APP_VERSION;
    t.buildStamp = BUILD_STAMP;
    t.baseUrl = baseUrl;
    t.backgroundUrl = BACKGROUND_URL;
    return t.evaluate().setTitle('Registration');
  }
  if (p === 'quiz') {
    const t = HtmlService.createTemplateFromFile('Index');
    t.appVersion = APP_VERSION;
    t.buildStamp = BUILD_STAMP;
    t.baseUrl = baseUrl;
    t.backgroundUrl = BACKGROUND_URL;
    return t.evaluate().setTitle('Quiz');
  }
  const t = HtmlService.createTemplateFromFile('Welcome');
  t.appVersion = APP_VERSION;
  t.buildStamp = BUILD_STAMP;
  t.baseUrl = baseUrl;
  t.backgroundUrl = BACKGROUND_URL;
  return t.evaluate().setTitle('Welcome');
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


