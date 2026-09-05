// Tezgah operasyon kayıt defteri — saf fonksiyonlar, tamamen istemcide.
// CyberChef tarzı zincirin yapı taşları. run() throw ederse zincir o adımda durur.

export interface OpParamDef {
  key: string;
  label: string;
  def: string;
}

export interface OpDef {
  id: string;
  label: string;
  params: OpParamDef[];
  run(input: string, p: Record<string, string>): string;
}

const b64enc = (s: string): string => btoa(String.fromCharCode(...new TextEncoder().encode(s)));
const b64dec = (s: string): string => {
  const clean = s.trim().replace(/\s+/g, '');
  const bin = atob(clean.replace(/-/g, '+').replace(/_/g, '/'));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
};
const htmlEnc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
const htmlDec = (s: string): string => {
  const ta = document.createElement('textarea');
  ta.innerHTML = s;
  return ta.value;
};
const hexEnc = (s: string): string =>
  [...new TextEncoder().encode(s)].map((b) => b.toString(16).padStart(2, '0')).join('');
const hexDec = (s: string): string => {
  const clean = s.trim().replace(/^0x/i, '').replace(/\s+/g, '');
  if (!/^[0-9a-fA-F]*$/.test(clean) || clean.length % 2 !== 0) throw new Error('geçerli hex değil');
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return new TextDecoder().decode(bytes);
};

export const OPS: OpDef[] = [
  { id: 'base64-encode', label: 'Base64 kodla', params: [], run: (s) => b64enc(s) },
  { id: 'base64-decode', label: 'Base64 çöz', params: [], run: (s) => b64dec(s) },
  { id: 'url-encode', label: 'URL kodla', params: [], run: (s) => encodeURIComponent(s) },
  {
    id: 'url-decode', label: 'URL çöz', params: [],
    run: (s) => { try { return decodeURIComponent(s); } catch { throw new Error('URL çözülemedi'); } },
  },
  { id: 'url-double', label: 'Çift URL kodla', params: [], run: (s) => encodeURIComponent(encodeURIComponent(s)) },
  { id: 'html-encode', label: 'HTML kodla', params: [], run: (s) => htmlEnc(s) },
  { id: 'html-decode', label: 'HTML çöz', params: [], run: (s) => htmlDec(s) },
  { id: 'hex-encode', label: 'Hex kodla', params: [], run: (s) => hexEnc(s) },
  { id: 'hex-decode', label: 'Hex çöz', params: [], run: (s) => hexDec(s) },
  {
    id: 'unicode-escape', label: 'Unicode kaçış', params: [],
    run: (s) => [...s].map((c) => `\\u${c.codePointAt(0)!.toString(16).padStart(4, '0')}`).join(''),
  },
  {
    id: 'jwt-parse', label: 'JWT çöz', params: [],
    run: (s) => {
      const parts = s.trim().split('.');
      if (parts.length < 2) throw new Error('JWT değil (nokta-bölüm yok)');
      const payload = JSON.parse(b64dec(parts[1]));
      return JSON.stringify(payload, null, 2);
    },
  },
  {
    id: 'regex-extract', label: 'Regex ile çıkar', params: [{ key: 'pattern', label: 'Desen', def: '[\\w.+-]+@[\\w-]+\\.[\\w.]+' }],
    run: (s, p) => {
      const re = new RegExp(p.pattern || '(?:)', 'g');
      const out: string[] = [];
      for (const m of s.matchAll(re)) out.push(m[0]);
      return out.join('\n');
    },
  },
  {
    id: 'xor', label: 'XOR (hex çıktı)', params: [{ key: 'key', label: 'Anahtar', def: 'zero' }],
    run: (s, p) => {
      const k = p.key || 'zero';
      const data = new TextEncoder().encode(s);
      const kb = new TextEncoder().encode(k);
      return [...data].map((b, i) => (b ^ kb[i % kb.length]).toString(16).padStart(2, '0')).join('');
    },
  },
  {
    id: 'rot13', label: 'ROT13', params: [],
    run: (s) => s.replace(/[a-zA-Z]/g, (c) => {
      const base = c <= 'Z' ? 65 : 97;
      return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
    }),
  },
  { id: 'upper', label: 'BÜYÜK harf', params: [], run: (s) => s.toUpperCase() },
  { id: 'lower', label: 'küçük harf', params: [], run: (s) => s.toLowerCase() },
  { id: 'reverse', label: 'Ters çevir', params: [], run: (s) => [...s].reverse().join('') },
  {
    id: 'lines-unique', label: 'Satır tekille+sırala', params: [],
    run: (s) => [...new Set(s.split('\n').map((l) => l.trim()).filter(Boolean))].sort().join('\n'),
  },
];

export const OP_MAP: Record<string, OpDef> = Object.fromEntries(OPS.map((o) => [o.id, o]));

export interface RecipeStep {
  op: string;
  params: Record<string, string>;
}

/** Zinciri çalıştır — hata veren adımın numarasıyla döner. */
export function runRecipe(input: string, steps: RecipeStep[]): { output: string; steps: string[]; error: string | null } {
  const intermediates: string[] = [];
  let cur = input;
  for (let i = 0; i < steps.length; i++) {
    const st = steps[i];
    const op = OP_MAP[st.op];
    if (!op) return { output: '', steps: intermediates, error: `Adım ${i + 1}: bilinmeyen operasyon` };
    try {
      cur = op.run(cur, st.params);
      intermediates.push(cur);
    } catch (e) {
      return { output: '', steps: intermediates, error: `Adım ${i + 1} (${op.label}): ${e instanceof Error ? e.message : 'hata'}` };
    }
  }
  return { output: cur, steps: intermediates, error: null };
}
