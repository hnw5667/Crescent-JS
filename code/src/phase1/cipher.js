const crypto = require('crypto');
const zlib = require('zlib');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function deriveKey(secret) {
  return crypto.createHash('sha256').update(secret).digest();
}

function encrypt(data, secret) {
  const key = deriveKey(secret);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return iv.toString('hex') + ':' + tag + ':' + encrypted;
}

function decrypt(packet, secret) {
  const key = deriveKey(secret);
  const parts = packet.split(':');
  if (parts.length !== 3) throw new Error('Invalid encrypted packet');
  const iv = Buffer.from(parts[0], 'hex');
  const tag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function compress(data) {
  return zlib.gzipSync(Buffer.from(data, 'utf8')).toString('base64');
}

function decompress(compressed) {
  return zlib.gunzipSync(Buffer.from(compressed, 'base64')).toString('utf8');
}

function isJSON(data) {
  if (typeof data === 'object') return true;
  try {
    JSON.parse(data);
    return true;
  } catch {
    return false;
  }
}

function prepare(data, secret) {
  const isJson = isJSON(data);
  const payload = isJson ? (typeof data === 'string' ? data : JSON.stringify(data)) : String(data);
  const compressed = compress(payload);
  const meta = JSON.stringify({ type: isJson ? 'json' : 'raw' });
  return encrypt(meta + '|' + compressed, secret);
}

function unwrap(packet, secret) {
  const decrypted = decrypt(packet, secret);
  const sep = decrypted.indexOf('|');
  const meta = JSON.parse(decrypted.slice(0, sep));
  const compressed = decrypted.slice(sep + 1);
  const raw = decompress(compressed);
  if (meta.type === 'json') return JSON.parse(raw);
  return raw;
}

module.exports = { encrypt, decrypt, compress, decompress, prepare, unwrap, isJSON };