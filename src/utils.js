/**
 * Memvalidasi teks butiran aduan/maklum balas.
 * @param {string} text - Teks butiran maklum balas.
 * @returns {object} Hasil validasi { isValid: boolean, error: string|null }
 */
export function validateDescription(text, t) {
  if (!text || !text.trim()) {
    return {
      isValid: false,
      error: t ? t('validation.required') : 'Butiran maklum balas wajib diisi.'
    };
  }

  if (text.trim().length > 500) {
    return {
      isValid: false,
      error: t ? t('validation.max_length') : 'Butiran maklum balas tidak boleh melebihi 500 aksara.'
    };
  }

  return {
    isValid: true,
    error: null
  };
}
