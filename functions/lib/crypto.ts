// 纯 Web Crypto API 实现：JWT 签发/验证 + PBKDF2 密码哈希
// 零外部依赖，完全兼容 Cloudflare Workers / Pages Functions 运行时

// ---------- Base64URL 编解码 ----------

function base64urlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64urlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// ---------- JWT ----------

const encoder = new TextEncoder();

async function getCryptoKey(secret: string, usage: 'sign' | 'verify'): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    [usage],
  );
}

export interface JwtPayload {
  id: number;
  username: string;
  iat?: number;
  exp?: number;
}

export async function generateToken(
  payload: { id: number; username: string },
  secret: string,
  expiresInSeconds = 7 * 24 * 60 * 60, // 7 days
): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };

  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + expiresInSeconds;

  const fullPayload: JwtPayload = { ...payload, iat, exp };

  const headerB64 = base64urlEncode(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64urlEncode(encoder.encode(JSON.stringify(fullPayload)));
  const signingInput = `${headerB64}.${payloadB64}`;

  const key = await getCryptoKey(secret, 'sign');
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(signingInput),
  );
  const signatureB64 = base64urlEncode(signature);

  return `${signingInput}.${signatureB64}`;
}

export async function verifyToken(
  token: string,
  secret: string,
): Promise<JwtPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const signingInput = `${headerB64}.${payloadB64}`;

    // 验证签名
    const key = await getCryptoKey(secret, 'verify');
    const signature = base64urlDecode(signatureB64);
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signature,
      encoder.encode(signingInput),
    );

    if (!isValid) return null;

    // 解析 payload
    const payloadBytes = base64urlDecode(payloadB64);
    const payloadJson = new TextDecoder().decode(payloadBytes);
    const payload = JSON.parse(payloadJson) as JwtPayload;

    // 检查过期
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// ---------- PBKDF2 密码哈希 ----------

// 格式: "iterations$saltHex$hashHex"
// 例如: "100000$a1b2c3d4...$e5f6a7b8..."

const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEY_LEN = 256; // bits
const SALT_LEN = 16; // bytes

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN));

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    PBKDF2_KEY_LEN,
  );

  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const hashHex = Array.from(new Uint8Array(derivedBits))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return `${PBKDF2_ITERATIONS}$${saltHex}$${hashHex}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  // 兼容旧格式：纯 SHA-256 hex（不含 $ 分隔符）
  if (!storedHash.includes('
)) {
    return verifyLegacyPassword(password, storedHash);
  }

  // 新格式：PBKDF2
  try {
    const parts = storedHash.split('
);
    if (parts.length !== 3) return false;

    const [iterationsStr, saltHex, hashHex] = parts;
    const iterations = parseInt(iterationsStr, 10);

    const salt = new Uint8Array(saltHex.length / 2);
    for (let i = 0; i < saltHex.length; i += 2) {
      salt[i / 2] = parseInt(saltHex.substring(i, i + 2), 16);
    }

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits'],
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations,
        hash: 'SHA-256',
      },
      keyMaterial,
      PBKDF2_KEY_LEN,
    );

    const derivedHex = Array.from(new Uint8Array(derivedBits))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return derivedHex === hashHex;
  } catch {
    return false;
  }
}

// 旧格式验证：SHA-256(password + 'sintea_salt_2026')
async function verifyLegacyPassword(password: string, storedHash: string): Promise<boolean> {
  const data = encoder.encode(password + 'sintea_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hashHex === storedHash;
}

// 判断是否为旧格式密码（升级用）
export function isLegacyHash(storedHash: string): boolean {
  return !storedHash.includes('
);
}
