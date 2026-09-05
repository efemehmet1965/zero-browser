import { useEffect, useMemo, useRef, useState } from 'react';
import { copyText } from './copy';
import { onSend } from './send';

// JSON Pro — dogrula + guzel yazdir + minify + hata satiri + JSONPath + curl.
// Tamami istemcide. Temel UI (JSON girisi / Formatla / Hata:) korunur.

interface JsonErr {
  msg: string;
  line: number;
  col: number;
}

function locateError(src: string, e: unknown): JsonErr {
  const msg = e instanceof Error ? e.message : 'gecersiz JSON';
  let pos = -1;
  const mPos = /position (\d+)/.exec(msg);
  const mLine = /line (\d+) column (\d+)/.exec(msg);
  if (mPos) {
    pos = Number(mPos[1]);
  } else if (mLine) {
    const line = Number(mLine[1]);
    const col = Number(mLine[2]);
    return { msg, line, col };
  }
  if (pos >= 0) {
    const upto = src.slice(0, pos);
    const line = upto.split('\n').length;
    const col = pos - (upto.lastIndexOf('\n') + 1) + 1;
    return { msg, line, col };
  }
  return { msg, line: 0, col: 0 };
}

function extractCurlBody(src: string): string | null {
  const t = src.trim();
  if (!t.startsWith('curl ')) return null;
  // -d / --data / --data-raw / --data-binary, tek/çift tırnaklı
  const m = /(?:-d|--data(?:-raw|-binary)?)\s+(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|(\S+))/.exec(t);
  if (!m) return null;
  const body = m[1] ?? m[2] ?? m[3] ?? '';
  try {
    JSON.parse(body);
    return body;
  } catch {
    return null;
  }
}

// Mini JSONPath: $ | $.a.b | $.a[0] | $.a[*] | $.* | $['anahtar']
function jsonPath(root: unknown, q: string): { ok: boolean; value?: unknown; err?: string } {
  const query = q.trim();
  if (!query.startsWith('$')) return { ok: false, err: '$ ile baslamali (ornek: $.data[0].email)' };
  let cur: unknown[] = [root];
  const rest = query.slice(1);
  const tokens: string[] = [];
  let buf = '';
  let inBracket = false;
  for (const ch of rest) {
    if (ch === '[') {
      if (buf) {
        tokens.push(buf);
        buf = '';
      }
      inBracket = true;
      buf += ch;
    } else if (ch === ']') {
      buf += ch;
      tokens.push(buf);
      buf = '';
      inBracket = false;
    } else if (ch === '.' && !inBracket) {
      if (buf) {
        tokens.push(buf);
        buf = '';
      }
    } else {
      buf += ch;
    }
  }
  if (buf) tokens.push(buf);
  try {
    for (const tok of tokens) {
      if (tok === '') continue;
      if (tok.startsWith('[')) {
        const inner = tok.slice(1, -1).trim().replace(/^['"]|['"]$/g, '');
        const next: unknown[] = [];
        for (const c of cur) {
          if (inner === '*') {
            if (Array.isArray(c)) next.push(...c);
            else if (c && typeof c === 'object') next.push(...Object.values(c));
          } else if (/^\d+$/.test(inner)) {
            if (Array.isArray(c)) next.push(c[Number(inner)]);
          } else if (c && typeof c === 'object' && inner in c) {
            next.push((c as Record<string, unknown>)[inner]);
          }
        }
        cur = next;
      } else if (tok === '*') {
        const next: unknown[] = [];
        for (const c of cur) {
          if (Array.isArray(c)) next.push(...c);
          else if (c && typeof c === 'object') next.push(...Object.values(c));
        }
        cur = next;
      } else {
        const next: unknown[] = [];
        for (const c of cur) {
          if (c && typeof c === 'object' && tok in c) next.push((c as Record<string, unknown>)[tok]);
        }
        cur = next;
      }
    }
    const value = cur.length === 1 ? cur[0] : cur;
    return { ok: true, value };
  } catch (e) {
    return { ok: false, err: e instanceof Error ? e.message : 'sorgu calismadi' };
  }
}

export default function JsonTool() {
  const [src, setSrc] = useState('{"zero":"just the web"}');
  const [err, setErr] = useState<JsonErr | null>(null);
  const [copied, setCopied] = useState(false);
  const [query, setQuery] = useState('$.zero');
  const [queryCopied, setQueryCopied] = useState(false);
  const [received, setReceived] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => onSend('json', (v) => {
    setSrc(v);
    setErr(null);
    setReceived(true);
    setTimeout(() => setReceived(false), 2000);
  }), []);

  const run = (fn: (v: unknown) => string) => {
    try {
      setSrc(fn(JSON.parse(src)));
      setErr(null);
    } catch (e) {
      setErr(locateError(src, e));
    }
  };

  const jumpToError = () => {
    if (!err || err.line <= 0 || !taRef.current) return;
    const lines = src.split('\n');
    let pos = 0;
    for (let i = 0; i < err.line - 1 && i < lines.length; i++) pos += lines[i].length + 1;
    pos += Math.max(0, err.col - 1);
    try {
      taRef.current.focus();
      taRef.current.setSelectionRange(pos, pos + 1);
    } catch {
      /* yoksay */
    }
  };

  const curlBody = useMemo(() => extractCurlBody(src), [src]);

  const parsed = useMemo(() => {
    try {
      return { value: JSON.parse(src) as unknown, ok: true as const };
    } catch {
      return { value: undefined, ok: false as const };
    }
  }, [src]);

  const qr = useMemo(() => {
    if (!query.trim()) return null;
    if (!parsed.ok) return { ok: false as const, err: 'once gecerli JSON gerekli' };
    return jsonPath(parsed.value, query);
  }, [parsed, query]);

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">JSON Formatlayıcı</h3>
      {received && <p className="mt-1 text-[12px] text-[#0A84FF]">Başka araçtan içerik alındı ↓</p>}
      <textarea
        ref={taRef}
        value={src}
        onChange={(e) => setSrc(e.target.value)}
        rows={5}
        spellCheck={false}
        aria-label="JSON girisi"
        className="mt-3 w-full rounded-lg border border-[#2A2A2A] bg-[#141414] p-3 font-mono text-[12px] text-white outline-none focus:border-[#0A84FF]"
      />
      {err && (
        <p className="mt-2 text-[12px] text-[#E30613]">
          Hata: {err.msg}
          {err.line > 0 && (
            <>
              {' '}(Satır {err.line}, sütun {err.col}){' '}
              <button onClick={jumpToError} className="underline hover:text-white">
                Git
              </button>
            </>
          )}
        </p>
      )}
      {curlBody !== null && !err && (
        <button
          onClick={() => {
            setSrc(JSON.stringify(JSON.parse(curlBody), null, 2));
            setErr(null);
          }}
          className="mt-2 rounded-lg border border-[#0A84FF] px-3 py-1.5 text-[12px] text-[#7DD3FC] hover:text-white"
        >
          curl body'yi ayıkla
        </button>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        <button onClick={() => run((v) => JSON.stringify(v, null, 2))} className="rounded-lg bg-[#0A84FF] px-3 py-1.5 text-[12px] font-semibold text-white hover:brightness-110">Formatla</button>
        <button onClick={() => run((v) => JSON.stringify(v))} className="rounded-lg border border-[#2A2A2A] px-3 py-1.5 text-[12px] text-[#CCC] hover:text-white">Minify</button>
        <button onClick={async () => { if (await copyText(src)) { setCopied(true); setTimeout(() => setCopied(false), 1200); } }} className="rounded-lg border border-[#2A2A2A] px-3 py-1.5 text-[12px] text-[#CCC] hover:text-white">
          {copied ? 'Kopyalandı ✓' : 'Kopyala'}
        </button>
      </div>
      <div className="mt-4 border-t border-[#1E1E1E] pt-3">
        <p className="text-[12px] text-[#888]">JSONPath sorgusu</p>
        <div className="mt-2 flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            spellCheck={false}
            aria-label="JSONPath sorgusu"
            placeholder="$.data[0].email"
            className="flex-1 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 font-mono text-[12px] text-white outline-none focus:border-[#0A84FF]"
          />
          <button
            onClick={async () => {
              if (qr && qr.ok) {
                const s = typeof qr.value === 'string' ? qr.value : JSON.stringify(qr.value, null, 2);
                if (await copyText(s ?? '')) {
                  setQueryCopied(true);
                  setTimeout(() => setQueryCopied(false), 1200);
                }
              }
            }}
            className="rounded-lg border border-[#2A2A2A] px-3 py-1.5 text-[12px] text-[#CCC] hover:text-white"
          >
            {queryCopied ? 'Kopyalandı ✓' : 'Sonucu kopyala'}
          </button>
        </div>
        {qr && (qr.ok
          ? <pre data-testid="jsonpath-result" className="mt-2 max-h-32 overflow-auto rounded-lg bg-[#141414] p-3 font-mono text-[12px] text-[#86EFAC]">{typeof qr.value === 'string' ? qr.value : JSON.stringify(qr.value, null, 2)}</pre>
          : <p className="mt-2 text-[12px] text-[#E30613]">Sorgu hatası: {qr.err}</p>)}
      </div>
    </div>
  );
}
