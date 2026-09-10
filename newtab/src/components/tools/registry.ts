import { lazy, type ComponentType } from 'react';
import type { ModeId } from '../../types';

const AgeTool = lazy(() => import('./AgeTool'));
const Base64Tool = lazy(() => import('./Base64Tool'));
const BaseConverter = lazy(() => import('./BaseConverter'));
const BmiTool = lazy(() => import('./BmiTool'));
const BreachCheck = lazy(() => import('./BreachCheck'));
const CalcTool = lazy(() => import('./CalcTool'));
const ChmodTool = lazy(() => import('./ChmodTool'));
const ColorTool = lazy(() => import('./ColorTool'));
const CountdownTool = lazy(() => import('./CountdownTool'));
const CronTool = lazy(() => import('./CronTool'));
const CssUnits = lazy(() => import('./CssUnits'));
const CvssCalculator = lazy(() => import('./CvssCalculator'));
const DateDiffTool = lazy(() => import('./DateDiffTool'));
const DiffTool = lazy(() => import('./DiffTool'));
const DorkGenerator = lazy(() => import('./DorkGenerator'));
const EmailHeaders = lazy(() => import('./EmailHeaders'));
const EncoderLab = lazy(() => import('./EncoderLab'));
const EncryptTool = lazy(() => import('./EncryptTool'));
const FileAnalyzer = lazy(() => import('./FileAnalyzer'));
const GitignoreTool = lazy(() => import('./GitignoreTool'));
const GunPlani = lazy(() => import('./GunPlani'));
const HashTool = lazy(() => import('./HashTool'));
const JsonTool = lazy(() => import('./JsonTool'));
const JwtTool = lazy(() => import('./JwtTool'));
const KdvTool = lazy(() => import('./KdvTool'));
const LeakPanel = lazy(() => import('./LeakPanel'));
const LinkFilter = lazy(() => import('./LinkFilter'));
const LfiGenerator = lazy(() => import('./LfiGenerator'));
const LoanTool = lazy(() => import('./LoanTool'));
const LoremTool = lazy(() => import('./LoremTool'));
const MarkdownTool = lazy(() => import('./MarkdownTool'));
const PasswordGenerator = lazy(() => import('./PasswordGenerator'));
const PayloadLibrary = lazy(() => import('./PayloadLibrary'));
const PercentTool = lazy(() => import('./PercentTool'));
const PhishingCheck = lazy(() => import('./PhishingCheck'));
const Pomodoro = lazy(() => import('./Pomodoro'));
const Privesc = lazy(() => import('./Privesc'));
const QuickNote = lazy(() => import('./QuickNote'));
const RandomPicker = lazy(() => import('./RandomPicker'));
const Stopwatch = lazy(() => import('./Stopwatch'));
const TextTools = lazy(() => import('./TextTools'));
const TodoTool = lazy(() => import('./TodoTool'));
const SqliHelper = lazy(() => import('./SqliHelper'));
const RegexTool = lazy(() => import('./RegexTool'));
const ReverseShell = lazy(() => import('./ReverseShell'));
const SubnetTool = lazy(() => import('./SubnetTool'));
const Tezgah = lazy(() => import('./Tezgah'));
const TimestampTool = lazy(() => import('./TimestampTool'));
const UnitConverter = lazy(() => import('./UnitConverter'));
const UrlCleaner = lazy(() => import('./UrlCleaner'));
const UrlParserTool = lazy(() => import('./UrlParserTool'));
const UuidTool = lazy(() => import('./UuidTool'));
const XssGenerator = lazy(() => import('./XssGenerator'));

// Araç kayıt defteri: mod -> araç listesi. Pano özeti, hamburger menü,
// komut paleti ve tekil araç görünümü buradan beslenir.
// Araçlar lazy'dir: ilk açılış paketi küçük kalır, araç açılışta yüklenir
// (tekil görünümdeki Suspense yedeğiyle). id'ler mod içinde benzersiz.
export interface ToolDef {
  id: string;
  label: string;
  desc: string;
  C: ComponentType;
}

const t = (id: string, label: string, desc: string, C: ComponentType): ToolDef => ({ id, label, desc, C });

export const TOOLS: Record<ModeId, ToolDef[]> = {
  standard: [
    t('gunplani', 'Gün Planı', 'Açık maddeler, odak dakikası, hedefe kalan gün', GunPlani),
    t('unit', 'Birim Çevirici', 'Uzunluk, ağırlık, sıcaklık, veri', UnitConverter),
    t('quicknote', 'Hızlı Not', 'Anında not al, restart sonrası durur', QuickNote),
    t('pomodoro', 'Pomodoro', 'Odak ve mola döngüleri', Pomodoro),
    t('calc', 'Hesap Merkezi', 'Dört işlem, yüzde, KDV', CalcTool),
    t('text', 'Metin Araçları', 'Sayaç, büyük/küçük harf, başlık', TextTools),
    t('percent', 'Yüzde', 'Yüzde hesabı ve fark', PercentTool),
    t('bmi', 'VKİ', 'Vücut kitle indeksi', BmiTool),
    t('kdv', 'KDV', 'Dahil ve hariç tutar', KdvTool),
    t('todo', 'Yapılacaklar', 'Liste, tikle bitir', TodoTool),
    t('countdown', 'Geri Sayım', 'Hedefe kalan süre, canlı', CountdownTool),
    t('picker', 'Rastgele Seçici', 'Kura ve çekiliş', RandomPicker),
    t('age', 'Yaş Hesaplayıcı', 'Yaş, ay, gün ve toplam gün', AgeTool),
    t('stopwatch', 'Kronometre', 'Tur ve sıfırlama', Stopwatch),
    t('loan', 'Kredi', 'Aylık taksit hesabı', LoanTool),
    t('datediff', 'Tarih Farkı', 'İki tarih arası gün, hafta, ay', DateDiffTool),
  ],
  developer: [
    t('json', 'JSON', 'Doğrula, güzelleştir, JSONPath, curl', JsonTool),
    t('base64', 'Base64', 'Kodla ve çöz', Base64Tool),
    t('jwt', 'JWT', 'Header ve payload çözümle', JwtTool),
    t('timestamp', 'Zaman Damgası', 'Unix zamanı ve tarih dönüşümü', TimestampTool),
    t('uuid', 'UUID', 'Benzersiz kimlik üret', UuidTool),
    t('regex', 'Regex', 'Eşleşme, değiştirme, açıklama', RegexTool),
    t('lorem', 'Lorem Ipsum', 'Yer tutucu metin üret', LoremTool),
    t('color', 'Renk', 'HEX, RGB, HSL dönüşümü', ColorTool),
    t('cron', 'Cron', 'Zamanlama ifadesi açıklaması', CronTool),
    t('baseconv', 'Taban Çevirici', 'Onluk, onaltılık, ikilik, sekizlik', BaseConverter),
    t('cssunits', 'CSS Birimleri', 'px ve rem dönüşümü', CssUnits),
    t('diff', 'Fark', 'Satır satır metin karşılaştırma', DiffTool),
    t('markdown', 'Markdown', 'Önizleme ve dönüştürme', MarkdownTool),
    t('chmod', 'Chmod', 'Dosya izni hesaplayıcı', ChmodTool),
    t('gitignore', 'Gitignore', 'Hazır şablon üret', GitignoreTool),
    t('urlparser', 'URL Çözümleyici', 'Protokol, host, parametre, hash', UrlParserTool),
  ],
  cyber: [
    t('tezgah', 'Tezgah', 'Kodlama ve çözümleme zincirleri', Tezgah),
    t('dork', 'Dork Üreteci', 'Arama operatörleri', DorkGenerator),
    t('xss', 'XSS Üreteci', 'Test payload varyantları', XssGenerator),
    t('sqli', 'SQLi Yardımcısı', 'Bypass ve UNION üretici', SqliHelper),
    t('encoder', 'Kodlama Lab', 'URL, HTML, Base64, hex, unicode', EncoderLab),
    t('lfi', 'LFI Üreteci', 'Dizin traversal kalıpları', LfiGenerator),
    t('payload', 'Payload Kütüphanesi', 'SSTI, XXE, SSRF koleksiyonu', PayloadLibrary),
    t('jwt', 'JWT', 'Header ve payload çözümle', JwtTool),
    t('password', 'Şifre Üreteci', 'Güçlü parola ve entropi', PasswordGenerator),
    t('hash', 'Hash', 'SHA özetleri ve uzunluk tahmini', HashTool),
    t('subnet', 'Subnet', 'Ağ, broadcast, host hesabı', SubnetTool),
    t('cvss', 'CVSS', 'Zafiyet skoru hesaplayıcı', CvssCalculator),
    t('revshell', 'Reverse Shell', 'IP ve porta göre komut üret', ReverseShell),
    t('fileanalyzer', 'Dosya Analizi', 'Tür, boyut, entropi, SHA-256', FileAnalyzer),
    t('emailheaders', 'E-posta Başlıkları', 'Received, SPF, DKIM, DMARC', EmailHeaders),
    t('privesc', 'Privesc', 'Linux ve Windows yetki denetimi', Privesc),
  ],
  privacy: [
    t('linkfilter', 'Bağlantı Süzgeci', 'Temizle, oltalama ve yönlendirme denetimi', LinkFilter),
    t('urlcleaner', 'URL Temizleyici', 'İzleyici parametrelerini sök', UrlCleaner),
    t('encrypt', 'Şifreleme', 'AES-GCM ile kilitle ve çöz', EncryptTool),
    t('breach', 'Sızıntı Denetimi', 'Parolan sızdı mı?', BreachCheck),
    t('phishing', 'Oltalama Denetimi', 'Şüpheli bağlantı analizi', PhishingCheck),
    t('password', 'Şifre Üreteci', 'Güçlü parola ve entropi', PasswordGenerator),
    t('leak', 'Sızıntı Paneli', 'Tarayıcının paylaştıkları', LeakPanel),
  ],
};
