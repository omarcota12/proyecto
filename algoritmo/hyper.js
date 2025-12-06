// algoritmo/hyper.js
const crypto = require('crypto');

function deriveKey(password, salt, iterations = 100000, keyLen = 32) {
  return crypto.pbkdf2Sync(password, salt, iterations, keyLen, 'sha256');
}

function xorBuffers(buf, keyBuf) {
  const out = Buffer.alloc(buf.length);
  for (let i = 0; i < buf.length; i++) out[i] = buf[i] ^ keyBuf[i % keyBuf.length];
  return out;
}

function permutationIndices(n, seed) {
  const idx = new Array(n);
  for (let i = 0; i < n; i++) idx[i] = i;
  let s = seed >>> 0;
  function rand() { s = (1103515245 * s + 12345) >>> 0; return s / 0x100000000; }
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

function permuteBuffer(buf, seed) {
  const idx = permutationIndices(buf.length, seed);
  const out = Buffer.alloc(buf.length);
  for (let i = 0; i < buf.length; i++) out[i] = buf[idx[i]];
  return out;
}

function invertPermutationIndices(idx) {
  const inv = new Array(idx.length);
  for (let i = 0; i < idx.length; i++) inv[idx[i]] = i;
  return inv;
}
function invertPermutedBuffer(buf, seed) {
  const idx = permutationIndices(buf.length, seed);
  const inv = invertPermutationIndices(idx);
  const out = Buffer.alloc(buf.length);
  for (let i = 0; i < buf.length; i++) out[i] = buf[inv[i]];
  return out;
}

function aesGcmEncrypt(plainBuf, keyBuf, iv) {
  const cipher = crypto.createCipheriv('aes-256-gcm', keyBuf, iv);
  const ct = Buffer.concat([cipher.update(plainBuf), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { ct, tag };
}
function aesGcmDecrypt(ctBuf, keyBuf, iv, tag) {
  const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuf, iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(ctBuf), decipher.final()]);
  return plain;
}

function hyperEncrypt(plainText, password) {
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const derived = deriveKey(password, salt); // 32 bytes
  const seed = derived.readUInt32BE(0);
  const plainBuf = Buffer.from(plainText, 'utf8');
  const permuted = permuteBuffer(plainBuf, seed);
  const { ct, tag } = aesGcmEncrypt(permuted, derived, iv);
  const xored = xorBuffers(ct, derived);
  return JSON.stringify({
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    ct: xored.toString('base64')
  });
}

function hyperDecrypt(payloadJson, password) {
  const obj = JSON.parse(payloadJson);
  const salt = Buffer.from(obj.salt, 'base64');
  const iv = Buffer.from(obj.iv, 'base64');
  const tag = Buffer.from(obj.tag, 'base64');
  const xored = Buffer.from(obj.ct, 'base64');
  const derived = deriveKey(password, salt);
  const ct = xorBuffers(xored, derived);
  const permuted = aesGcmDecrypt(ct, derived, iv, tag);
  const seed = derived.readUInt32BE(0);
  const plainBuf = invertPermutedBuffer(permuted, seed);
  return plainBuf.toString('utf8');
}

module.exports = { hyperEncrypt, hyperDecrypt };
