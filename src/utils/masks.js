/** Máximo de dígitos para CEP (somente números). */
export const CEP_MAX_DIGITS = 8

/** Máximo de dígitos para número do endereço (somente números). */
export const ADDRESS_NUMBER_MAX_DIGITS = 12

/**
 * Formata string como CNPJ: 99.999.999/9999-99 (até 14 dígitos).
 * @param {string|null|undefined} input
 * @returns {string}
 */
export function maskCnpjFromString(input) {
  const d = String(input ?? '')
    .replace(/\D/g, '')
    .slice(0, 14)
  if (d.length <= 2) {
    return d
  }
  if (d.length <= 5) {
    return `${d.slice(0, 2)}.${d.slice(2)}`
  }
  if (d.length <= 8) {
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`
  }
  if (d.length <= 12) {
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`
  }
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

/**
 * Mantém apenas dígitos e limita o tamanho.
 * @param {string|null|undefined} input
 * @param {number} maxLen
 * @returns {string}
 */
export function digitsOnlySlice(input, maxLen) {
  return String(input ?? '')
    .replace(/\D/g, '')
    .slice(0, maxLen)
}
