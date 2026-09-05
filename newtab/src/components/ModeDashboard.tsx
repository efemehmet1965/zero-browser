import { MODES } from '../modes';
import type { ModeId } from '../types';
import Base64Tool from './tools/Base64Tool';
import DorkGenerator from './tools/DorkGenerator';
import EncryptTool from './tools/EncryptTool';
import HashTool from './tools/HashTool';
import JsonTool from './tools/JsonTool';
import JwtTool from './tools/JwtTool';
import LeakPanel from './tools/LeakPanel';
import PasswordGenerator from './tools/PasswordGenerator';
import RegexTool from './tools/RegexTool';
import SubnetTool from './tools/SubnetTool';
import TimestampTool from './tools/TimestampTool';
import UrlCleaner from './tools/UrlCleaner';
import UuidTool from './tools/UuidTool';

// Mod panosu: her modda GERCEK CALISAN araclar (tamami istemcide, ag yok).
// Developer: JSON + Base64. Cyber: Dork Generator + sifre. Privacy: URL temizleyici.
// Alt satirda ilgili about:/harici hizli baglantilar.

function go(url: string) {
  window.location.href = url;
}

function Mini({ label, hint, onClick }: { label: string; hint?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={hint}
      className="rounded-lg border border-[#2A2A2A] bg-[#141414] px-3 py-1.5 text-left text-[12px] text-[#AAA] transition hover:border-[#3A3A3A] hover:text-white"
    >
      {label}
    </button>
  );
}

function MiniExt({ label, url }: { label: string; url: string }) {
  return (
    <a href={url} target="_blank" rel="noreferrer"
      className="rounded-lg border border-[#2A2A2A] bg-[#141414] px-3 py-1.5 text-left text-[12px] text-[#AAA] transition hover:border-[#3A3A3A] hover:text-white">
      {label}
    </a>
  );
}

function Shell({ blurb, children }: { blurb: string; children: React.ReactNode }) {
  return (
    <div className="mt-8 w-full max-w-[680px]">
      <p className="mb-3 text-center text-[12px] text-[#777]">{blurb}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Links({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap justify-center gap-2 pt-1">{children}</div>;
}

export default function ModeDashboard({ mode }: { mode: ModeId }) {
  if (mode === 'standard') return null;
  const blurb = MODES[mode].tagline;

  if (mode === 'developer') {
    return (
      <Shell blurb={blurb}>
        <JsonTool />
        <Base64Tool />
        <JwtTool />
        <TimestampTool />
        <UuidTool />
        <RegexTool />
        <Links>
          <Mini label="about:debugging" onClick={() => go('about:debugging')} />
          <Mini label="about:config" onClick={() => go('about:config')} />
          <Mini label="about:processes" onClick={() => go('about:processes')} />
          <Mini label="about:memory" onClick={() => go('about:memory')} />
          <MiniExt label="MDN ↗" url="https://developer.mozilla.org" />
        </Links>
      </Shell>
    );
  }

  if (mode === 'cyber') {
    return (
      <Shell blurb={blurb}>
        <DorkGenerator />
        <PasswordGenerator />
        <HashTool />
        <SubnetTool />
        <Links>
          <Mini label="about:protections" onClick={() => go('about:protections')} />
          <Mini label="about:logins" onClick={() => go('about:logins')} />
          <MiniExt label="HaveIBeenPwned ↗" url="https://haveibeenpwned.com" />
          <MiniExt label="Observatory ↗" url="https://observatory.mozilla.org" />
        </Links>
      </Shell>
    );
  }

  return (
    <Shell blurb={blurb}>
      <UrlCleaner />
      <EncryptTool />
      <LeakPanel />
      <Links>
        <Mini label="about:protections" onClick={() => go('about:protections')} />
        <Mini label="about:preferences#privacy" onClick={() => go('about:preferences#privacy')} />
        <MiniExt label="Privacy Guides ↗" url="https://www.privacyguides.org" />
        <MiniExt label="Tor Project ↗" url="https://www.torproject.org" />
      </Links>
    </Shell>
  );
}
