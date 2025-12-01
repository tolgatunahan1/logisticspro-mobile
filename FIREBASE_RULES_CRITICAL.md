# ⚠️ KRİTİK: Firebase Rules HEMEN SET ET!

## Sorun:
Admin Dashboard "Permission denied" hatası veriyor çünkü Firebase Console'da RULES ayarlanmamış.

## Çözüm:

### 1. Firebase Console'a GİT
https://console.firebase.google.com/

### 2. Proje seç: `logisticspro-f044a`

### 3. Realtime Database → Rules sekmesine tıkla

### 4. Şimdiki kuralları SİL - Hepsi Sil

### 5. BU KURALARI YAPIŞT:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid || root.child('admins').child(auth.uid).child('isAdmin').val() === true",
        ".write": "$uid === auth.uid || root.child('admins').child(auth.uid).child('isAdmin').val() === true",
        "profile": {
          ".read": true,
          ".write": "$uid === auth.uid || root.child('admins').child(auth.uid).child('isAdmin').val() === true"
        }
      }
    },
    "admins": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "root.child('admins').child(auth.uid).child('isAdmin').val() === true"
      }
    },
    ".read": false,
    ".write": false
  }
}
```

### 6. "Publish" butonu tıkla → Onay ver

### 7. BAŞARILI mesajı çıkacak

### 8. App'ı Refresh et (F5 veya reload)

### 9. TEST ET:
- Signup: `tunahannakliyatnazilli@gmail.com`
- Admin Dashboard → "Beklemede" sekmesi
- Eğer hala "Permission denied" görürse, RULES'ları HEPSI SİL ve yeniden yapıştır (copy/paste hatası olabilir)

---

## Eğer hala sorun olursa:

1. Firebase Console'a git
2. **Admin Dashboard'da:**
   - tolgatunahan@icloud.com ile login yap
   - Settings → "RESET" butonu (admin-only)
   - Database'yi tamamen temizle
   
3. Sonra RULES'ları set et ve yeniden test et

---

**RULES set edildikten sonra TÜÜMÜ ÇALIŞACAK! 🚀**
