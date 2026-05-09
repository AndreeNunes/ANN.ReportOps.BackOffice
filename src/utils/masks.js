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

export const maskPhone = (value) => {
  if (!value) return ''

  const numbers = value.replace(/\D/g, '')

  if (numbers.length <= 10) {
    return numbers.replace(
      /(\d{2})(\d{4})(\d{0,4})/,
      (_, ddd, part1, part2) =>
        part2 ? `(${ddd}) ${part1}-${part2}` : `(${ddd}) ${part1}`
    )
  }

  return numbers.replace(
    /(\d{2})(\d{5})(\d{0,4})/,
    (_, ddd, part1, part2) =>
      part2 ? `(${ddd}) ${part1}-${part2}` : `(${ddd}) ${part1}`
  )
}

export function digitsOnlySlice(input, maxLen) {
  return String(input ?? '')
    .replace(/\D/g, '')
    .slice(0, maxLen)
}

export const unmask = (value) => {
  if (!value) return ''
  return value.replace(/\D/g, '')
}

/**
 * Formata até 9 dígitos como ###.###.###.
 * @param {string|number|null|undefined} input
 * @returns {string}
 */
export function maskHourMeter(input) {
  const d = String(input ?? '')
    .replace(/\D/g, '')
    .slice(0, 9)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
}

/**
 * Formata até 8 dígitos como DD/MM/YYYY.
 * @param {string|null|undefined} input
 * @returns {string}
 */
export function maskDateBR(input) {
  const d = String(input ?? '')
    .replace(/\D/g, '')
    .slice(0, 8)
  if (d.length <= 2) return d
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`
}

/**
 * Formata número da OS no formato ########-##.
 * @param {string|null|undefined} input
 * @returns {string}
 */
export function maskOSNumber(input) {
  const d = String(input ?? '')
    .replace(/\D/g, '')
    .slice(0, 10)
  if (d.length <= 8) return d
  return `${d.slice(0, 8)}-${d.slice(8)}`
}

/**
 * Mantém apenas dígitos e ponto decimal opcional, limitando a casas decimais.
 * @param {string|number|null|undefined} input
 * @param {number} maxDecimals
 * @returns {string}
 */
export function numericString(input, maxDecimals = 2) {
  const s = String(input ?? '').replace(',', '.')
  const cleaned = s.replace(/[^\d.]/g, '')
  const parts = cleaned.split('.')
  if (parts.length === 1) return parts[0]
  return `${parts[0]}.${parts.slice(1).join('').slice(0, maxDecimals)}`
}
