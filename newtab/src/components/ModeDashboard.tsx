import { MODES } from '../modes';
import type { ModeId } from '../types';
import AgeTool from './tools/AgeTool';
import Base64Tool from './tools/Base64Tool';
import BaseConverter from './tools/BaseConverter';
import BmiTool from './tools/BmiTool';
import BreachCheck from './tools/BreachCheck';
import CalcTool from './tools/CalcTool';
import ChmodTool from './tools/ChmodTool';
import ColorTool from './tools/ColorTool';
import CountdownTool from './tools/CountdownTool';
import CronTool from './tools/CronTool';
import CssUnits from './tools/CssUnits';
import CvssCalculator from './tools/CvssCalculator';
import DateDiffTool from './tools/DateDiffTool';
import DiffTool from './tools/DiffTool';
import DorkGenerator from './tools/DorkGenerator';
import EmailHeaders from './tools/EmailHeaders';
import EncoderLab from './tools/EncoderLab';
import EncryptTool from './tools/EncryptTool';
import FileAnalyzer from './tools/FileAnalyzer';
import GitignoreTool from './tools/GitignoreTool';
import GunPlani from './tools/GunPlani';
import HashTool from './tools/HashTool';
import JsonTool from './tools/JsonTool';
import JwtTool from './tools/JwtTool';
import KdvTool from './tools/KdvTool';
import LeakPanel from './tools/LeakPanel';
import LinkFilter from './tools/LinkFilter';
import LfiGenerator from './tools/LfiGenerator';
import LoanTool from './tools/LoanTool';
import LoremTool from './tools/LoremTool';
import MarkdownTool from './tools/MarkdownTool';
import PasswordGenerator from './tools/PasswordGenerator';
import PayloadLibrary from './tools/PayloadLibrary';
import PercentTool from './tools/PercentTool';
import PhishingCheck from './tools/PhishingCheck';
import Pomodoro from './tools/Pomodoro';
import Privesc from './tools/Privesc';
import QuickNote from './tools/QuickNote';
import RandomPicker from './tools/RandomPicker';
import Stopwatch from './tools/Stopwatch';
import TextTools from './tools/TextTools';
import TodoTool from './tools/TodoTool';
import SqliHelper from './tools/SqliHelper';
import RegexTool from './tools/RegexTool';
import ReverseShell from './tools/ReverseShell';
import SubnetTool from './tools/SubnetTool';
import Tezgah from './tools/Tezgah';
import TimestampTool from './tools/TimestampTool';
import UnitConverter from './tools/UnitConverter';
import UrlCleaner from './tools/UrlCleaner';
import UrlParserTool from './tools/UrlParserTool';
import UuidTool from './tools/UuidTool';
import XssGenerator from './tools/XssGenerator';

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
  const blurb = MODES[mode].tagline;

  if (mode === 'standard') {
    return (
      <Shell blurb={blurb}>
        <GunPlani />
        <UnitConverter />
        <QuickNote />
        <Pomodoro />
        <CalcTool />
        <TextTools />
        <PercentTool />
        <BmiTool />
        <KdvTool />
        <TodoTool />
        <CountdownTool />
        <RandomPicker />
        <AgeTool />
        <Stopwatch />
        <LoanTool />
        <DateDiffTool />
      </Shell>
    );
  }

  if (mode === 'developer') {
    return (
      <Shell blurb={blurb}>
        <JsonTool />
        <Base64Tool />
        <JwtTool />
        <TimestampTool />
        <UuidTool />
        <RegexTool />
        <LoremTool />
        <ColorTool />
        <CronTool />
        <BaseConverter />
        <CssUnits />
        <DiffTool />
        <MarkdownTool />
        <ChmodTool />
        <GitignoreTool />
        <UrlParserTool />
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
        <Tezgah />
        <DorkGenerator />
        <XssGenerator />
        <SqliHelper />
        <EncoderLab />
        <LfiGenerator />
        <PayloadLibrary />
        <JwtTool />
        <PasswordGenerator />
        <HashTool />
        <SubnetTool />
        <CvssCalculator />
        <ReverseShell />
        <FileAnalyzer />
        <EmailHeaders />
        <Privesc />
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
      <LinkFilter />
      <UrlCleaner />
      <EncryptTool />
      <BreachCheck />
      <PhishingCheck />
      <PasswordGenerator />
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
