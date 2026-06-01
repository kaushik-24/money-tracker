# Encryption SOP — AES-256-GCM

## Overview

Sensitive financial fields are encrypted at the application level before being stored in PostgreSQL. This ensures data is never in plaintext at rest.

## Algorithm

- **Cipher**: AES-256-GCM
- **Key size**: 32 bytes (256 bits)
- **IV size**: 16 bytes (random, stored with ciphertext)
- **Auth tag**: 16 bytes (appended to ciphertext)
- **Output format**: Hex string — `iv:authTag:ciphertext`

## Encrypted Fields

| Model | Fields |
|-------|--------|
| Account | balance |
| Transaction | amount, description |
| Investment | purchasePrice, currentPrice |

## Key Management

- **Encryption key**: `ENCRYPTION_KEY` in `.env`
- **Format**: 64-character hex string (32 bytes)
- **Generate**: `npx tsx tools/encrypt-keygen.ts`

## Encrypt/Decrypt Functions

Encryption and decryption are handled by `src/lib/encryption.ts`. This module is imported by both tools and Next.js API routes.

### Encrypt
```
Input:  plaintext (string)
Output: hex string (iv:authTag:ciphertext)
```

### Decrypt
```
Input:  hex string (iv:authTag:ciphertext)
Output: plaintext (string)
```

## Error Handling

- If `ENCRYPTION_KEY` is missing or invalid, throw a clear error at startup.
- Decryption of tampered data throws `UnsupportedState` or `VerifyError` — catch these and log, do not crash.
- If decryption fails, return null/undefined so the UI can show "⚠️ Unable to decrypt".

## Testing

Test encryption round-trip:
```bash
npx tsx -e "
const { encrypt, decrypt } = require('./src/lib/encryption');
const encrypted = encrypt('Hello, World!');
console.log('Encrypted:', encrypted);
const decrypted = decrypt(encrypted);
console.log('Decrypted:', decrypted);
"
```
