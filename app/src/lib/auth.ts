// Simple djb2 hash used only when crypto.subtle is unavailable (HTTP context).
// In production (HTTPS / Vercel) crypto.subtle is always available.
function djb2Hash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash >>> 0; // keep as uint32
  }
  return hash.toString(16).padStart(8, '0').repeat(8);
}

export async function hashPassword(password: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const enc = new TextEncoder().encode(password);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Fallback for non-secure HTTP contexts (local dev without HTTPS)
  return djb2Hash(password);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return (await hashPassword(password)) === hash;
}
