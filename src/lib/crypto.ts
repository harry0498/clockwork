import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

/** Generate a cryptographically random URL-safe token */
export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** Generate a 6-digit numeric code */
export function generateCode(): string {
  const num = randomBytes(4).readUInt32BE(0) % 1_000_000;
  return num.toString().padStart(6, "0");
}

/** SHA-256 hash a token for storage */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** AES-256-GCM encrypt */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  // Format: iv:authTag:ciphertext (all hex)
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

/** AES-256-GCM decrypt */
export function decrypt(data: string): string {
  const key = getEncryptionKey();
  const [ivHex, authTagHex, ciphertextHex] = data.split(":");
  if (!ivHex || !authTagHex || !ciphertextHex) {
    throw new Error("Invalid encrypted data format");
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(ivHex, "hex"),
  );
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(ciphertextHex, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

/** Generate 10 backup codes and return both raw and hashed versions */
export function generateBackupCodes(): {
  raw: string[];
  hashed: string[];
} {
  const raw: string[] = [];
  const hashed: string[] = [];
  for (let i = 0; i < 10; i++) {
    const code = randomBytes(4).toString("hex"); // 8-char hex codes
    raw.push(code);
    hashed.push(hashToken(code));
  }
  return { raw, hashed };
}

function getEncryptionKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      "ENCRYPTION_KEY must be a 64-character hex string (32 bytes)",
    );
  }
  return Buffer.from(hex, "hex");
}
