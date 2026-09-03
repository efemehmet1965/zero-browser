# ZERO cekirdek MVP — derleme kilavuzu (kurumsal yok, sadece browser)

## Gereken
- Ubuntu 22.04 (gercek makine veya WSL2), 16GB RAM, 80GB bos alan
- Internet + 1-3 saat (ilk derleme)

## Komutlar
```bash
# 1. Bu repo'yu linux makineye al
git clone <repo-url> zero && cd zero/zero-browser/firefox-fork

# 2. Kaynagi cek + yamalari uygula + branding'i kopyala
bash scripts/fetch-and-patch.sh

# 3. Derle ve calistir
bash scripts/build-and-run.sh
```

## Ne elde ediyorsun
- Kendi markanla derlenmis Firefox (ZERO adi, logosu, ana sayfa `zero://newtab`)
- React newtab system addon olarak gomulu (gecici eklenti derdi yok)
- userChrome'suz gelen siyah tema altyapisi (derlenen tema, faz 2'de `browser/themes/zero/`)

## Henuz yok (MVP sonrasi)
- Gercek `zero://` protokol handler (su an about-page yonlendirme)
- Otomatik guncelleyici (MAR) — her surum tam paket iner
- Windows imzasi — linux build'i once, windows CI sonra
