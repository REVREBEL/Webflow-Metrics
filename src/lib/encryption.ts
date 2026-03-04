/**
 * Encryption utilities using Web Crypto API (Cloudflare Workers compatible)
 * 
 * This uses AES-GCM encryption which is supported in Cloudflare Workers runtime.
 * The encryption key is derived from the ENCRYPTION_KEY environment variable.
 */

/**
 * Get encryption key from environment
 */
async function getEncryptionKey(env: any): Promise<CryptoKey> {
  const keyString = env.ENCRYPTION_KEY;
  
  if (!keyString) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }

  // Convert the key string to a CryptoKey
  const keyData = new TextEncoder().encode(keyString.padEnd(32, '0').slice(0, 32));
  
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a string value
 */
export async function encrypt(value: string, env: any): Promise<string> {
  try {
    const key = await getEncryptionKey(env);
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
    const encodedValue = new TextEncoder().encode(value);

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedValue
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Return as base64
    return btoa(String.fromCharCode(...combined));
  } catch (error: any) {
    console.error('Encryption error:', error);
    throw new Error(`Failed to encrypt data: ${error.message}`);
  }
}

/**
 * Decrypt a string value
 */
export async function decrypt(encryptedValue: string, env: any): Promise<string> {
  try {
    const key = await getEncryptionKey(env);
    
    // Decode from base64
    const combined = Uint8Array.from(atob(encryptedValue), c => c.charCodeAt(0));
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );

    return new TextDecoder().decode(decrypted);
  } catch (error: any) {
    console.error('Decryption error:', error);
    throw new Error(`Failed to decrypt data: ${error.message}`);
  }
}
