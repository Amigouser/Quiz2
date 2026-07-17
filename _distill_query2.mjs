import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('C:\\Users\\user\\.local\\share\\mimocode\\mimocode.db', { open: true, readOnly: true });

const cutoff = new Date('2026-06-17T00:00:00Z').getTime();

// 1. Get all user messages from recent sessions (non-checkpoint-writer sessions)
console.log("=== USER MESSAGES (non-system sessions) ===");
const userMsgs = db.prepare(`
  SELECT m.session_id, substr(json_extract(m.data, '$.content'), 1, 500) as msg, m.time_created
  FROM message m
  WHERE json_extract(m.data, '$.role') = 'user'
    AND m.time_created > ${cutoff}
    AND m.session_id NOT LIKE '%checkpoint%'
    AND m.session_id NOT LIKE '%dream%'
  ORDER BY m.time_created ASC
`).all();
console.log(JSON.stringify(userMsgs, null, 2));

// 2. Get assistant text responses (not tool calls) to see what workflows were done
console.log("\n=== ASSISTANT TEXT RESPONSES (recent) ===");
const assistantTexts = db.prepare(`
  SELECT m.session_id,
         substr(json_extract(p.data, '$.text'), 1, 500) as text_preview,
         m.time_created
  FROM message m
  JOIN part p ON p.message_id = m.id
  WHERE json_extract(m.data, '$.role') = 'assistant'
    AND json_extract(p.data, '$.type') = 'text'
    AND m.time_created > ${cutoff}
    AND m.session_id NOT LIKE '%checkpoint%'
    AND m.session_id NOT LIKE '%dream%'
    AND length(json_extract(p.data, '$.text')) > 50
  ORDER BY m.time_created ASC
  LIMIT 40
`).all();
console.log(JSON.stringify(assistantTexts, null, 2));

// 3. Look for repeated file edit patterns
console.log("\n=== FILE EDIT PATTERNS ===");
const edits = db.prepare(`
  SELECT json_extract(p.data, '$.state.input') as input
  FROM message m
  JOIN part p ON p.message_id = m.id
  WHERE json_extract(m.data, '$.role') = 'assistant'
    AND json_extract(p.data, '$.tool') = 'edit'
    AND m.time_created > ${cutoff}
  ORDER BY m.time_created ASC
`).all();
// Extract file paths from edits
const editFiles = edits.map(e => {
  try {
    const input = JSON.parse(e.input);
    return input.filePath || input.file_path || 'unknown';
  } catch { return 'parse_error'; }
});
// Count file edit frequency
const fileCounts = {};
editFiles.forEach(f => { fileCounts[f] = (fileCounts[f] || 0) + 1; });
console.log("File edit frequency:", JSON.stringify(fileCounts, null, 2));

// 4. Look for bash command patterns
console.log("\n=== BASH COMMAND PATTERNS ===");
const bashCmds = db.prepare(`
  SELECT json_extract(p.data, '$.state.input') as input
  FROM message m
  JOIN part p ON p.message_id = m.id
  WHERE json_extract(m.data, '$.role') = 'assistant'
    AND json_extract(p.data, '$.tool') = 'bash'
    AND m.time_created > ${cutoff}
  ORDER BY m.time_created ASC
`).all();
const cmdCounts = {};
bashCmds.forEach(c => {
  try {
    const input = JSON.parse(c.input);
    const cmd = input.command || '';
    // Normalize: get first word/command
    const normalized = cmd.split(/\s+/).slice(0, 3).join(' ');
    cmdCounts[normalized] = (cmdCounts[normalized] || 0) + 1;
  } catch {}
});
console.log("Bash command patterns:", JSON.stringify(cmdCounts, null, 2));

db.close();
