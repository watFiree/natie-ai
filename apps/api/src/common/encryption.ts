import crypto from 'crypto';

const DEFAULT_ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getKey(key?: string): Buffer {
  const encryptionKey = key || DEFAULT_ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error(
      'Encryption key is not set. Provide a key or set ENCRYPTION_KEY environment variable'
    );
  }
  // Derive a 32-byte key using SHA-256
  return crypto.createHash('sha256').update(encryptionKey).digest();
}

/**
 * Encrypts a string value using AES-256-GCM.
 * @param text - The plaintext string to encrypt
 * @param key - Optional encryption key (defaults to ENCRYPTION_KEY env var)
 * @returns Uint8Array containing: iv (16 bytes) + authTag (16 bytes) + encrypted data
 */
export function encrypt(text: string, key?: string): Uint8Array<ArrayBuffer> {
  const derivedKey = getKey(key);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Store: iv + authTag + encrypted data
  return Uint8Array.from(Buffer.concat([iv, authTag, encrypted]));
}

/**
 * Decrypts a Uint8Array back to a string.
 * @param encryptedData - Uint8Array containing iv + authTag + encrypted data
 * @param key - Optional encryption key (defaults to ENCRYPTION_KEY env var)
 * @returns The decrypted plaintext string
 */
export function decrypt(encryptedData: Uint8Array, key?: string): string {
  const encryptedBuffer = Buffer.from(encryptedData);
  const derivedKey = getKey(key);

  if (encryptedData.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error('Invalid encrypted data format');
  }

  const iv = encryptedBuffer.subarray(0, IV_LENGTH);
  const authTag = encryptedBuffer.subarray(
    IV_LENGTH,
    IV_LENGTH + AUTH_TAG_LENGTH
  );
  const encrypted = encryptedBuffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

/**
 * Encrypts a string value or returns null if the input is null/undefined.
 * @param text - The plaintext string to encrypt, or null/undefined
 * @param key - Optional encryption key
 * @returns Uint8Array containing encrypted data, or null if input was null/undefined
 */
export function encryptNullable(
  text: string | null | undefined,
  key?: string
): Uint8Array<ArrayBuffer> | null {
  if (text === null || text === undefined) {
    return null;
  }
  return encrypt(text, key);
}

/**
 * Decrypts a Uint8Array back to a string, or returns null if the input is null.
 * @param encryptedData - Uint8Array containing encrypted data, or null
 * @param key - Optional encryption key
 * @returns The decrypted plaintext string, or null if input was null
 */
export function decryptNullable(
  encryptedData: Uint8Array | null,
  key?: string
): string | null {
  if (encryptedData === null) {
    return null;
  }
  return decrypt(encryptedData, key);
}
