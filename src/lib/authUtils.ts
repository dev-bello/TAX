/**
 * Hash a password using PBKDF2 with a random salt
 * Returns a string in format: iterations.salt.hash (hex encoded)
 */
export async function hashPassword(password: string): Promise<string> {
  const iterations = 100000;
  const saltLength = 16;
  const keyLength = 32;

  // Generate random salt
  const salt = crypto.getRandomValues(new Uint8Array(saltLength));

  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Import key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  // Derive bits using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    keyLength * 8
  );

  const hashArray = Array.from(new Uint8Array(derivedBits));
  const saltArray = Array.from(salt);

  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  const saltHex = saltArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return `${iterations}.${saltHex}.${hashHex}`;
}

/**
 * Verify a password against a stored PBKDF2 hash
 * Stored format: iterations.salt.hash
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split('.');
  if (parts.length !== 3) {
    // Fallback for old SHA-256 hashes (backward compatibility)
    const hashed = await legacyHashPassword(password);
    return hashed === storedHash;
  }

  const iterations = parseInt(parts[0], 10);
  const saltHex = parts[1];
  const expectedHashHex = parts[2];

  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));

  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    expectedHashHex.length * 4
  );

  const hashArray = Array.from(new Uint8Array(derivedBits));
  const actualHashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // Constant-time comparison to prevent timing attacks
  if (actualHashHex.length !== expectedHashHex.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < actualHashHex.length; i++) {
    result |= actualHashHex.charCodeAt(i) ^ expectedHashHex.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Legacy SHA-256 hash for backward compatibility
 */
async function legacyHashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Clear all browser storage and cookies
 * Call this on logout to ensure no session data persists
 */
export function clearAllStorage(): void {
  // Clear localStorage
  try {
    localStorage.clear();
  } catch {
    // localStorage might be disabled
  }

  // Clear sessionStorage
  try {
    sessionStorage.clear();
  } catch {
    // sessionStorage might be disabled
  }

  // Clear all cookies including those with specific paths and domains
  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
      // Delete cookie by setting expired date on multiple paths
      const paths = ['/', '/api', '/auth', window.location.pathname];
      for (const path of paths) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
      }
      // Also try without path
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
    }
  } catch {
    // Cookies might be disabled
  }

  // Clear IndexedDB databases (Dexie)
  try {
    indexedDB.databases?.().then((databases) => {
      for (const db of databases) {
        if (db.name) {
          indexedDB.deleteDatabase(db.name);
        }
      }
    });
  } catch {
    // IndexedDB might not support databases() or be disabled
  }
}
