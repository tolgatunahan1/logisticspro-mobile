const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

// Komut satırından dosya adı al veya varsayılan kullan
const inputFile = process.argv[2] || 'IMG_6805.jpeg';
const outputFile = 'assets/images/logo-transparent.png';

console.log(`📸 İşleniyor: ${inputFile}`);

Jimp.read(inputFile).then(image => {
  const width = image.bitmap.width;
  const height = image.bitmap.height;

  console.log(`📏 Boyut: ${width}x${height}`);

  // Her pixel'i tara ve beyaz arka planı kaldır
  image.scan(0, 0, width, height, function(x, y, idx) {
    const r = this.bitmap.data[idx];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];

    // Beyaz ve açık gri tonları transparent yap
    // LogisticsPRO logosu beyaz arka planda olduğu için agresif threshold
    if (r > 230 && g > 230 && b > 230) {
      this.bitmap.data[idx + 3] = 0; // Alpha = 0 (transparent)
    }
  });

  // PNG olarak kaydet
  image.write(outputFile);
  console.log('✅ Transparent PNG oluşturuldu:', outputFile);
  console.log('🎯 Logo transparent PNG olarak hazır!');
  console.log('📱 Artık icon.png olarak kullanabilirsiniz.');
}).catch(err => {
  console.error('❌ Hata:', err.message);
  console.log('💡 Kullanım: node remove-bg.js IMG_6805.jpeg');
});