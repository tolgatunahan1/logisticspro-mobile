# Firebase Realtime Database Rules

**ÖNEMLİ:** Bu kuralları Firebase Console'da ayarlamanız gerekiyor.

## Kurulum Adımları:

1. Firebase Console'a git: https://console.firebase.google.com/
2. Proje seç: `logisticspro-f044a`
3. Sol menüden `Realtime Database` seç
4. `Rules` sekmesine tıkla
5. Aşağıdaki kodun tamamını kopyala ve yapıştır

## Firebase Rules (Kopyalayıp Firebase Console'a yapıştır):

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
        },
        "companies": {
          ".read": "$uid === auth.uid",
          ".write": "$uid === auth.uid"
        },
        "carriers": {
          ".read": "$uid === auth.uid",
          ".write": "$uid === auth.uid"
        },
        "jobs": {
          ".read": "$uid === auth.uid",
          ".write": "$uid === auth.uid"
        },
        "completedJobs": {
          ".read": "$uid === auth.uid",
          ".write": "$uid === auth.uid"
        },
        "ibans": {
          ".read": "$uid === auth.uid",
          ".write": "$uid === auth.uid"
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

## Ne yapıyor bu kurallar?

- ✅ Yeni user kaydolurken kendi profile'ını yazabilir
- ✅ Admin pending users'ı görebilir
- ✅ Admin user'ları approve/reject edebilir
- ✅ Her user sadece kendi verilerine erişebilir
- ✅ Admin tüm user verilerine erişebilir

## Kurallı yapıştırdıktan sonra:

1. "Publish" butonuna tıkla
2. Onay ver
3. Başarı mesajı çıkacak
4. Uygulamayı test et

---

**Eğer "Permission denied" hatası alıyorsan, bu kuralları Firebase Console'da ayarlamamışsındır.**
