# Google Play Store APK Build Talimatları

## Hazırlık (1 kez yapılır)

### 1. Expo Hesabı Oluştur
- https://expo.dev sitesine gir
- Hesap oluştur (ücretsiz)

### 2. Google Play Developer Hesabı Oluştur
- https://play.google.com/console
- $25 ödeme yap (one-time)
- App bundle oluştur: "LogisticsPRO"

### 3. Service Account Dosyası Oluştur
Google Play Console'da:
1. Settings > API access
2. Create Service Account
3. JSON key indir (api-service-account.json)
4. Dosyayı proje kök dizinine koy

## Build Adımları

### Step 1: EAS CLI'ı Kur
```bash
npm install -g eas-cli
```

### Step 2: Expo'ya Giriş Yap
```bash
eas login
# Expo hesabını gir
```

### Step 3: EAS Init (İlk Seferde)
```bash
eas build:configure
# Android seç
```

### Step 4: APK Build Et
```bash
# Preview APK (test için)
eas build --platform android --profile preview

# Release APK (Play Store için)
eas build --platform android --profile production
```

### Step 5: Build'i Bekle
- Build süresi: 20-30 dakika
- Tamamlandığında link alacaksın

### Step 6: Play Store'a Upload Et
```bash
eas submit --platform android --latest
```

**VEYA Manuel Upload:**
1. Google Play Console'a gir
2. App release bölümüne gir
3. APK dosyasını upload et
4. Store listing'i doldur
5. Submit et

## Versiyon Güncelleme (Sonraki Release'ler)

```bash
# app.json'da version güncelleyin
"version": "1.0.1"

# Build et
eas build --platform android --profile production
```

## Notlar
- İlk build: 20-30 dakika
- Subsequent builds: 10-15 dakika
- Google Play Review: 3-24 saat
