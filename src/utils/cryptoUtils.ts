import Config from 'react-native-config';
import forge from 'node-forge';
import strings from '@constants/strings';

export interface EncryptPinResult {
  pin: string;
  encryptedPin: string;
}

export type RsaEncryptionScheme = 'RSA-OAEP' | 'RSAES-PKCS1-V1_5';

/**
 * Sanitizes and cleans a PEM key string by normalizing line breaks and removing wrapping quotes.
 * Matches backend cleaning logic:
 *   value.replaceAll('\r\n', '\n').replaceAll('\r', '\n').replaceAll(String.raw`\n`, '\n').replaceAll(String.raw`\r`, '\r').trim()
 */
export const cleanPem = (value?: string): string => {
  if (!value) return '';
  let key = value.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }
  return key
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .trim();
};

/**
 * Formats and sanitizes the PEM public key string directly from the env file (Config.RSA_PUBLIC_KEY).
 */
export const getRsaPublicKeyPem = (customKey?: string): string => {
  const rawKey = customKey || Config.RSA_PUBLIC_KEY || '';
  return cleanPem(rawKey);
};

/**
 * Encrypt a data string using RSA public key from .env.
 * Defaults to 'RSA-OAEP' (RSA_PKCS1_OAEP_PADDING with SHA-1 / MGF1 SHA-1) matching Node.js crypto.publicEncrypt.
 * @param data Data string to encrypt (e.g., PIN)
 * @param publicKeyPem Optional custom public key PEM (defaults to Config.RSA_PUBLIC_KEY from env)
 * @param scheme Encryption scheme (defaults to 'RSA-OAEP')
 * @returns Base64 encoded encrypted string
 */
export const encryptWithRsa = (
  data: string,
  publicKeyPem?: string,
  scheme: RsaEncryptionScheme = 'RSA-OAEP'
): string => {
  const pem = getRsaPublicKeyPem(publicKeyPem);
  if (!pem) {
    throw new Error(strings.transactionPin.rsaPublicKeyMissing);
  }
  const publicKey = forge.pki.publicKeyFromPem(pem);
  const dataUtf8 = forge.util.encodeUtf8(data);

  const encryptedBytes =
    scheme === 'RSA-OAEP'
      ? publicKey.encrypt(dataUtf8, 'RSA-OAEP', {
          md: forge.md.sha1.create(),
          mgf1: {
            md: forge.md.sha1.create(),
          },
        })
      : publicKey.encrypt(dataUtf8, 'RSAES-PKCS1-V1_5');

  return forge.util.encode64(encryptedBytes);
};

/**
 * Encrypts a PIN using RSA_PUBLIC_KEY from .env and returns an object containing both the original PIN and the encrypted PIN.
 * Uses RSA-OAEP padding to match backend crypto.publicEncrypt({ padding: crypto.constants.RSA_PKCS1_OAEP_PADDING }).
 * @param pin The plain PIN string
 * @param publicKeyPem Optional custom public key PEM (defaults to Config.RSA_PUBLIC_KEY from env)
 * @param scheme Encryption scheme (defaults to 'RSA-OAEP')
 * @returns { pin, encryptedPin }
 */
export const encryptPin = (
  pin: string,
  publicKeyPem?: string,
  scheme: RsaEncryptionScheme = 'RSA-OAEP'
): EncryptPinResult => {
  const encryptedPin = encryptWithRsa(pin, publicKeyPem, scheme);
  return {
    pin,
    encryptedPin,
  };
};

export default {
  cleanPem,
  getRsaPublicKeyPem,
  encryptWithRsa,
  encryptPin,
};
