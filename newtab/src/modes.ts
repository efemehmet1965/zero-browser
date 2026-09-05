import type { ModeDef, ModeId } from './types';

// ZERO mod sistemi — 4 calisma profili.
// Her mod: kendi kisa yol seti + vurgu rengi + panel widget'i.
// Kullanici kisa yollari (customs) moddan bagimsiz, tum modlarda gorunur.
// Dev 2: yeni mod eklerken buraya tanim + ModeDashboard'a widget ekler.

const std = (id: string, name: string, url: string, icon: string): ModeDef['builtins'][number] => ({
  id, name, url, icon, kind: 'builtin',
});

export const MODES: Record<ModeId, ModeDef> = {
  standard: {
    id: 'standard',
    name: 'Standart',
    tagline: 'Günlük kullanım: hızlı, sade, dengeli gizlilik.',
    dot: '#E30613',
    builtins: [
      std('sc-blog', 'ZERO Blog', 'https://example.com/blog', 'Z'),
      std('sc-x', 'X', 'https://x.com', 'X'),
      std('sc-github', 'GitHub', 'https://github.com', 'GH'),
      std('sc-notion', 'Notion', 'https://notion.so', 'N'),
      std('sc-drive', 'Drive', 'https://drive.google.com', 'D'),
      std('sc-mail', 'Mail', 'https://mail.google.com', 'M'),
    ],
  },
  developer: {
    id: 'developer',
    name: 'Developer',
    tagline: 'Araçlar elinin altında: doküman, paket, yerelde koşanlar.',
    dot: '#0A84FF',
    builtins: [
      std('dv-github', 'GitHub', 'https://github.com', 'GH'),
      std('dv-mdn', 'MDN', 'https://developer.mozilla.org', 'M'),
      std('dv-so', 'Stack Overflow', 'https://stackoverflow.com', 'S'),
      std('dv-npm', 'npm', 'https://npmjs.com', 'n'),
      std('dv-codepen', 'CodePen', 'https://codepen.io', 'C'),
      std('dv-local', 'Localhost', 'http://localhost:3000', 'L'),
    ],
  },
  cyber: {
    id: 'cyber',
    name: 'Cybersecurity',
    tagline: 'Güvenlik duruşu: şifreler, korumalar, doğrulama araçları.',
    dot: '#FF9F0A',
    builtins: [
      std('cb-obs', 'Observatory', 'https://observatory.mozilla.org', 'O'),
      std('cb-hibp', 'HaveIBeenPwned', 'https://haveibeenpwned.com', 'H'),
      std('cb-virustotal', 'VirusTotal', 'https://virustotal.com', 'V'),
      std('cb-cve', 'CVE Details', 'https://cvedetails.com', 'C'),
      std('cb-abuse', 'AbuseIPDB', 'https://abuseipdb.com', 'A'),
      std('cb-ssllabs', 'SSL Labs', 'https://ssllabs.com/ssltest', 'S'),
    ],
  },
  privacy: {
    id: 'privacy',
    name: 'Gizlilik',
    tagline: 'Maksimum gizlilik: iz yok, profil yok, soru yok.',
    dot: '#30D158',
    builtins: [
      std('pv-ddg', 'DuckDuckGo', 'https://duckduckgo.com', 'D'),
      std('pv-proton', 'Proton Mail', 'https://mail.proton.me', 'P'),
      std('pv-signal', 'Signal', 'https://signal.org', 'S'),
      std('pv-tor', 'Tor Project', 'https://torproject.org', 'T'),
      std('pv-privacyguides', 'Privacy Guides', 'https://privacyguides.org', 'G'),
      std('pv-mullvad', 'Mullvad', 'https://mullvad.net', 'M'),
    ],
  },
};

export const MODE_ORDER: ModeId[] = ['standard', 'developer', 'cyber', 'privacy'];
