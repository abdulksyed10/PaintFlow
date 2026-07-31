function bufferToHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashPassword(password: string) {
  const encodedPassword = new TextEncoder().encode(password);
  const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", encodedPassword);

  return `sha256:${bufferToHex(hashBuffer)}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const hashedPassword = await hashPassword(password);
  return hashedPassword === storedHash;
}
