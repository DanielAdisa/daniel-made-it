import * as CryptoJS from 'crypto-js';

// Base encryption key - in a production app, consider environment variables
const BASE_KEY = "bookkeep-secure-encryption-key-2023";

/**
 * Encrypts data with AES encryption
 * @param data Any JSON-serializable data to encrypt
 * @param key Optional custom encryption key
 * @returns Encrypted string or null if encryption failed
 */
export const encryptData = (data: any, key: string = BASE_KEY): string | null => {
  try {
    if (!data) return null;
    const jsonString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, key).toString();
  } catch (error) {
    console.error("Encryption failed:", error);
    return null;
  }
};

/**
 * Decrypts AES encrypted data
 * @param encryptedData The encrypted string to decrypt
 * @param key Optional custom encryption key
 * @returns Decrypted data object or null if decryption failed
 */
export const decryptData = <T>(encryptedData: string | null, key: string = BASE_KEY): T | null => {
  try {
    if (!encryptedData) return null;
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString) as T;
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
};

/**
 * Creates a password-protected encrypted export
 * @param data Data object to encrypt
 * @param password User-provided password for encryption
 * @returns Encrypted string
 */
export const createEncryptedExport = (data: any, password: string): string => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), password).toString();
};

/**
 * Decrypts a password-protected export
 * @param encryptedText The encrypted export string
 * @param password User-provided password for decryption
 * @returns Decrypted data object or null if decryption failed
 */
export const decryptEncryptedExport = <T>(encryptedText: string, password: string): T | null => {
  try {
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedText, password);
    const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedText) return null;
    return JSON.parse(decryptedText) as T;
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
};
