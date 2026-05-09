<template>
  <q-dialog
    :model-value="modelValue"
    position="right"
    full-height
    transition-show="slide-left"
    transition-hide="slide-right"
    persistent
    @update:model-value="emit('update:modelValue', $event)"
  >
    <q-card class="column full-height dialog-card">
      <div v-if="loadingInitial" class="row items-center justify-center full-height">
        <q-spinner-dots color="primary" size="50px" />
      </div>

      <div v-else class="column full-height">
        <q-card-section class="dialog-header">
          <div class="dialog-header__icon">
            <q-icon name="ion-md-clipboard" size="22px" />
          </div>
          <div class="col">
            <div class="dialog-header__title">{{ isEdit ? 'Editar ordem de serviço' : 'Nova ordem de serviço' }}</div>
            <div class="dialog-header__subtitle">
              {{ isEdit ? 'Atualize os dados desta OS' : 'Cadastre uma nova ordem de serviço' }}
            </div>
          </div>
          <q-btn flat round dense icon="ion-md-close" aria-label="Fechar" class="dialog-header__close" @click="close" />
        </q-card-section>

        <q-separator />

        <q-card-section class="col scroll dialog-body">
          <q-stepper
            v-model="step"
            color="primary"
            animated
            flat
            keep-alive
            header-nav
            class="os-stepper"
          >
            <q-step :name="1" title="Dados iniciais" icon="ion-md-information-circle" :done="step > 1">
              <div class="form-section">
                <div class="form-section__title">Identificação</div>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <q-select
                      v-model="form.id_company"
                      :options="companies"
                      option-label="name"
                      option-value="id"
                      outlined
                      dense
                      label="Empresa"
                      emit-value
                      map-options
                      class="custom-input"
                      :disable="saveLoading || isEdit"
                      @update:model-value="onCompanyChange"
                    >
                      <template #prepend>
                        <q-icon name="ion-md-business" />
                      </template>
                    </q-select>
                  </div>
                  <div class="col-12 col-md-6">
                    <q-select
                      v-model="form.id_equipament"
                      :options="equipaments"
                      option-label="name"
                      option-value="id"
                      outlined
                      dense
                      label="Equipamento"
                      emit-value
                      map-options
                      class="custom-input"
                      :disable="saveLoading || !form.id_company || loadingEquipaments"
                      :loading="loadingEquipaments"
                    >
                      <template #prepend>
                        <q-icon name="ion-md-build" />
                      </template>
                      <template #no-option>
                        <q-item>
                          <q-item-section class="text-grey">
                            {{ form.id_company ? 'Nenhum equipamento para esta empresa' : 'Selecione uma empresa primeiro' }}
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      :model-value="form.current_hour_meter"
                      label="Horímetro atual"
                      dense
                      outlined
                      :disable="saveLoading"
                      hide-bottom-space
                      class="custom-input"
                      placeholder="000.000.000"
                      @update:model-value="(v) => (form.current_hour_meter = maskHourMeter(v))"
                    />
                  </div>
                </div>
              </div>
            </q-step>

            <q-step :name="2" title="Atendimento" icon="ion-md-construct" :done="step > 2">
              <div class="form-section">
                <div class="form-section__title">Considerações de atendimento</div>

                <q-banner class="tip-banner q-mb-sm" rounded dense>
                  <template #avatar>
                    <q-icon name="ion-md-bulb" color="amber-9" />
                  </template>
                  <span class="text-body2">
                    <b>Dica:</b> separe os itens com <b>;</b> e transformaremos cada um em um tópico no PDF.
                  </span>
                </q-banner>

                <div class="row q-col-gutter-md">
                  <div class="col-12">
                    <q-select
                      v-model="form.cga_reason_visit"
                      :options="reasonVisitOptions"
                      label="Motivo da visita"
                      dense
                      outlined
                      class="custom-input"
                      :disable="saveLoading"
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="form.cga_reported_defect"
                      label="Defeito / Situação encontrada"
                      type="textarea"
                      autogrow
                      dense
                      outlined
                      class="custom-input"
                      :disable="saveLoading"
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="form.cga_solution_applied"
                      label="Serviço realizado"
                      type="textarea"
                      autogrow
                      dense
                      outlined
                      class="custom-input"
                      :disable="saveLoading"
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="form.cga_replaced_parts"
                      label="Peças substituídas"
                      type="textarea"
                      autogrow
                      dense
                      outlined
                      class="custom-input"
                      :disable="saveLoading"
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="form.cga_parts_to_replace"
                      label="Peças a serem substituídas"
                      type="textarea"
                      autogrow
                      dense
                      outlined
                      class="custom-input"
                      :disable="saveLoading"
                    />
                  </div>
                </div>
              </div>
            </q-step>

            <q-step :name="3" title="Planos" icon="ion-md-calendar" :done="step > 3">
              <div class="form-section">
                <div class="form-section__title">Planos de manutenção</div>
                <div class="row q-col-gutter-md">
                  <ValueDateInput
                    v-for="plan in planFields"
                    :key="plan.key"
                    :label="plan.label"
                    :value-suffix="plan.valueSuffix"
                    :model-value="form[plan.key]"
                    :disable="saveLoading"
                    class="col-12 col-md-6"
                    @update:model-value="(v) => (form[plan.key] = v)"
                  />

                  <div class="col-12 col-md-6">
                    <q-input
                      :model-value="form.mp_compressor_element_revision"
                      label="Revisão do elemento do compressor"
                      dense
                      outlined
                      class="custom-input"
                      placeholder="000.000.000"
                      :disable="saveLoading"
                      hide-bottom-space
                      @update:model-value="(v) => (form.mp_compressor_element_revision = maskHourMeter(v))"
                    />
                  </div>
                </div>
              </div>
            </q-step>

            <q-step :name="4" title="Leituras" icon="ion-md-speedometer" :done="step > 4">
              <div class="form-section">
                <div class="form-section__title">Óleo</div>
                <div class="row q-col-gutter-md items-stretch">
                  <div class="col-12 col-md-6">
                    <div class="field-label">Nível de óleo lubrificante</div>
                    <q-btn-toggle
                      v-model="form.rr_lubricating_oil_level"
                      :options="oilLevelOptions"
                      no-caps
                      unelevated
                      class="level-toggle"
                      :class="`level-toggle--${(form.rr_lubricating_oil_level || '').toLowerCase()}`"
                      :disable="saveLoading"
                      spread
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="form.rr_oil_stock_quantity"
                      label="Quantidade de óleo em estoque"
                      dense
                      outlined
                      type="number"
                      suffix="L"
                      class="custom-input"
                      :disable="saveLoading"
                      hide-bottom-space
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="form.rr_oil_model"
                      label="Descrição do modelo de óleo"
                      dense
                      outlined
                      class="custom-input"
                      :disable="saveLoading"
                      hide-bottom-space
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-select
                      v-model="form.rr_oil_type"
                      :options="oilTypeOptions"
                      label="Tipo de óleo"
                      dense
                      outlined
                      class="custom-input"
                      :disable="saveLoading"
                    />
                  </div>
                </div>
              </div>

              <div class="form-section">
                <div class="form-section__title">Tensão de rede elétrica</div>
                <RstInput
                  label="Tensão de rede elétrica com carga"
                  suffix="V"
                  :model-value="form.rr_supply_voltage_under_load"
                  :disable="saveLoading"
                  @update:model-value="(v) => (form.rr_supply_voltage_under_load = v)"
                />
                <RstInput
                  class="q-mt-md"
                  label="Tensão de rede elétrica em alívio"
                  suffix="V"
                  :model-value="form.rr_supply_voltage_unloaded"
                  :disable="saveLoading"
                  @update:model-value="(v) => (form.rr_supply_voltage_unloaded = v)"
                />
              </div>

              <div class="form-section">
                <div class="form-section__title">Corrente elétrica</div>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="form.rr_service_factor_current"
                      label="Corrente do motor com fator de serviço"
                      dense
                      outlined
                      type="number"
                      suffix="A"
                      class="custom-input"
                      :disable="saveLoading"
                      hide-bottom-space
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="form.rr_fan_motor_current"
                      label="Corrente do motor do ventilador"
                      dense
                      outlined
                      type="number"
                      suffix="A"
                      class="custom-input"
                      :disable="saveLoading"
                      hide-bottom-space
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="form.rr_dryer_current"
                      label="Corrente elétrica do secador"
                      dense
                      outlined
                      type="number"
                      suffix="A"
                      class="custom-input"
                      :disable="saveLoading"
                      hide-bottom-space
                    />
                  </div>
                </div>

                <RstInput
                  class="q-mt-md"
                  label="Corrente elétrica com carga"
                  suffix="A"
                  :model-value="form.rr_electrical_current_under_load"
                  :disable="saveLoading"
                  @update:model-value="(v) => (form.rr_electrical_current_under_load = v)"
                />
                <RstInput
                  class="q-mt-md"
                  label="Corrente elétrica em alívio"
                  suffix="A"
                  :model-value="form.rr_electrical_current_unloaded"
                  :disable="saveLoading"
                  @update:model-value="(v) => (form.rr_electrical_current_unloaded = v)"
                />
              </div>

              <div class="form-section">
                <div class="form-section__title">Temperaturas</div>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="form.rr_compressor_operating_temperature"
                      label="Trabalho do compressor"
                      dense
                      outlined
                      type="number"
                      suffix="°C"
                      class="custom-input"
                      :disable="saveLoading"
                      hide-bottom-space
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="form.rr_dew_point_temperature"
                      label="Ponto de orvalho"
                      dense
                      outlined
                      type="number"
                      suffix="°C"
                      class="custom-input"
                      :disable="saveLoading"
                      hide-bottom-space
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="form.rr_ambient_temperature"
                      label="Ambiente"
                      dense
                      outlined
                      type="number"
                      suffix="°C"
                      class="custom-input"
                      :disable="saveLoading"
                      hide-bottom-space
                    />
                  </div>
                </div>
              </div>
            </q-step>

            <q-step :name="5" title="Sala" icon="ion-md-home" :done="step > 5">
              <div class="form-section">
                <div class="form-section__title">Avaliação da sala</div>

                <YesNoRow
                  v-model="form.cr_hot_air_duct_regularized"
                  label="Equipamento possui duto para retirada de ar quente regularizado?"
                  :disable="saveLoading"
                />

                <YesNoRow
                  v-model="form.cr_room_temp_vent_ok"
                  label="Temperatura e ventilação da sala são adequadas? (até 35°C)"
                  :disable="saveLoading"
                />
                <q-slide-transition>
                  <q-input
                    v-if="form.cr_room_temp_vent_ok === false"
                    v-model="form.cr_room_notes"
                    label="Observação sobre temperatura/ventilação"
                    type="textarea"
                    autogrow
                    dense
                    outlined
                    class="custom-input q-mt-sm"
                    :disable="saveLoading"
                  />
                </q-slide-transition>

                <div class="env-condition q-mt-md">
                  <div class="field-label">Condições do ambiente de instalação do compressor</div>
                  <q-btn-toggle
                    v-model="form.cr_install_env_condition"
                    :options="envConditionOptions"
                    no-caps
                    unelevated
                    class="level-toggle"
                    :class="`level-toggle--${(form.cr_install_env_condition || '').toLowerCase()}`"
                    :disable="saveLoading"
                    spread
                  />
                </div>

                <q-separator class="q-my-md" />

                <YesNoRow
                  v-model="form.cr_accident_risk"
                  label="Existe risco de acidente?"
                  :disable="saveLoading"
                />
                <YesNoRow
                  v-model="form.cr_electrical_install_ok"
                  label="Instalação elétrica está adequada?"
                  :disable="saveLoading"
                />
                <YesNoRow
                  v-model="form.cr_grounding_ok"
                  label="Instalação possui aterramento?"
                  :disable="saveLoading"
                />
                <YesNoRow
                  v-model="form.cr_room_lighting_ok"
                  label="A sala possui iluminação adequada?"
                  :disable="saveLoading"
                />
                <YesNoRow
                  v-model="form.cr_service_outlet_220v"
                  label="Existe tomada de serviço 220V?"
                  :disable="saveLoading"
                />
                <YesNoRow
                  v-model="form.cr_air_point_for_cleaning"
                  label="Sala possui ponto de ar para limpeza do compressor?"
                  :disable="saveLoading"
                />
                <YesNoRow
                  v-model="form.cr_water_point_available"
                  label="Sala possui ponto de água para hidrolavadora?"
                  :disable="saveLoading"
                />
                <YesNoRow
                  v-model="form.cr_distancing_ok"
                  label="Compressor atende os distanciamentos exigidos?"
                  :disable="saveLoading"
                />
                <YesNoRow
                  v-model="form.cr_compressor_ok"
                  label="Acesso ao compressor é correto e seguro?"
                  :disable="saveLoading"
                />

                <q-input
                  v-model="form.cr_improvement_suggestions"
                  label="Observações"
                  type="textarea"
                  autogrow
                  dense
                  outlined
                  class="custom-input q-mt-md"
                  :disable="saveLoading"
                />
              </div>
            </q-step>

            <q-step :name="6" title="Encerramento" icon="ion-md-checkmark-circle" :done="step > 6">
              <div class="form-section">
                <div class="form-section__title">Encerramento</div>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <q-input
                      :model-value="form.OS_number"
                      label="Número da OS"
                      dense
                      outlined
                      class="custom-input"
                      placeholder="00000000-00"
                      maxlength="11"
                      :disable="saveLoading"
                      hide-bottom-space
                      @update:model-value="(v) => (form.OS_number = maskOSNumber(v))"
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="form.closing_responsible"
                      label="Responsável pelo encerramento"
                      dense
                      outlined
                      class="custom-input"
                      :disable="saveLoading"
                      hide-bottom-space
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="form.closing_start_time"
                      label="Data de início"
                      dense
                      outlined
                      type="datetime-local"
                      class="custom-input"
                      :disable="saveLoading"
                      hide-bottom-space
                      stack-label
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="form.closing_end_time"
                      label="Data de fim"
                      dense
                      outlined
                      type="datetime-local"
                      class="custom-input"
                      :disable="saveLoading"
                      hide-bottom-space
                      stack-label
                    />
                  </div>
                  <div class="col-12">
                    <q-input
                      v-model="form.closing_technician_responsible"
                      label="Técnico(s) responsável(is)"
                      dense
                      outlined
                      class="custom-input"
                      :disable="saveLoading"
                      hide-bottom-space
                    />
                  </div>
                  <div class="col-12">
                    <q-input
                      v-model="form.closing_notes"
                      label="Observações"
                      type="textarea"
                      autogrow
                      dense
                      outlined
                      class="custom-input"
                      :disable="saveLoading"
                    />
                  </div>
                </div>
              </div>
            </q-step>
          </q-stepper>
        </q-card-section>

        <q-separator />

        <q-card-actions align="between" class="dialog-footer">
          <q-btn
            flat
            no-caps
            class="footer-action-btn"
            label="Cancelar"
            color="grey-8"
            :disable="saveLoading"
            @click="close"
          />
          <div class="row q-gutter-sm">
            <q-btn
              v-if="step > 1"
              flat
              no-caps
              class="footer-action-btn"
              color="grey-9"
              icon="ion-md-arrow-back"
              label="Voltar"
              :disable="saveLoading"
              @click="prevStep"
            />
            <q-btn
              v-if="step < TOTAL_STEPS"
              unelevated
              no-caps
              class="footer-action-btn"
              color="primary"
              icon-right="ion-md-arrow-forward"
              label="Próximo"
              :disable="saveLoading"
              @click="nextStep"
            />
            <q-btn
              v-else
              unelevated
              no-caps
              class="footer-action-btn"
              color="primary"
              :label="saveLabel"
              :loading="saveLoading"
              :disable="saveLoading"
              icon="ion-md-checkmark"
              @click="onSave"
            />
          </div>
        </q-card-actions>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, ref, watch, onMounted, h } from 'vue'
import { useQuasar, QInput, QBtnToggle } from 'quasar'
import { getClientsToEquipament } from 'src/service/clientService'
import { getEquipamentsByCompany } from 'src/service/equipamentService'
import {
  createReport,
  addReportReference,
  updateReportReference,
  getOrderById,
} from 'src/service/reportService'
import { maskHourMeter, maskDateBR, maskOSNumber } from 'src/utils/masks'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  details: { type: Object, default: null },
  refresh: { type: Function, default: () => {} },
})

const emit = defineEmits(['update:modelValue', 'save'])

const $q = useQuasar()

const TOTAL_STEPS = 6

const step = ref(1)
const saveLoading = ref(false)
const loadingInitial = ref(false)
const loadingEquipaments = ref(false)

const companies = ref([])
const equipaments = ref([])

const reasonVisitOptions = [
  'Inspeção de contrato',
  'Avaliação',
  'Manutenção preventiva',
  'Manutenção corretiva',
  'Partida técnica',
  'Instalação e partida técnica',
  'Visita técnica',
]

const oilLevelOptions = [
  { label: 'Baixo', value: 'BAIXO' },
  { label: 'Médio', value: 'MEDIO' },
  { label: 'Máximo', value: 'MAXIMO' },
]

const oilTypeOptions = ['Mineral', 'Semi sintético', 'Sintético']

const envConditionOptions = [
  { label: 'Boa', value: 'BOA' },
  { label: 'Regular', value: 'REGULAR' },
  { label: 'Agressiva', value: 'AGRESSIVA' },
]

const planFields = [
  { key: 'mp_oil', label: 'Óleo', valueSuffix: 'km' },
  { key: 'mp_air_oil_separator_element', label: 'Elemento separador de Ar/Óleo' },
  { key: 'mp_primary_air_filter', label: 'Filtro de ar primário' },
  { key: 'mp_secondary_air_filter', label: 'Filtro de ar secundário' },
  { key: 'mp_standard_air_filter', label: 'Filtro de ar standard' },
  { key: 'mp_oil_filter', label: 'Filtro de óleo' },
  { key: 'mp_engine_lubricant', label: 'Lubrificante do motor' },
  { key: 'mp_coalescing_element', label: 'Elemento coalescente' },
]

function emptyForm() {
  const base = {
    id: null,
    reportId: null,

    id_company: null,
    id_equipament: null,
    current_hour_meter: '',

    cga_reason_visit: null,
    cga_reported_defect: '',
    cga_solution_applied: '',
    cga_replaced_parts: '',
    cga_parts_to_replace: '',

    mp_compressor_element_revision: '',

    rr_lubricating_oil_level: null,
    rr_oil_stock_quantity: '',
    rr_oil_model: '',
    rr_oil_type: null,
    rr_supply_voltage_under_load: '',
    rr_supply_voltage_unloaded: '',
    rr_service_factor_current: '',
    rr_electrical_current_under_load: '',
    rr_electrical_current_unloaded: '',
    rr_fan_motor_current: '',
    rr_compressor_operating_temperature: '',
    rr_dryer_current: '',
    rr_dew_point_temperature: '',
    rr_ambient_temperature: '',

    cr_hot_air_duct_regularized: null,
    cr_room_temp_vent_ok: null,
    cr_room_notes: '',
    cr_install_env_condition: null,
    cr_accident_risk: null,
    cr_electrical_install_ok: null,
    cr_grounding_ok: null,
    cr_room_lighting_ok: null,
    cr_service_outlet_220v: null,
    cr_air_point_for_cleaning: null,
    cr_water_point_available: null,
    cr_distancing_ok: null,
    cr_compressor_ok: null,
    cr_improvement_suggestions: '',

    OS_number: '',
    closing_start_time: '',
    closing_end_time: '',
    closing_responsible: '',
    closing_technician_responsible: '',
    closing_notes: '',
  }

  for (const p of planFields) {
    base[p.key] = ''
  }

  return base
}

const form = ref(emptyForm())

const isEdit = computed(() => Boolean(props.details?.id))

const saveLabel = computed(() => (isEdit.value ? 'Atualizar OS' : 'Salvar OS'))

function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function strOrNull(v) {
  if (v === null || v === undefined) return null
  const s = String(v).trim()
  return s === '' ? null : s
}

async function loadCompanies() {
  const response = await getClientsToEquipament()
  if (response?.status === 200) {
    companies.value = response.data.data || []
  } else {
    $q.notify({ message: 'Erro ao carregar empresas.', color: 'negative', position: 'top' })
  }
}

async function loadEquipamentsForCompany(companyId) {
  if (!companyId) {
    equipaments.value = []
    return
  }
  loadingEquipaments.value = true
  try {
    const response = await getEquipamentsByCompany(companyId)
    if (response?.status === 200) {
      equipaments.value = response.data.data || []
    } else {
      equipaments.value = []
    }
  } finally {
    loadingEquipaments.value = false
  }
}

function onCompanyChange(companyId) {
  form.value.id_equipament = null
  loadEquipamentsForCompany(companyId)
}

function hydrateFormFromObject(d) {
  if (!d) return
  form.value.id = d.id ?? form.value.id
  form.value.reportId = d.id_report ?? d.report_id ?? form.value.reportId

  form.value.id_company = d.id_company ?? d.company?.id ?? form.value.id_company ?? null
  form.value.id_equipament = d.id_equipament ?? d.equipament?.id ?? form.value.id_equipament ?? null
  form.value.current_hour_meter = maskHourMeter(d.current_hour_meter ?? '')

  form.value.cga_reason_visit = d.cga_reason_visit ?? null
  form.value.cga_reported_defect = d.cga_reported_defect ?? ''
  form.value.cga_solution_applied = d.cga_solution_applied ?? ''
  form.value.cga_replaced_parts = d.cga_replaced_parts ?? ''
  form.value.cga_parts_to_replace = d.cga_parts_to_replace ?? ''

  for (const p of planFields) {
    form.value[p.key] = d[p.key] ?? ''
  }
  form.value.mp_compressor_element_revision = d.mp_compressor_element_revision ?? ''

  form.value.rr_lubricating_oil_level = d.rr_lubricating_oil_level ?? null
  form.value.rr_oil_stock_quantity = d.rr_oil_stock_quantity ?? ''
  form.value.rr_oil_model = d.rr_oil_model ?? ''
  form.value.rr_oil_type = d.rr_oil_type ?? null
  form.value.rr_supply_voltage_under_load = d.rr_supply_voltage_under_load ?? ''
  form.value.rr_supply_voltage_unloaded = d.rr_supply_voltage_unloaded ?? ''
  form.value.rr_service_factor_current = d.rr_service_factor_current ?? ''
  form.value.rr_electrical_current_under_load = d.rr_electrical_current_under_load ?? ''
  form.value.rr_electrical_current_unloaded = d.rr_electrical_current_unloaded ?? ''
  form.value.rr_fan_motor_current = d.rr_fan_motor_current ?? ''
  form.value.rr_compressor_operating_temperature = d.rr_compressor_operating_temperature ?? ''
  form.value.rr_dryer_current = d.rr_dryer_current ?? ''
  form.value.rr_dew_point_temperature = d.rr_dew_point_temperature ?? ''
  form.value.rr_ambient_temperature = d.rr_ambient_temperature ?? ''

  form.value.cr_hot_air_duct_regularized = nullableBool(d.cr_hot_air_duct_regularized)
  form.value.cr_room_temp_vent_ok = nullableBool(d.cr_room_temp_vent_ok)
  form.value.cr_room_notes = d.cr_room_notes ?? ''
  form.value.cr_install_env_condition = d.cr_install_env_condition ?? null
  form.value.cr_accident_risk = nullableBool(d.cr_accident_risk)
  form.value.cr_electrical_install_ok = nullableBool(d.cr_electrical_install_ok)
  form.value.cr_grounding_ok = nullableBool(d.cr_grounding_ok)
  form.value.cr_room_lighting_ok = nullableBool(d.cr_room_lighting_ok)
  form.value.cr_service_outlet_220v = nullableBool(d.cr_service_outlet_220v)
  form.value.cr_air_point_for_cleaning = nullableBool(d.cr_air_point_for_cleaning)
  form.value.cr_water_point_available = nullableBool(d.cr_water_point_available)
  form.value.cr_distancing_ok = nullableBool(d.cr_distancing_ok)
  form.value.cr_compressor_ok = nullableBool(d.cr_compressor_ok)
  form.value.cr_improvement_suggestions = d.cr_improvement_suggestions ?? ''

  form.value.OS_number = maskOSNumber(d.OS_number ?? '')
  form.value.closing_start_time = isoToLocalInput(d.closing_start_time)
  form.value.closing_end_time = isoToLocalInput(d.closing_end_time)
  form.value.closing_responsible = d.closing_responsible ?? ''
  form.value.closing_technician_responsible = d.closing_technician_responsible ?? ''
  form.value.closing_notes = d.closing_notes ?? ''
}

function nullableBool(v) {
  if (v === true || v === false) return v
  return null
}

function isoToLocalInput(iso) {
  if (!iso) return ''
  const s = String(iso)
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/)
  if (!m) return ''
  return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}`
}

function localInputToISO(local) {
  if (!local) return null
  const s = String(local).replace(' ', 'T')
  if (s.length === 16) return `${s}:00`
  return s
}

async function loadOrderForEdit() {
  const orderId = props.details?.id

  if (!orderId) return

  try {
    const response = await getOrderById(orderId)

    if (response?.status === 200 && response.data?.data?.ordem_service) {
      const d = response.data.data.ordem_service
      hydrateFormFromObject(d)

      if (d.company) companies.value = [d.company]
      if (d.equipament) equipaments.value = [d.equipament]
    } else {
      $q.notify({ message: 'Erro ao carregar ordem de serviço.', color: 'negative', position: 'top' })
    }
  } catch (e) {
    console.error(e)
    $q.notify({ message: 'Erro ao carregar ordem de serviço.', color: 'negative', position: 'top' })
  }
}

onMounted(async () => {
  loadingInitial.value = true
  step.value = 1
  form.value = emptyForm()

  if (props.details?.id) {
    await loadOrderForEdit()
  } else {
    await loadCompanies()
  }

  loadingInitial.value = false
})

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      step.value = 1
    }
  },
)

function nextStep() {
  if (step.value === 1 && !validateStep1()) return
  if (step.value < TOTAL_STEPS) step.value += 1
}

function prevStep() {
  if (step.value > 1) step.value -= 1
}

function validateStep1() {
  if (!form.value.id_company) {
    $q.notify({ message: 'Selecione a empresa.', color: 'negative', position: 'top', icon: 'ion-md-warning' })
    return false
  }
  if (!form.value.id_equipament) {
    $q.notify({ message: 'Selecione o equipamento.', color: 'negative', position: 'top', icon: 'ion-md-warning' })
    return false
  }
  return true
}

function buildOrderServicePayload() {
  const f = form.value
  const payload = {
    id_company: strOrNull(f.id_company),
    id_equipament: strOrNull(f.id_equipament),
    current_hour_meter: strOrNull(f.current_hour_meter),

    cga_reason_visit: strOrNull(f.cga_reason_visit),
    cga_reported_defect: strOrNull(f.cga_reported_defect),
    cga_solution_applied: strOrNull(f.cga_solution_applied),
    cga_replaced_parts: strOrNull(f.cga_replaced_parts),
    cga_parts_to_replace: strOrNull(f.cga_parts_to_replace),

    mp_compressor_element_revision: strOrNull(f.mp_compressor_element_revision),

    rr_lubricating_oil_level: strOrNull(f.rr_lubricating_oil_level),
    rr_oil_stock_quantity: strOrNull(f.rr_oil_stock_quantity),
    rr_oil_model: strOrNull(f.rr_oil_model),
    rr_oil_type: strOrNull(f.rr_oil_type),
    rr_supply_voltage_under_load: strOrNull(f.rr_supply_voltage_under_load),
    rr_supply_voltage_unloaded: strOrNull(f.rr_supply_voltage_unloaded),
    rr_service_factor_current: strOrNull(f.rr_service_factor_current),
    rr_electrical_current_under_load: strOrNull(f.rr_electrical_current_under_load),
    rr_electrical_current_unloaded: strOrNull(f.rr_electrical_current_unloaded),
    rr_fan_motor_current: strOrNull(f.rr_fan_motor_current),
    rr_compressor_operating_temperature: strOrNull(f.rr_compressor_operating_temperature),
    rr_dryer_current: strOrNull(f.rr_dryer_current),
    rr_dew_point_temperature: strOrNull(f.rr_dew_point_temperature),
    rr_ambient_temperature: strOrNull(f.rr_ambient_temperature),

    cr_hot_air_duct_regularized: f.cr_hot_air_duct_regularized,
    cr_room_temp_vent_ok: f.cr_room_temp_vent_ok,
    cr_room_notes: strOrNull(f.cr_room_notes),
    cr_install_env_condition: strOrNull(f.cr_install_env_condition),
    cr_accident_risk: f.cr_accident_risk,
    cr_electrical_install_ok: f.cr_electrical_install_ok,
    cr_grounding_ok: f.cr_grounding_ok,
    cr_room_lighting_ok: f.cr_room_lighting_ok,
    cr_service_outlet_220v: f.cr_service_outlet_220v,
    cr_air_point_for_cleaning: f.cr_air_point_for_cleaning,
    cr_water_point_available: f.cr_water_point_available,
    cr_distancing_ok: f.cr_distancing_ok,
    cr_compressor_ok: f.cr_compressor_ok,
    cr_improvement_suggestions: strOrNull(f.cr_improvement_suggestions),

    OS_number: strOrNull(f.OS_number),
    closing_start_time: localInputToISO(f.closing_start_time),
    closing_end_time: localInputToISO(f.closing_end_time),
    closing_responsible: strOrNull(f.closing_responsible),
    closing_technician_responsible: strOrNull(f.closing_technician_responsible),
    closing_notes: strOrNull(f.closing_notes),
  }

  for (const p of planFields) {
    payload[p.key] = strOrNull(f[p.key])
  }

  return payload
}

function close() {
  emit('update:modelValue', false)
}

function closeWithRefresh() {
  emit('update:modelValue', false)
  props.refresh()
}

async function onSave() {
  if (!validateStep1()) {
    step.value = 1
    return
  }

  saveLoading.value = true

  try {
    const orderServiceId = generateUUID()

    const reportIdToUse = isEdit.value && form.value.reportId
      ? form.value.reportId
      : orderServiceId

    const reportResponse = await createReport({ id: reportIdToUse, type: 'ORDEM_SERVICE' })

    if (reportResponse?.status !== 200) {
      $q.notify({
        message: reportResponse?.data?.message || 'Erro ao criar relatório.',
        color: 'negative',
        position: 'top',
        icon: 'ion-md-close-circle',
      })
      return
    }

    const isExists = reportResponse.data?.data?.is_exists
    const idReference = reportResponse.data?.data?.report?.id_reference

    if (!idReference) {
      $q.notify({ message: 'Resposta inválida do servidor.', color: 'negative', position: 'top' })
      return
    }

    const orderService = buildOrderServicePayload()

    const requestRef = {
      id: idReference,
      order_service: { id: orderServiceId, ...orderService },
    }

    const refResponse = isExists
      ? await updateReportReference(requestRef)
      : await addReportReference(requestRef)

    if (refResponse?.status === 200) {
      $q.notify({
        message: isEdit.value || isExists ? 'OS atualizada com sucesso!' : 'OS criada com sucesso!',
        color: 'positive',
        position: 'top',
        icon: 'ion-md-checkmark-circle',
      })
      form.value.id = orderServiceId
      form.value.reportId = idReference
      emit('save', { orderServiceId, idReference })
      closeWithRefresh()
    } else {
      $q.notify({
        message: refResponse?.data?.message || 'Erro ao salvar a OS.',
        color: 'negative',
        position: 'top',
        icon: 'ion-md-close-circle',
      })
    }
  } catch (e) {
    console.error(e)
    $q.notify({ message: 'Erro inesperado ao salvar a OS.', color: 'negative', position: 'top' })
  } finally {
    saveLoading.value = false
  }
}

const RstInput = {
  name: 'RstInput',
  props: {
    modelValue: { type: String, default: '' },
    label: { type: String, default: '' },
    suffix: { type: String, default: '' },
    disable: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(rstProps, { emit: rstEmit }) {
    const parts = computed(() => {
      const arr = String(rstProps.modelValue || '').split('&')
      return { r: arr[0] || '', s: arr[1] || '', t: arr[2] || '' }
    })

    function update(part, val) {
      const next = { ...parts.value, [part]: String(val ?? '') }
      const joined = `${next.r}&${next.s}&${next.t}`
      rstEmit('update:modelValue', joined === '&&' ? '' : joined)
    }

    return () =>
      h('div', {}, [
        h('div', { class: 'field-label' }, rstProps.label),
        h('div', { class: 'row q-col-gutter-sm' }, [
          ['r', 'R'],
          ['s', 'S'],
          ['t', 'T'],
        ].map(([key, lbl]) =>
          h('div', { class: 'col-4' }, [
            h(QInput, {
              modelValue: parts.value[key],
              label: lbl,
              outlined: true,
              dense: true,
              type: 'number',
              suffix: rstProps.suffix,
              hideBottomSpace: true,
              disable: rstProps.disable,
              class: 'custom-input',
              'onUpdate:modelValue': (v) => update(key, v),
            }),
          ]),
        )),
      ])
  },
}

const ValueDateInput = {
  name: 'ValueDateInput',
  props: {
    modelValue: { type: String, default: '' },
    label: { type: String, default: '' },
    valueSuffix: { type: String, default: '' },
    disable: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(vdProps, { emit: vdEmit }) {
    const parts = computed(() => {
      const arr = String(vdProps.modelValue || '').split('&')
      return { value: arr[0] || '', date: arr[1] || '' }
    })

    function update(part, val) {
      const next = { ...parts.value, [part]: String(val ?? '') }
      const joined = `${next.value}&${next.date}`
      vdEmit('update:modelValue', joined === '&' ? '' : joined)
    }

    return () =>
      h('div', { class: 'value-date-row' }, [
        h('div', { class: 'field-label' }, vdProps.label),
        h('div', { class: 'row q-col-gutter-sm' }, [
          h('div', { class: 'col-7' }, [
            h(QInput, {
              modelValue: parts.value.value,
              label: 'Valor',
              outlined: true,
              dense: true,
              hideBottomSpace: true,
              suffix: vdProps.valueSuffix,
              placeholder: '000.000.000',
              disable: vdProps.disable,
              class: 'custom-input',
              'onUpdate:modelValue': (v) => update('value', maskHourMeter(v)),
            }),
          ]),
          h('div', { class: 'col-5' }, [
            h(QInput, {
              modelValue: parts.value.date,
              label: 'Data',
              outlined: true,
              dense: true,
              hideBottomSpace: true,
              placeholder: 'DD/MM/YYYY',
              maxlength: 10,
              disable: vdProps.disable,
              class: 'custom-input',
              'onUpdate:modelValue': (v) => update('date', maskDateBR(v)),
            }),
          ]),
        ]),
      ])
  },
}

const YesNoRow = {
  name: 'YesNoRow',
  props: {
    modelValue: { type: Boolean, default: null },
    label: { type: String, default: '' },
    disable: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(ynProps, { emit: ynEmit }) {
    const options = [
      { label: 'Sim', value: true },
      { label: 'Não', value: false },
    ]
    return () =>
      h('div', { class: 'yesno-row' }, [
        h('div', { class: 'yesno-row__label' }, ynProps.label),
        h(
          'div',
          {
            class: [
              'yesno-row__toggle',
              ynProps.modelValue === true ? 'yesno-row__toggle--yes' : '',
              ynProps.modelValue === false ? 'yesno-row__toggle--no' : '',
            ],
          },
          [
            h(QBtnToggle, {
              modelValue: ynProps.modelValue,
              options,
              noCaps: true,
              unelevated: true,
              spread: false,
              disable: ynProps.disable,
              'onUpdate:modelValue': (v) => ynEmit('update:modelValue', v),
            }),
          ],
        ),
      ])
  },
}
</script>

<style scoped lang="scss">
.dialog-card {
  min-width: min(960px, 100vw);
  width: min(960px, 100vw);
  border-top-left-radius: var(--radius-lg);
  border-bottom-left-radius: var(--radius-lg);
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 22px 24px 18px;

  &__icon {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: var(--brand-50);
    color: var(--brand-600);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__title {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--text-strong);
    letter-spacing: -0.015em;
    line-height: 1.25;
  }

  &__subtitle {
    margin-top: 2px;
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  &__close {
    color: var(--text-muted);
  }
}

.dialog-body {
  padding: 18px 20px;
  background: var(--bg-muted);
}

.os-stepper {
  background: transparent;
}

.form-section {
  background: var(--bg-surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  padding: 16px;
  margin-bottom: 12px;

  &__title {
    font-size: 0.78rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted);
    margin-bottom: 12px;
  }

  & .row + .row {
    margin-top: 12px;
  }
}

.tip-banner {
  background: #fff8e1;
  color: #5d4037;
  border: 1px solid #ffe082;
}

.field-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.value-date-row {
  margin-bottom: 8px;
}

.dialog-footer {
  padding: 14px 22px;
  background: var(--bg-surface);
}

.footer-action-btn {
  padding: 0 18px;
  height: 42px;
  min-width: 110px;
  border-radius: var(--radius-md);
  font-weight: 600;
}

.level-toggle {
  width: 100%;
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.level-toggle--baixo :deep(.q-btn--active),
.level-toggle--agressiva :deep(.q-btn--active) {
  background: #fee2e2 !important;
  color: #b91c1c !important;
}

.level-toggle--medio :deep(.q-btn--active),
.level-toggle--regular :deep(.q-btn--active) {
  background: #fef3c7 !important;
  color: #92400e !important;
}

.level-toggle--maximo :deep(.q-btn--active),
.level-toggle--boa :deep(.q-btn--active) {
  background: #d1fae5 !important;
  color: #065f46 !important;
}

.yesno-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px dashed var(--border-soft);

  &:last-of-type {
    border-bottom: none;
  }

  &__label {
    color: var(--text-base);
    font-size: 0.92rem;
    line-height: 1.3;
  }

  &__toggle {
    flex-shrink: 0;

    :deep(.q-btn-toggle) {
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    &--yes :deep(.q-btn--active) {
      background: #d1fae5 !important;
      color: #065f46 !important;
    }

    &--no :deep(.q-btn--active) {
      background: #fee2e2 !important;
      color: #b91c1c !important;
    }
  }
}
</style>
