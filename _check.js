const {all} = require('./server/db');
const qs = all('SELECT id,question_type,match_options FROM questions ORDER BY id LIMIT 10');
qs.forEach(q => {
  let parsed;
  try { parsed = JSON.parse(q.match_options); } catch(e) { parsed = 'PARSE_ERROR'; }
  console.log(q.id, q.question_type, typeof q.match_options, Array.isArray(parsed) ? 'ARRAY:'+parsed.length : parsed);
});