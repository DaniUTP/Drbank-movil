import CryptoJS from 'crypto-js';

// La clave debe coincidir exactamente con la de tu .env en Laravel
const ENCRYPTION_KEY = '12345678901234567890123456789012';

/**
 * Decrypt data encrypted with Laravel's AES-256-CBC
 * Soporta tanto el formato JSON de Laravel como el formato "Raw" (IV concatenado).
 */
export function decryptLaravel(encryptedBase64: string): string {
  try {
    let iv: CryptoJS.lib.WordArray;
    let encrypted: CryptoJS.lib.WordArray;

    // 1. Intentamos detectar si es el formato JSON de Laravel
    try {
      const parsed: { iv: string; value: string } = JSON.parse(encryptedBase64);
      iv = CryptoJS.enc.Base64.parse(parsed.iv);
      encrypted = CryptoJS.enc.Base64.parse(parsed.value);
    } catch (e) {
      // 2. Si falla el JSON, entonces es el formato "Raw" (IV + CipherText concatenados)
      // El IV en AES-256-CBC siempre mide 16 bytes.
      const combined = CryptoJS.enc.Base64.parse(encryptedBase64);
      const ivWords = combined.words.slice(0, 4); // 4 palabras * 32 bits = 128 bits = 16 bytes
      const encryptedWords = combined.words.slice(4);

      iv = CryptoJS.lib.WordArray.create(ivWords);
      encrypted = CryptoJS.lib.WordArray.create(encryptedWords);
    }

    // 3. Generamos la llave usando SHA256 tal como lo hace Laravel internamente
    const key = CryptoJS.SHA256(ENCRYPTION_KEY);
    
    // 4. Desciframos usando AES-256-CBC con PKCS7 padding
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: encrypted } as any, 
      key,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );
    
    // 5. Convertimos el objeto WordArray descifrado a un string UTF-8
    let decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    
    // 6. CRUCIAL: Limpiamos los caracteres nulos (\x00) que deja PHP al final de los strings largos
    if (decryptedText) {
      decryptedText = decryptedText.replace(/\x00/g, '');
    }

    return decryptedText;
  } catch (error) {
    console.error('Decryption error:', error);
    // Si falla todo, devolvemos el original para que la app no crashee
    return encryptedBase64;
  }
}