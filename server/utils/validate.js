function sanitize(str) {
  if (typeof str !== "string") return str;
  return str.replace(/[<>]/g, "").trim();
}

function validateRequired(fields, body) {
  for (const field of fields) {
    if (!body[field] || (typeof body[field] === "string" && !body[field].trim())) {
      return `${field} обязательно`;
    }
  }
  return null;
}

function validateId(id) {
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

module.exports = { sanitize, validateRequired, validateId };
