import { useEffect, useMemo, useState } from 'react';
import { copyText } from './copy';
import { OPS, OP_MAP, runRecipe, type RecipeStep } from './tezgahOps';

// Tezgah — CyberChef tarzı zincirleme operasyon mutfağı.
// Solda operasyon paleti, ortada recipe, altta girdi/çıktı. Canlı çalışır.

const JWT_SAMPLE =
  'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJaRVJPIiwiZXhwIjo5OTk5OTk5OTk5fQ.ZHVtbXktc2lnbmF0dXJl';

const RECIPES: { label: string; sample: string; steps: RecipeStep[] }[] = [
  {
    label: 'Base64 çöz',
    sample: 'aGVsbG8gZHVueWE=',
    steps: [{ op: 'base64-decode', params: {} }],
  },
  {
    label: 'JWT analiz',
    sample: JWT_SAMPLE,
    steps: [{ op: 'jwt-parse', params: {} }],
  },
  {
    label: 'Payload encode',
    sample: '<script>alert(1)</script>',
    steps: [{ op: 'url-encode', params: {} }],
  },
  {
    label: 'E-posta çıkar',
    sample: 'log: giris yapan ali@ornek.com ve veli@test.org hata verdi',
    steps: [{ op: 'regex-extract', params: { pattern: '[\\w.+-]+@[\\w-]+\\.[\\w.]+' } }],
  },
];

let uidCounter = 0;
const uid = () => `step_${++uidCounter}_${Date.now()}`;

interface Step extends RecipeStep {
  uid: string;
}

export default function Tezgah() {
  const [input, setInput] = useState('<script>alert(1)</script>');
  const [steps, setSteps] = useState<Step[]>([{ uid: uid(), op: 'url-encode', params: {} }]);
  const [copied, setCopied] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  // 150ms debounce ile canlı çalıştır
  const [debounced, setDebounced] = useState({ input, steps });
  useEffect(() => {
    const t = setTimeout(() => setDebounced({ input, steps }), 150);
    return () => clearTimeout(t);
  }, [input, steps]);
  const result = useMemo(
    () => runRecipe(debounced.input, debounced.steps),
    [debounced],
  );

  const addOp = (opId: string) => {
    const op = OP_MAP[opId];
    const params: Record<string, string> = {};
    for (const p of op?.params ?? []) params[p.key] = p.def;
    setSteps((s) => [...s, { uid: uid(), op: opId, params }]);
  };

  const move = (uid_: string, dir: -1 | 1) => {
    setSteps((s) => {
      const i = s.findIndex((x) => x.uid === uid_);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= s.length) return s;
      const next = [...s];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  return (
    <div className="rounded-2xl border border-[#FF9F0A] bg-[#0A0A0A] p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-bold text-white">
          Tezgah <span className="ml-1 rounded bg-[#FF9F0A] px-1.5 py-0.5 text-[10px] font-bold text-black">ZİNCİR</span>
        </h3>
        <span className="font-mono text-[12px] text-[#888]">{steps.length} adım</span>
      </div>
      <p className="mt-1 text-[12px] text-[#888]">Operasyonları sırala, girdi anında çıktıya dönüşsün. Yetkili testlerde kullan.</p>

      <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Operasyon paleti">
        {OPS.map((o) => (
          <button
            key={o.id}
            onClick={() => addOp(o.id)}
            aria-label={`${o.label} ekle`}
            title={o.label}
            className="rounded-full border border-[#2A2A2A] px-2.5 py-1 font-mono text-[11px] text-[#AAA] hover:border-[#FF9F0A] hover:text-white"
          >
            + {o.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Hazır recipe'ler">
        {RECIPES.map((r) => (
          <button
            key={r.label}
            onClick={() => {
              setInput(r.sample);
              setSteps(r.steps.map((s) => ({ ...s, params: { ...s.params }, uid: uid() })));
            }}
            className="rounded-lg bg-[#1A1A1A] px-3 py-1.5 text-[12px] text-[#FF9F0A] hover:bg-[#242424]"
          >
            ▶ {r.label}
          </button>
        ))}
      </div>

      {steps.length > 0 && (
        <ol className="mt-3 space-y-1.5">
          {steps.map((st, i) => {
            const op = OP_MAP[st.op];
            return (
              <li key={st.uid} className="flex items-center gap-2 rounded-lg bg-[#141414] px-3 py-1.5">
                <span className="font-mono text-[11px] text-[#FF9F0A]">{i + 1}.</span>
                <span className="min-w-0 flex-1 truncate text-[12px] text-white">{op?.label ?? st.op}</span>
                {op?.params.map((p) => (
                  <input
                    key={p.key}
                    value={st.params[p.key] ?? p.def}
                    onChange={(e) => setSteps((s) => s.map((x) => (x.uid === st.uid
                      ? { ...x, params: { ...x.params, [p.key]: e.target.value } }
                      : x)))}
                    aria-label={`${op.label} ${p.label}`}
                    spellCheck={false}
                    className="w-40 rounded border border-[#2A2A2A] bg-[#1A1A1A] px-2 py-1 font-mono text-[11px] text-white outline-none focus:border-[#FF9F0A]"
                  />
                ))}
                <button onClick={() => move(st.uid, -1)} aria-label="Adımı yukarı taşı" className="px-1 text-[#666] hover:text-white">↑</button>
                <button onClick={() => move(st.uid, 1)} aria-label="Adımı aşağı taşı" className="px-1 text-[#666] hover:text-white">↓</button>
                <button
                  onClick={() => setSteps((s) => s.filter((x) => x.uid !== st.uid))}
                  aria-label="Adımı sil"
                  className="px-1 text-[#666] hover:text-[#E30613]"
                >
                  ×
                </button>
              </li>
            );
          })}
        </ol>
      )}

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={3}
        spellCheck={false}
        aria-label="Tezgah girdisi"
        className="mt-3 w-full rounded-lg border border-[#2A2A2A] bg-[#141414] p-3 font-mono text-[12px] text-white outline-none focus:border-[#FF9F0A]"
      />
      {result.error
        ? <p data-testid="tezgah-error" className="mt-2 text-[12px] text-[#E30613]">{result.error}</p>
        : <>
            <pre data-testid="tezgah-output" className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-[#141414] p-3 font-mono text-[12px] text-[#86EFAC]">{result.output || '(çıktı yok)'}</pre>
            <div className="mt-2 flex gap-2">
              <button
                onClick={async () => { if (await copyText(result.output)) { setCopied(true); setTimeout(() => setCopied(false), 1200); } }}
                className="rounded-lg border border-[#2A2A2A] px-3 py-1.5 text-[12px] text-[#CCC] hover:text-white"
              >
                {copied ? 'Kopyalandı ✓' : 'Çıktıyı kopyala'}
              </button>
              {result.steps.length > 1 && (
                <button
                  onClick={() => setShowSteps((v) => !v)}
                  className="rounded-lg border border-[#2A2A2A] px-3 py-1.5 text-[12px] text-[#CCC] hover:text-white"
                >
                  {showSteps ? 'Adımları gizle' : 'Adım adım göster'}
                </button>
              )}
            </div>
            {showSteps && result.steps.length > 1 && (
              <ol data-testid="tezgah-steps" className="mt-2 space-y-1">
                {result.steps.map((s, i) => (
                  <li key={i} className="truncate rounded bg-[#141414] px-3 py-1 font-mono text-[11px] text-[#666]">
                    <span className="text-[#FF9F0A]">{i + 1}.</span> {s.slice(0, 120)}
                  </li>
                ))}
              </ol>
            )}
          </>}
    </div>
  );
}
