import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { getOrderById } from 'src/service/reportService'
import { reportTemplate } from 'src/utils/reportTemplate'
import ggaLogo from 'src/assets/GGA.jpg'

const A4_WIDTH_PX = 794

async function urlToDataUrl(url) {
  const res = await fetch(url)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function splitRst(value) {
  const parts = String(value ?? '').split('&')
  return {
    R: parts[0] ? parts[0].trim() : '',
    S: parts[1] ? parts[1].trim() : '',
    T: parts[2] ? parts[2].trim() : '',
  }
}

function isoToDateBR(iso) {
  if (!iso) return ''
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : ''
}

function isoToTimeBR(iso) {
  if (!iso) return ''
  const m = String(iso).match(/[T ](\d{2}):(\d{2})/)
  return m ? `${m[1]}:${m[2]}` : ''
}

function buildDto(order) {
  if (!order) return {}

  const supplyLoad = splitRst(order.rr_supply_voltage_under_load)
  const supplyUnload = splitRst(order.rr_supply_voltage_unloaded)
  const currentLoad = splitRst(order.rr_electrical_current_under_load)
  const currentUnload = splitRst(order.rr_electrical_current_unloaded)

  return {
    logo: '',
    signature: '',
    attachments: [],
    attachments_notes: {},

    company: order.company || null,
    equipament: order.equipament
      ? { ...order.equipament, current_hour_meter: order.current_hour_meter ?? '' }
      : { current_hour_meter: order.current_hour_meter ?? '' },

    OS_number: order.OS_number ?? null,

    cga_reason_visit: order.cga_reason_visit ?? null,
    cga_reported_defect: order.cga_reported_defect ?? null,
    cga_solution_applied: order.cga_solution_applied ?? null,
    cga_replaced_parts: order.cga_replaced_parts ?? null,
    cga_parts_to_replace: order.cga_parts_to_replace ?? null,

    mp_oil: order.mp_oil ?? null,
    mp_air_oil_separator_element: order.mp_air_oil_separator_element ?? null,
    mp_primary_air_filter: order.mp_primary_air_filter ?? null,
    mp_secondary_air_filter: order.mp_secondary_air_filter ?? null,
    mp_standard_air_filter: order.mp_standard_air_filter ?? null,
    mp_oil_filter: order.mp_oil_filter ?? null,
    mp_engine_lubricant: order.mp_engine_lubricant ?? null,
    mp_coalescing_element: order.mp_coalescing_element ?? null,
    mp_compressor_element_revision: order.mp_compressor_element_revision ?? null,

    rr_lubricating_oil_level: order.rr_lubricating_oil_level ?? null,
    rr_oil_stock_quantity: order.rr_oil_stock_quantity ?? null,
    rr_oil_model: order.rr_oil_model ?? null,
    rr_oil_type: order.rr_oil_type ?? null,

    rr_supply_voltage_under_load_R: supplyLoad.R || null,
    rr_supply_voltage_under_load_S: supplyLoad.S || null,
    rr_supply_voltage_under_load_T: supplyLoad.T || null,

    rr_supply_voltage_unloaded_R: supplyUnload.R || null,
    rr_supply_voltage_unloaded_S: supplyUnload.S || null,
    rr_supply_voltage_unloaded_T: supplyUnload.T || null,

    rr_service_factor_current: order.rr_service_factor_current ?? null,

    rr_electrical_current_under_load_R: currentLoad.R || null,
    rr_electrical_current_under_load_S: currentLoad.S || null,
    rr_electrical_current_under_load_T: currentLoad.T || null,

    rr_electrical_current_unloaded_R: currentUnload.R || null,
    rr_electrical_current_unloaded_S: currentUnload.S || null,
    rr_electrical_current_unloaded_T: currentUnload.T || null,

    rr_fan_motor_current: order.rr_fan_motor_current ?? null,
    rr_compressor_operating_temperature: order.rr_compressor_operating_temperature ?? null,
    rr_dryer_current: order.rr_dryer_current ?? null,
    rr_dew_point_temperature: order.rr_dew_point_temperature ?? null,
    rr_ambient_temperature: order.rr_ambient_temperature ?? null,

    cr_hot_air_duct_ok: order.cr_hot_air_duct_regularized != null,
    cr_hot_air_duct_regularized: order.cr_hot_air_duct_regularized,
    cr_room_temp_vent_ok: order.cr_room_temp_vent_ok,
    cr_room_notes: order.cr_room_notes ?? null,
    cr_install_env_condition: order.cr_install_env_condition ?? null,
    cr_accident_risk: order.cr_accident_risk,
    cr_electrical_install_ok: order.cr_electrical_install_ok,
    cr_grounding_ok: order.cr_grounding_ok,
    cr_room_lighting_ok: order.cr_room_lighting_ok,
    cr_service_outlet_220v: order.cr_service_outlet_220v,
    cr_air_point_for_cleaning: order.cr_air_point_for_cleaning,
    cr_water_point_available: order.cr_water_point_available,
    cr_distancing_ok: order.cr_distancing_ok,
    cr_compressor_ok: order.cr_compressor_ok,
    cr_improvement_suggestions: order.cr_improvement_suggestions ?? null,

    closing_start_time_1: isoToDateBR(order.closing_start_time),
    closing_start_time_2: isoToTimeBR(order.closing_start_time),
    closing_end_time_1: isoToDateBR(order.closing_end_time),
    closing_end_time_2: isoToTimeBR(order.closing_end_time),
    closing_technician_responsible: order.closing_technician_responsible ?? null,
    closing_responsible: order.closing_responsible ?? null,
    closing_notes: order.closing_notes ?? null,
  }
}

function waitForImages(doc) {
  const images = Array.from(doc.images || [])
  if (images.length === 0) return Promise.resolve()
  return Promise.all(
    images.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) return resolve()
          img.addEventListener('load', () => resolve(), { once: true })
          img.addEventListener('error', () => resolve(), { once: true })
        }),
    ),
  )
}

async function renderHtmlToCanvas(html) {
  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.style.position = 'fixed'
  iframe.style.left = '-10000px'
  iframe.style.top = '0'
  iframe.style.width = `${A4_WIDTH_PX}px`
  iframe.style.height = '10px'
  iframe.style.border = '0'
  document.body.appendChild(iframe)

  try {
    const doc = iframe.contentDocument
    doc.open()
    doc.write(html)
    doc.close()

    await waitForImages(doc)
    await new Promise((r) => requestAnimationFrame(() => r()))

    const target = doc.body
    iframe.style.height = `${target.scrollHeight}px`

    const canvas = await html2canvas(target, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      windowWidth: A4_WIDTH_PX,
    })

    // Posições (em pixels do canvas) onde é seguro quebrar a página:
    // os limites de cada linha da tabela e dos blocos (assinatura, anexos).
    const scaleY = canvas.height / target.scrollHeight
    const blocks = Array.from(doc.querySelectorAll('tr, .signature, .attachment-item'))
    const breaks = new Set()
    blocks.forEach((el) => {
      const rect = el.getBoundingClientRect()
      breaks.add(Math.round(rect.top * scaleY))
      breaks.add(Math.round(rect.bottom * scaleY))
    })
    const breakpoints = Array.from(breaks)
      .filter((v) => v > 0 && v < canvas.height)
      .sort((a, b) => a - b)

    return { canvas, breakpoints }
  } finally {
    document.body.removeChild(iframe)
  }
}

const PAGE_BORDER_MARGIN_MM = 6
const PAGE_INNER_PADDING_MM = 0

function drawPageBorder(pdf, pageW, pageH) {
  pdf.setLineWidth(0.4)
  pdf.setDrawColor(0)
  pdf.rect(
    PAGE_BORDER_MARGIN_MM,
    PAGE_BORDER_MARGIN_MM,
    pageW - 2 * PAGE_BORDER_MARGIN_MM,
    pageH - 2 * PAGE_BORDER_MARGIN_MM,
  )
}

// Dado o início da fatia e o fim ideal (limite de altura da página),
// recua até o ponto de quebra mais próximo para não cortar uma linha no meio.
function pickCut(y, idealEnd, breakpoints, totalPx) {
  if (idealEnd >= totalPx) return totalPx
  let best = -1
  for (const b of breakpoints) {
    if (b > y && b <= idealEnd) best = b
    else if (b > idealEnd) break
  }
  return best > y ? best : idealEnd
}

function canvasToPdf(canvas, breakpoints, fileName) {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()

  const contentX = PAGE_BORDER_MARGIN_MM + PAGE_INNER_PADDING_MM
  const contentY = PAGE_BORDER_MARGIN_MM + PAGE_INNER_PADDING_MM
  const contentW = pageW - 2 * (PAGE_BORDER_MARGIN_MM + PAGE_INNER_PADDING_MM)
  const contentH = pageH - 2 * (PAGE_BORDER_MARGIN_MM + PAGE_INNER_PADDING_MM)

  const pxPerMm = canvas.width / contentW
  const slicePx = Math.floor(contentH * pxPerMm)
  const totalPx = canvas.height

  let y = 0
  let firstPage = true

  while (y < totalPx) {
    const idealEnd = y + slicePx
    const cut = pickCut(y, idealEnd, breakpoints, totalPx)
    const sliceH = cut - y
    const slice = document.createElement('canvas')
    slice.width = canvas.width
    slice.height = sliceH
    const ctx = slice.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, slice.width, slice.height)
    ctx.drawImage(canvas, 0, -y)
    const sliceImg = slice.toDataURL('image/jpeg', 0.95)
    const sliceMm = sliceH / pxPerMm

    if (!firstPage) pdf.addPage()
    pdf.addImage(sliceImg, 'JPEG', contentX, contentY, contentW, sliceMm)
    drawPageBorder(pdf, pageW, pageH)

    y = cut
    firstPage = false
  }

  pdf.save(fileName)
}

function buildFileName(order) {
  const os = order?.OS_number ? String(order.OS_number).replace(/\W+/g, '-') : 'sem-numero'
  const company = order?.company?.name
    ? String(order.company.name).replace(/\W+/g, '-').toLowerCase()
    : 'os'
  return `os-${os}-${company}.pdf`
}

export async function generateOrderPdf(orderId) {
  const response = await getOrderById(orderId)
  const order = response?.data?.data?.ordem_service

  if (response?.status !== 200 || !order) {
    throw new Error('Não foi possível carregar a ordem de serviço.')
  }

  const dto = buildDto(order)
  dto.logo = await urlToDataUrl(ggaLogo).catch(() => '')
  const html = reportTemplate(dto)
  const { canvas, breakpoints } = await renderHtmlToCanvas(html)
  canvasToPdf(canvas, breakpoints, buildFileName(order))
}
