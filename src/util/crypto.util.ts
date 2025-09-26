// --- Interfaces ---
export interface EncryptedPayload {
  cipherHex: string;
  key: string;
}

export interface IAES {
  encrypt(message: string): EncryptedPayload;
  decrypt(payload: EncryptedPayload): string;
}

// --- Helper functions ---
function xorInPlace(a: Uint8Array, b: Uint8Array) {
  for (let i = 0; i < a.length; i++) a[i] ^= b[i];
}

function pad(input: Uint8Array, blockSize = 16): Uint8Array {
  const padLength = blockSize - (input.length % blockSize);
  const result = new Uint8Array(input.length + padLength);
  result.set(input);
  result.fill(padLength, input.length);
  return result;
}

function unpad(input: Uint8Array): Uint8Array {
  const padLength = input[input.length - 1];
  return input.subarray(0, input.length - padLength);
}

function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function bytesToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

// --- Dummy AES block (toy for demonstration) ---
function aesEncryptBlock(block: Uint8Array, key: Uint8Array): Uint8Array {
  const state = new Uint8Array(block);
  xorInPlace(state, key.subarray(0, block.length));

  for (let round = 0; round < 10; round++) {
    for (let i = 0; i < state.length; i++) {
      state[i] = (state[i] + round) & 0xff;
    }
    xorInPlace(state, key.subarray(0, block.length));
  }

  return state;
}

function aesDecryptBlock(block: Uint8Array, key: Uint8Array): Uint8Array {
  const state = new Uint8Array(block);

  for (let round = 9; round >= 0; round--) {
    xorInPlace(state, key.subarray(0, block.length));
    for (let i = 0; i < state.length; i++) {
      state[i] = (state[i] - round + 256) & 0xff;
    }
  }

  xorInPlace(state, key.subarray(0, block.length));
  return state;
}

// --- Key generator 256-bit ---
function generateKey256(): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}<>?';
  let key = '';
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

// --- AES Class ---
export class AES implements IAES {
  private stringToBytes(str: string): Uint8Array {
    return new TextEncoder().encode(str);
  }

  private bytesToString(bytes: Uint8Array): string {
    return new TextDecoder().decode(bytes);
  }

  encrypt(message: string): EncryptedPayload {
    // Generate a fresh random 256-bit key for this encryption
    const key = generateKey256();
    const keyBytes = this.stringToBytes(key.padEnd(32, '0').slice(0, 32));

    // Convert message to bytes and pad
    const msgBytes = pad(this.stringToBytes(message), 16);
    const encrypted = new Uint8Array(msgBytes.length);

    // Encrypt each 16-byte block
    for (let i = 0; i < msgBytes.length; i += 16) {
      const block = aesEncryptBlock(msgBytes.subarray(i, i + 16), keyBytes);
      encrypted.set(block, i);
    }

    // Return both ciphertext and key used
    return {
      cipherHex: Array.from(encrypted)
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''),
      key,
    };
  }

  decrypt(payload: EncryptedPayload): string {
    const { cipherHex, key } = payload;
    const keyBytes = this.stringToBytes(key.padEnd(32, '0').slice(0, 32));

    // Convert hex ciphertext back to bytes
    const bytes = new Uint8Array(cipherHex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(cipherHex.substr(i * 2, 2), 16);
    }

    const decrypted = new Uint8Array(bytes.length);

    // Decrypt each 16-byte block
    for (let i = 0; i < bytes.length; i += 16) {
      const block = aesDecryptBlock(bytes.subarray(i, i + 16), keyBytes);
      decrypted.set(block, i);
    }

    return this.bytesToString(unpad(decrypted));
  }
}

// --- Example Usage ---
// const aes = new AES();
// const message =
//   'Hello Bob. how are you! Hello Bob. how are you! Hello Bob. how are you! Hello Bob. how are you!';
// const encrypted = aes.encrypt(message);
// console.log('Encrypted:', encrypted);

// const decrypted = aes.decrypt(encrypted);
// console.log('Decrypted:', decrypted);
