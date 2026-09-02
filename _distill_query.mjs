import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('C:\\Users\\user\\.local\\share\\mimocode\\mimocode.db', { open: true, readOnly: true });

// 1. List tables
console.log("=== TABLES ===");
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log(JSON.stringify(tables.map(t => t.name)));

// 2. Session schema
console.log("\n=== SESSION SCHEMA ===");
const msgCols = db.prepare("PRAGMA table_info(message)").all();
console.log("message columns:", JSON.stringify(msgCols.map(c => c.name)));
const partCols = db.prepare("PRAGMA table_info(part)").all();
console.log("part columns:", JSON.stringify(partCols.map(c => c.name)));

// 3. Recent sessions (last 30 days, since 2026-06-17)
const cutoff = new Date('2026-06-17T00:00:00Z').getTime();
console.log("\n=== RECENT SESSIONS (since 2026-06-17) ===");
const sessions = db.prepare(`SELECT id, title, time_created FROM session WHERE time_created > ${cutoff} ORDER BY time_created DESC`).all();
console.log(JSON.stringify(sessions, null, 2));

// 4. Tool usage frequency across recent sessions
console.log("\n=== TOOL USAGE (recent sessions) ===");
const toolUsage = db.prepare(`
  SELECT json_extract(p.data, '$.tool') as tool,
         substr(json_extract(p.data, '$.state.input'), 1, 200) as input_preview,
         count(*) as n
  FROM message m
  JOIN part p ON p.message_id = m.id
  WHERE json_extract(m.data, '$.role') = 'assistant'
    AND json_extract(p.data, '$.type') = 'tool'
    AND m.time_created > ${cutoff}
  GROUP BY tool, input_preview
  ORDER BY n DESC
  LIMIT 50
`).all();
console.log(JSON.stringify(toolUsage, null, 2));

// 5. Search user messages for repeated workflow indicators
console.log("\n=== USER MESSAGES WITH REPEATED WORKFLOW KEYWORDS ===");
const keywords = db.prepare(`
  SELECT m.session_id, substr(json_extract(m.data, '$.content'), 1, 300) as msg_preview, m.time_created
  FROM message m
  WHERE json_extract(m.data, '$.role') = 'user'
    AND m.time_created > ${cutoff}
    AND (
      json_extract(m.data, '$.content') LIKE '%снова%'
      OR json_extract(m.data, '$.content') LIKE '%как обычно%'
      OR json_extract(m.data, '$.content') LIKE '%как в прошлый%'
      OR json_extract(m.data, '$.content') LIKE '%повтор%'
      OR json_extract(m.data, '$.content') LIKE '%заново%'
      OR json_extract(m.data, '$.content') LIKE '%deploy%'
      OR json_extract(m.data, '$.content') LIKE '%деплой%'
    )
  ORDER BY m.time_created DESC
  LIMIT 30
`).all();
console.log(JSON.stringify(keywords, null, 2));

// 6. Repeated assistant tool sequences (find deploy/build/debug patterns)
console.log("\n=== ASSISTANT TOOL CALLS (all recent) ===");
const assistantTools = db.prepare(`
  SELECT m.session_id,
         json_extract(p.data, '$.tool') as tool,
         substr(json_extract(p.data, '$.state.input'), 1, 300) as input_preview,
         m.time_created
  FROM message m
  JOIN part p ON p.message_id = m.id
  WHERE json_extract(m.data, '$.role') = 'assistant'
    AND json_extract(p.data, '$.type') = 'tool'
    AND m.time_created > ${cutoff}
  ORDER BY m.time_id, m.time_created
  LIMIT 200
`).all();
console.log(JSON.stringify(assistantTools, null, 2));

db.close();
