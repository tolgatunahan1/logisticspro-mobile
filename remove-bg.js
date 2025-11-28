const fs = require('fs');
const path = require('path');

// Try to use sharp if available, otherwise use a simpler approach
try {
  const sharp = require('sharp');
  
  sharp('assets/images/IMG_6804.jpeg')
    .png()
    .toBuffer()
    .then(buffer => {
      // For now, just convert to PNG
      fs.writeFileSync('assets/images/logo.png', buffer);
      console.log('✅ PNG kaydedildi');
    });
} catch (e) {
  // Fallback: use jimp
  const Jimp = require('jimp');
  
  Jimp.read('assets/images/IMG_6804.jpeg').then(image => {
    // Remove white background
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const r = this.bitmap.data[idx];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      const a = this.bitmap.data[idx + 3];
      
      // If pixel is white or very light, make it transparent
      if (r > 240 && g > 240 && b > 240) {
        this.bitmap.data[idx + 3] = 0; // Set alpha to 0 (transparent)
      }
    });
    
    image.write('assets/images/logo.png');
    console.log('✅ Arka plan kaldırıldı');
  });
}
