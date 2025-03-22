/**
 * Web Authentication (WebAuthn) utilities for fingerprint authentication
 */

// Check if WebAuthn is supported in the current browser
export const isWebAuthnSupported = (): boolean => {
  return window && 
         window.PublicKeyCredential !== undefined && 
         typeof window.PublicKeyCredential === 'function';
};

// Check if the device has a fingerprint sensor
export const isFingerprintSupported = async (): Promise<boolean> => {
  if (!isWebAuthnSupported()) {
    return false;
  }
  
  // Check if platform authenticator is available (fingerprint, FaceID, etc.)
  return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
};

// Convert string to ArrayBuffer for WebAuthn API
const str2ab = (str: string): ArrayBuffer => {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0; i < str.length; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
};

// Convert ArrayBuffer to Base64 string for storage
const ab2base64 = (buffer: ArrayBuffer): string => {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
};

// Convert Base64 string back to ArrayBuffer
const base642ab = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// Generate a new credential for an employee (enrollment)
export const enrollFingerprint = async (employeeId: string, employeeName: string): Promise<string | null> => {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn is not supported in this browser');
  }
  
  try {
    // Create options for credential creation
    const publicKeyOptions: PublicKeyCredentialCreationOptions = {
      challenge: str2ab('enrollment-challenge-' + Math.random().toString(36).substring(2)),
      rp: {
        name: 'ClockedIn',
        id: window.location.hostname
      },
      user: {
        id: str2ab(employeeId),
        name: employeeName,
        displayName: employeeName
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 }, // ES256
        { type: 'public-key', alg: -257 } // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // Use platform authenticator (like fingerprint sensor)
        userVerification: 'required', // Require biometric verification
        requireResidentKey: true
      },
      timeout: 60000,
      attestation: 'none'
    };

    // Create credential using fingerprint
    const credential = await navigator.credentials.create({
      publicKey: publicKeyOptions
    }) as PublicKeyCredential;

    // Get attestation response
    const response = credential.response as AuthenticatorAttestationResponse;
    
    // Format and store credential ID
    const credentialId = ab2base64(credential.rawId);
    
    // Return the credential ID to be stored with the employee
    return credentialId;
  } catch (error) {
    console.error('Fingerprint enrollment failed:', error);
    throw error;
  }
};

// Verify employee identity using stored credential
export const verifyFingerprint = async (credentialId: string): Promise<boolean> => {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn is not supported in this browser');
  }
  
  try {
    // Create options for credential request
    const publicKeyOptions: PublicKeyCredentialRequestOptions = {
      challenge: str2ab('verification-challenge-' + Math.random().toString(36).substring(2)),
      allowCredentials: [{
        id: base642ab(credentialId),
        type: 'public-key',
        transports: ['internal']
      }],
      timeout: 60000,
      userVerification: 'required'
    };

    // Get credential using fingerprint
    const assertion = await navigator.credentials.get({
      publicKey: publicKeyOptions
    }) as PublicKeyCredential;

    // If we got here, verification was successful
    return true;
  } catch (error) {
    console.error('Fingerprint verification failed:', error);
    return false;
  }
};
