import type { ComponentType } from 'react';
import type { ModeId } from '../../types';
import AgeTool from './AgeTool';
import Base64Tool from './Base64Tool';
import BaseConverter from './BaseConverter';
import BmiTool from './BmiTool';
import BreachCheck from './BreachCheck';
import CalcTool from './CalcTool';
import ChmodTool from './ChmodTool';
import ColorTool from './ColorTool';
import CountdownTool from './CountdownTool';
import CronTool from './CronTool';
import CssUnits from './CssUnits';
import CvssCalculator from './CvssCalculator';
import DateDiffTool from './DateDiffTool';
import DiffTool from './DiffTool';
import DorkGenerator from './DorkGenerator';
import EmailHeaders from './EmailHeaders';
import EncoderLab from './EncoderLab';
import EncryptTool from './EncryptTool';
import FileAnalyzer from './FileAnalyzer';
import GitignoreTool from './GitignoreTool';
import GunPlani from './GunPlani';
import HashTool from './HashTool';
import JsonTool from './JsonTool';
import JwtTool from './JwtTool';
import KdvTool from './KdvTool';
import LeakPanel from './LeakPanel';
import LinkFilter from './LinkFilter';
import LfiGenerator from './LfiGenerator';
import LoanTool from './LoanTool';
import LoremTool from './LoremTool';
import MarkdownTool from './MarkdownTool';
import PasswordGenerator from './PasswordGenerator';
import PayloadLibrary from './PayloadLibrary';
import PercentTool from './PercentTool';
import PhishingCheck from './PhishingCheck';
import Pomodoro from './Pomodoro';
import Privesc from './Privesc';
import QuickNote from './QuickNote';
import RandomPicker from './RandomPicker';
import Stopwatch from './Stopwatch';
import TextTools from './TextTools';
import TodoTool from './TodoTool';
import SqliHelper from './SqliHelper';
import RegexTool from './RegexTool';
import ReverseShell from './ReverseShell';
import SubnetTool from './SubnetTool';
import Tezgah from './Tezgah';
import TimestampTool from './TimestampTool';
import UnitConverter from './UnitConverter';
import UrlCleaner from './UrlCleaner';
import UrlParserTool from './UrlParserTool';
import UuidTool from './UuidTool';
import XssGenerator from './XssGenerator';

// Araç kayıt defteri: mod -> araç listesi. Pano özeti, hamburger menü ve
// tekil araç görünümü buradan beslenir (id'ler mod içinde benzersiz).
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
