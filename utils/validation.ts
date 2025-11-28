/**
 * Veri Validasyon Utilities
 * Türkçe standartlarına uygun doğrulama fonksiyonları
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Telefon Numarası Validasyonu
 * Türkçe +90 standardı: +90 5XX XXX XX XX veya 05XX XXX XX XX
 */
export function validatePhoneNumber(phone: string): ValidationResult {
  if (!phone || phone.trim().length === 0) {
    return { isValid: false, error: "Telefon numarası gerekli" };
  }

  const cleanedPhone = phone.replace(/\D/g, "");

  // 10 haneli (0 ile başlayan) veya 12 haneli (90 ile başlayan)
  if (cleanedPhone.length === 10 && cleanedPhone.startsWith("5")) {
    return { isValid: true };
  }

  if (cleanedPhone.length === 12 && cleanedPhone.startsWith("90")) {
    return { isValid: true };
  }

  return {
    isValid: false,
    error: "Geçerli Türkçe telefon numarası giriniz (05XX XXX XX XX veya +90 5XX XXX XX XX)",
  };
}

/**
 * IBAN Validasyonu (Türkçe - TR)
 * Format: TRXX XXXX XXXX XXXX XXXX XXXX XX (24 haneli)
 */
export function validateIBAN(iban: string): ValidationResult {
  if (!iban || iban.trim().length === 0) {
    return { isValid: false, error: "IBAN gerekli" };
  }

  const cleanedIBAN = iban.replace(/\s/g, "").toUpperCase();

  // TR ile başlamalı ve 26 haneli olmalı
  if (!cleanedIBAN.startsWith("TR")) {
    return { isValid: false, error: "IBAN 'TR' ile başlamalı" };
  }

  if (cleanedIBAN.length !== 26) {
    return {
      isValid: false,
      error: "Geçerli IBAN 26 haneli olmalı (TR + 24 hane)",
    };
  }

  // Geriye kalan 24 hane rakam olmalı
  const afterTR = cleanedIBAN.substring(2);
  if (!/^\d{24}$/.test(afterTR)) {
    return {
      isValid: false,
      error: "IBAN'ın TR'den sonrası 24 rakamdan oluşmalı",
    };
  }

  // IBAN mod 97 check
  const ibanCheck = cleanedIBAN.substring(4) + cleanedIBAN.substring(0, 4);
  let rearranged = "";

  for (let i = 0; i < ibanCheck.length; i++) {
    const char = ibanCheck[i];
    if (isNaN(Number(char))) {
      // Harf: A=10, B=11, ..., Z=35
      rearranged += (char.charCodeAt(0) - 55).toString();
    } else {
      rearranged += char;
    }
  }

  // BigInt ile mod 97 hesapla (uzun sayılar için)
  const remainder = BigInt(rearranged) % BigInt(97);
  if (remainder !== BigInt(1)) {
    return { isValid: false, error: "Geçersiz IBAN numarası" };
  }

  return { isValid: true };
}

/**
 * TC Kimlik Numarası Validasyonu
 * 11 haneli, belirli algoritmaya uygun
 */
export function validateTCIdNumber(tcNumber: string): ValidationResult {
  if (!tcNumber || tcNumber.trim().length === 0) {
    return { isValid: false, error: "TC Kimlik Numarası gerekli" };
  }

  const cleaned = tcNumber.replace(/\D/g, "");

  if (cleaned.length !== 11) {
    return { isValid: false, error: "TC Kimlik Numarası 11 haneli olmalı" };
  }

  // 0 ile başlayamaz
  if (cleaned[0] === "0") {
    return { isValid: false, error: "TC Kimlik Numarası 0 ile başlayamaz" };
  }

  const digits = cleaned.split("").map(Number);

  // Tek rakamlar toplamı
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];

  // Çift rakamlar toplamı
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7] + digits[9];

  // 10. basamak kontrolü
  const tenthDigit = ((oddSum * 7 - evenSum) % 11) % 10;
  if (digits[9] !== tenthDigit) {
    return { isValid: false, error: "Geçersiz TC Kimlik Numarası (10. basamak hatalı)" };
  }

  // 11. basamak kontrolü
  const eleventhDigit = (oddSum + evenSum) % 10;
  if (digits[10] !== eleventhDigit) {
    return { isValid: false, error: "Geçersiz TC Kimlik Numarası (11. basamak hatalı)" };
  }

  return { isValid: true };
}

/**
 * Email Format Validasyonu
 * RFC 5322 standartlarına yakın simple kontrol
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: "Email adresi gerekli" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Geçerli bir email adresi giriniz" };
  }

  if (email.length > 254) {
    return { isValid: false, error: "Email adresi çok uzun" };
  }

  const [localPart, ...domainParts] = email.split("@");

  if (localPart.length > 64) {
    return { isValid: false, error: "Email'in @ öncesi kısmı çok uzun" };
  }

  // Başında/sonunda nokta olamaz
  if (localPart.startsWith(".") || localPart.endsWith(".")) {
    return { isValid: false, error: "Email'in @ öncesi kısmı nokta ile başlayamaz/bitemez" };
  }

  // Ardışık nokta olamaz
  if (localPart.includes("..")) {
    return { isValid: false, error: "Email'de ardışık nokta olamaz" };
  }

  return { isValid: true };
}

/**
 * Tarih Mantık Kontrolleri
 * Yükleme tarihi < Teslim tarihi, geçmiş tarih kontrolü vb.
 */
export function validateDateLogic(
  loadingDate: number,
  deliveryDate: number,
  allowPastDates: boolean = false
): ValidationResult {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const loading = new Date(loadingDate);
  loading.setHours(0, 0, 0, 0);

  const delivery = new Date(deliveryDate);
  delivery.setHours(0, 0, 0, 0);

  // Geçmiş tarih kontrolü
  if (!allowPastDates && loading.getTime() < now.getTime()) {
    return { isValid: false, error: "Yükleme tarihi bugünden sonra olmalı" };
  }

  if (!allowPastDates && delivery.getTime() < now.getTime()) {
    return { isValid: false, error: "Teslim tarihi bugünden sonra olmalı" };
  }

  // Teslim tarihi > Yükleme tarihi
  if (delivery.getTime() <= loading.getTime()) {
    return {
      isValid: false,
      error: "Teslim tarihi yükleme tarihinden sonra olmalı",
    };
  }

  // Maksimum 1 yıl fark kontrolü
  const maxDate = new Date(loading);
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  if (delivery.getTime() > maxDate.getTime()) {
    return { isValid: false, error: "Teslim tarihi yükleme tarihinden 1 yıl sonra olmalı" };
  }

  return { isValid: true };
}

/**
 * Şifre Validasyonu
 * En az 8 karakter, büyük harf, küçük harf, rakam
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: "Şifre gerekli" };
  }

  if (password.length < 8) {
    return { isValid: false, error: "Şifre en az 8 karakter olmalı" };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: "Şifre en az bir büyük harf içermeli" };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: "Şifre en az bir küçük harf içermeli" };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: "Şifre en az bir rakam içermeli" };
  }

  return { isValid: true };
}

/**
 * Metin Boşluk Kontrolü
 */
export function validateNotEmpty(
  value: string,
  fieldName: string
): ValidationResult {
  if (!value || value.trim().length === 0) {
    return { isValid: false, error: `${fieldName} gerekli` };
  }

  return { isValid: true };
}

/**
 * Sayı Kontrolü (Pozitif)
 */
export function validatePositiveNumber(
  value: string,
  fieldName: string
): ValidationResult {
  if (!value || value.trim().length === 0) {
    return { isValid: false, error: `${fieldName} gerekli` };
  }

  const num = parseFloat(value);

  if (isNaN(num)) {
    return { isValid: false, error: `${fieldName} sayı olmalı` };
  }

  if (num <= 0) {
    return { isValid: false, error: `${fieldName} pozitif olmalı` };
  }

  return { isValid: true };
}

/**
 * Para Formatı - Türkçe Locale
 * 10000 -> 10.000
 */
export function formatCurrency(amount: number): string {
  return amount.toLocaleString('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}
