import { useState } from 'react';
import { copyText } from './copy';

// .gitignore ureteci — dil/ortam sablonlari -> tek dosya, kopyala.
const TPL: Record<string, string> = {
  Node: 'node_modules/\ndist/\n.env\nnpm-debug.log\n',
  Python: '__pycache__/\n*.pyc\n.venv/\n.pytest_cache/\n*.egg-info/\n',
  Java: 'target/\n*.class\n*.jar\n.gradle/\n',
  Go: 'bin/\n*.exe\nvendor/\n',
  Rust: 'target/\nCargo.lock\n',
  Windows: 'Thumbs.db\nDesktop.ini\n$RECYCLE.BIN/\n',
  macOS: '.DS_Store\n.AppleDouble\n',
  Linux: '*~\n.nfs*\n',
  VSCode: '.vscode/\n',
  JetBrains: '.idea/\n*.iml\n',
};

export default function GitignoreTool() {
  const [on, setOn] = useState<Record<string, boolean>>({ Node: true });
  const [copied, setCopied] = useState(false);
  const out = Object.entries(TPL).filter(([k]) => on[k]).map(([k, v]) => `# ${k}\n${v}`).join('\n');

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">.gitignore Üreteci</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {Object.keys(TPL).map((k) => (
          <label key={k} className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#2A2A2A] px-3 py-1 font-mono text-[12px] text-[#AAA]">
            <input type="checkbox" checked={!!on[k]} onChange={() => setOn((s) => ({ ...s, [k]: !s[k] }))} className="accent-[#0A84FF]" />
            {k}
          </label>
        ))}
      </div>
      <pre className="mt-3 max-h-44 overflow-y-auto rounded-lg bg-[#141414] p-3 font-mono text-[12px] text-[#DDD]" data-testid="gitignore-output">{out || '# sablon sec'}</pre>
      <button onClick={async () => { if (await copyText(out)) { setCopied(true); setTimeout(() => setCopied(false), 1200); } }}
        className="mt-2 rounded-lg border border-[#2A2A2A] px-3 py-1.5 text-[12px] text-[#CCC] hover:text-white">
        {copied ? 'Kopyalandı ✓' : '.gitignore olarak kopyala'}
      </button>
    </div>
  );
}
