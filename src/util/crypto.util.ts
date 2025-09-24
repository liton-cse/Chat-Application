// cryptoAES.ts

// --- Interfaces ---
export interface IAES {
  encrypt(message: string, key: string): string;
  decrypt(cipherHex: string, key: string): string;
}

// --- Helper Functions ---
function xor(a: number[], b: number[]): number[] {
  const result: number[] = [];
  for (let i = 0; i < a.length; i++) result.push(a[i] ^ b[i]);
  return result;
}

function pad(input: string): string {
  const blockSize = 16;
  const padLength = blockSize - (input.length % blockSize);
  return input + String.fromCharCode(padLength).repeat(padLength);
}

function unpad(input: string): string {
  const padLength = input.charCodeAt(input.length - 1);
  return input.slice(0, -padLength);
}

function stringToBytes(str: string): number[] {
  return Array.from(str).map(c => c.charCodeAt(0));
}

function bytesToString(bytes: number[]): string {
  return String.fromCharCode(...bytes);
}

// --- Dummy AES Block Functions ---
function aesEncryptBlock(block: number[], key: number[]): number[] {
  let state = xor(block, key);
  for (let round = 0; round < 10; round++) {
    state = state.map(b => (b + round) % 256);
    state = xor(state, key);
  }
  return state;
}

function aesDecryptBlock(block: number[], key: number[]): number[] {
  let state = block;
  for (let round = 9; round >= 0; round--) {
    state = xor(state, key);
    state = state.map(b => (b - round + 256) % 256);
  }
  state = xor(state, key);
  return state;
}

// --- AES Class ---
export class AES implements IAES {
  encrypt(message: string, keyStr: string): string {
    const key = stringToBytes(keyStr.padEnd(16, '0').slice(0, 16));
    message = pad(message);
    const bytes = stringToBytes(message);
    const encrypted: number[] = [];

    for (let i = 0; i < bytes.length; i += 16) {
      const block = bytes.slice(i, i + 16);
      encrypted.push(...aesEncryptBlock(block, key));
    }

    return encrypted.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  decrypt(cipherHex: string, keyStr: string): string {
    const key = stringToBytes(keyStr.padEnd(16, '0').slice(0, 16));
    const bytes: number[] = [];

    for (let i = 0; i < cipherHex.length; i += 2) {
      bytes.push(parseInt(cipherHex.substr(i, 2), 16));
    }

    const decrypted: number[] = [];

    for (let i = 0; i < bytes.length; i += 16) {
      const block = bytes.slice(i, i + 16);
      decrypted.push(...aesDecryptBlock(block, key));
    }

    return unpad(bytesToString(decrypted));
  }
}

// --- Example Usage ---
// const aes = new AES();
// const message =
//   'Hello Bob. how are you! Hello Bob. how are you! Hello Bob. how are you! Hello Bob. how are you!';
// const key = 'secretkey123456';

// const encrypted = aes.encrypt(message, key);
// console.log('Encrypted:', encrypted);

// const decrypted = aes.decrypt(encrypted, key);
// console.log('Decrypted:', decrypted);
