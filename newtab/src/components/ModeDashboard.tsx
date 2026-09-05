import { MODES } from '../modes';
import type { ModeId } from '../types';

// Mod pani: her moda ozel hizli eylemler.
// about: sayfalari window.location ile acmayi dener (engellenirse title'daki
// adresi elle yazabilirsiniz diye baslikta gosterir). Harici baglantilar
// normal sekmede acilir. Sahte "tarama animasyonu" yok — hepsi gercek hedef.

function go(url: string) {
  window.location.href = url;
}

function Action({ label, hint, onClick }: { label: string; hint?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={hint}
      className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-left text-[12px] text-[#CCC] transition hover:border-[#3A3A3A] hover:text-white"
    >
      <span className="block font-medium">{label}</span>
      {hint && <span className="block truncate text-[11px] text-[#666]">{hint}</span>}
    </button>
  );
}

function Ext({ label, url }: { label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-left text-[12px] text-[#CCC] transition hover:border-[#3A3A3A] hover:text-white"
    >
      <span className="block font-medium">{label}</span>
      <span className="block truncate text-[11px] text-[#666]">{url.replace('https://', '')}</span>
    </a>
  );
}

function Panel({ children, blurb }: { children: React.ReactNode; blurb: string }) {
  return (
    <div className="mt-8 w-full max-w-[640px] rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <p className="mb-3 text-[12px] text-[#888]">{blurb}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{children}</div>
    </div>
  );
}

export default function ModeDashboard({ mode }: { mode: ModeId }) {
  if (mode === 'standard') return null;
  const blurb = MODES[mode].tagline;

  if (mode === 'developer') {
    return (
      <Panel blurb={blurb}>
        <Action label="Eklenti hata ayiklama" hint="about:debugging" onClick={() => go('about:debugging')} />
        <Action label="Yapilandirma" hint="about:config" onClick={() => go('about:config')} />
        <Action label="Performans" hint="about:processes" onClick={() => go('about:processes')} />
        <Action label="Bellek" hint="about:memory" onClick={() => go('about:memory')} />
        <Action label="Ag istekleri" hint="about:networking" onClick={() => go('about:networking')} />
        <Action label="Destek bilgisi" hint="about:support" onClick={() => go('about:support')} />
      </Panel>
    );
  }

  if (mode === 'cyber') {
    return (
      <Panel blurb={blurb}>
        <Action label="Korumalar" hint="about:protections" onClick={() => go('about:protections')} />
        <Action label="Kayitli sifreler" hint="about:logins" onClick={() => go('about:logins')} />
        <Action label="Gizlilik ayarlari" hint="about:preferences#privacy" onClick={() => go('about:preferences#privacy')} />
        <Ext label="HaveIBeenPwned" url="https://haveibeenpwned.com" />
        <Ext label="Observatory" url="https://observatory.mozilla.org" />
        <Ext label="SSL Labs Test" url="https://www.ssllabs.com/ssltest/" />
      </Panel>
    );
  }

  return (
    <Panel blurb={blurb}>
      <Action label="Izleyici korumasi" hint="about:protections" onClick={() => go('about:protections')} />
      <Action label="Cerez ayarlari" hint="about:preferences#privacy" onClick={() => go('about:preferences#privacy')} />
      <Action label="Ozel pencere ipucu" hint="Ctrl+Shift+P" onClick={() => go('about:privatebrowsing')} />
      <Ext label="Privacy Guides" url="https://www.privacyguides.org" />
      <Ext label="Tor Project" url="https://www.torproject.org" />
      <Ext label="DuckDuckGo" url="https://duckduckgo.com" />
    </Panel>
  );
}
