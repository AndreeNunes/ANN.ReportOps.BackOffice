<template>
  <q-dialog
    :model-value="modelValue"
    position="right"
    full-height
    transition-show="slide-left"
    transition-hide="slide-right"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <q-card class="column full-height dialog-card">
      <div v-if="loadingInitial" class="row items-center justify-center full-height">
        <q-spinner-dots color="primary" size="50px" />
      </div>

      <div v-else class="column full-height">
        <q-card-section class="dialog-header">
          <div class="dialog-header__icon">
            <q-icon name="ion-md-build" size="22px" />
          </div>
          <div class="col">
            <div class="dialog-header__title">{{ isEdit ? 'Editar equipamento' : 'Novo equipamento' }}</div>
            <div class="dialog-header__subtitle">
              {{ isEdit ? 'Atualize as especificações deste equipamento' : 'Cadastre um novo equipamento técnico' }}
            </div>
          </div>
          <q-btn flat round dense icon="ion-md-close" aria-label="Fechar" class="dialog-header__close" @click="close" />
        </q-card-section>

        <q-separator />

        <q-card-section class="col scroll dialog-body">
          <div class="form-section">
            <div class="form-section__title">Identificação</div>
            <div class="column q-col-gutter-sm">
              <q-input
                v-model="form.name"
                label="Nome do equipamento"
                dense
                outlined
                :disable="saveLoading"
                hide-bottom-space
                class="custom-input"
              />

              <q-select
                v-model="form.company_id"
                :options="listClients"
                option-label="name"
                option-value="id"
                outlined
                dense
                input-debounce="0"
                label="Cliente"
                emit-value
                map-options
                class="custom-input"
                clearable
                :disable="saveLoading || isEdit"
              />
            </div>
          </div>

          <div class="form-section">
            <div class="form-section__title">Especificações técnicas</div>
            <div class="row q-col-gutter-sm">
              <div class="col-4">
                <q-input
                  v-model="form.manufacture_date_display"
                  label="Data de fabricação (MM/YYYY)"
                  dense
                  outlined
                  :disable="saveLoading"
                  hide-bottom-space
                  maxlength="7"
                  placeholder="MM/YYYY"
                  class="custom-input"
                />
              </div>
              <div class="col-4">
                <q-input
                  v-model="form.compressor_unit_model"
                  label="Modelo do compressor"
                  dense
                  outlined
                  :disable="saveLoading"
                  hide-bottom-space
                  class="custom-input"
                />
              </div>
              <div class="col-4">
                <q-input
                  v-model="form.ihm_model"
                  label="Modelo do IHM"
                  dense
                  outlined
                  :disable="saveLoading"
                  hide-bottom-space
                  class="custom-input"
                />
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-4">
                <q-select
                  v-model="form.supply_voltage"
                  :options="supplyVoltageOptions"
                  label="Tensão de alimentação"
                  dense
                  outlined
                  hide-bottom-space
                  :disable="saveLoading"
                  class="custom-input"
                />
              </div>
              <div class="col-4">
                <q-select
                  v-model="form.intake_solenoid_voltage"
                  :options="inputVoltageOptions"
                  label="Tensão de entrada"
                  dense
                  outlined
                  hide-bottom-space
                  :disable="saveLoading"
                  class="custom-input"
                />
              </div>
              <div class="col-4">
                <q-select
                  v-model="form.control_voltage"
                  :options="inputVoltageOptions"
                  label="Tensão de comando"
                  dense
                  outlined
                  hide-bottom-space
                  :disable="saveLoading"
                  class="custom-input"
                />
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-input
                  v-model="form.serial_number"
                  label="Número de série"
                  dense
                  outlined
                  :disable="saveLoading"
                  hide-bottom-space
                  class="custom-input"
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model="form.inverter_softstarter_brand_model"
                  label="Modelo do inversor"
                  dense
                  outlined
                  :disable="saveLoading"
                  hide-bottom-space
                  class="custom-input"
                />
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-4">
                <q-input
                  v-model="form.working_pressure"
                  label="Pressão de trabalho"
                  dense
                  outlined
                  :disable="saveLoading"
                  hide-bottom-space
                  suffix="bar"
                  class="custom-input"
                />
              </div>
              <div class="col-4">
                <q-input
                  v-model="form.motor_lubrication_data"
                  label="Dados de lubrificação do motor"
                  dense
                  outlined
                  :disable="saveLoading"
                  hide-bottom-space
                  class="custom-input"
                />
              </div>
              <div class="col-4">
                <q-input
                  v-model="form.coalescing_filter_model"
                  label="Modelo do filtro coalescente"
                  dense
                  outlined
                  :disable="saveLoading"
                  hide-bottom-space
                  class="custom-input"
                />
              </div>

            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="dialog-footer q-gutter-sm">
          <q-btn
            flat
            no-caps
            class="footer-action-btn"
            label="Cancelar"
            color="grey-8"
            :disable="saveLoading"
            @click="close"
          />
          <q-btn
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
        </q-card-actions>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import {
  getEquipamentById,
  createEquipament as createEquipamentService,
  updateEquipament as updateEquipamentService,
} from 'src/service/equipamentService'
import { getClientsToEquipament } from 'src/service/clientService'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  details: { type: [Object, String], default: null },
  refresh: { type: Function, default: () => {} }
})

const emit = defineEmits(['update:modelValue', 'save'])

const $q = useQuasar()

const saveLoading = ref(false)

const supplyVoltageOptions = ['220V', '380V', '440V']
const inputVoltageOptions = ['24V', '110V', '127V', '220V']
const listClients = ref([])
const loadingInitial = ref(false)

function emptyForm() {
  return {
    id: null,
    company_id: '',
    name: '',
    manufacture_date_display: '',
    compressor_unit_model: '',
    ihm_model: '',
    supply_voltage: '',
    intake_solenoid_voltage: '',
    serial_number: '',
    inverter_softstarter_brand_model: '',
    working_pressure: '',
    motor_lubrication_data: '',
    coalescing_filter_model: '',
    control_voltage: '',
    created_at: null,
    updated_at: null,
  }
}

const form = ref(emptyForm())

const isEdit = computed(() => Boolean(props.details))

const saveLabel = computed(() => (isEdit.value ? 'Atualizar' : 'Salvar'))

function hydrateFormFromObject(d) {
  form.value.id = d.id ?? null
  form.value.company_id = d.company_id ?? ''
  form.value.name = d.name ?? ''
  form.value.manufacture_date_display = d.manufacture_date ?? ''
  form.value.compressor_unit_model = d.compressor_unit_model ?? ''
  form.value.ihm_model = d.ihm_model ?? ''
  form.value.supply_voltage = d.supply_voltage ?? ''
  form.value.intake_solenoid_voltage = d.intake_solenoid_voltage ?? ''
  form.value.control_voltage = d.control_voltage ?? ''
  form.value.serial_number = d.serial_number ?? ''
  form.value.inverter_softstarter_brand_model = d.inverter_softstarter_brand_model ?? ''
  form.value.working_pressure = d.working_pressure ?? ''
  form.value.motor_lubrication_data = d.motor_lubrication_data ?? ''
  form.value.coalescing_filter_model = d.coalescing_filter_model ?? ''
  form.value.created_at = d.created_at ?? null
  form.value.updated_at = d.updated_at ?? null
}

async function hydrateForm() {
  if (!props.details) {
    form.value = emptyForm()
    return
  }

  if (typeof props.details === 'string') {
    try {
      saveLoading.value = true
      const resp = await getEquipamentById(props.details)
      const body = resp.data
      if (body?.success && body.data) {
        hydrateFormFromObject(body.data)
      } else {
        $q.notify({ message: body?.message || 'Não foi possível carregar equipamento.', color: 'warning' })
      }
    } catch (e) {
      console.error(e)
      $q.notify({ message: 'Erro ao buscar equipamento.', color: 'negative' })
    } finally {
      saveLoading.value = false
    }
  } else {
    hydrateFormFromObject(props.details)
  }
}

onMounted(async () => {
  loadingInitial.value = true
  
  if (!isEdit.value) {
    const response = await getClientsToEquipament()

    if (response?.status === 200) {
      listClients.value = response.data.data || []
    } else {
      console.log("sadasgudguisagi")
      $q.notify({ message: 'Erro ao carregar clientes para equipamento.', color: 'negative' })
    }

    loadingInitial.value = false

    return
  }
  
  const equipament = await getEquipamentById(props.details.id)

  if (equipament?.status === 200) {
    hydrateFormFromObject(equipament.data.data)
  } else {
    $q.notify({ message: 'Erro ao carregar detalhes do equipamento.', color: 'negative' })
  }

  listClients.value = [
    {
      id: props.details.id_company,
      name: props.details.company_name || 'Cliente do equipamento'
    }
  ]
  

  loadingInitial.value = false
})

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      hydrateForm()
    }
  },
)

function strOrNull(v) {
  if (v === null || v === undefined) return null
  const s = String(v).trim()
  return s === '' ? null : s
}

function buildPayload() {
  const f = form.value

  return {
    id: f.id,
    name: strOrNull(f.name),
    manufacture_date: f.manufacture_date_display,
    compressor_unit_model: strOrNull(f.compressor_unit_model),
    ihm_model: strOrNull(f.ihm_model),
    supply_voltage: strOrNull(f.supply_voltage),
    intake_solenoid_voltage: strOrNull(f.intake_solenoid_voltage),
    control_voltage: strOrNull(f.control_voltage),
    serial_number: strOrNull(f.serial_number),
    inverter_softstarter_brand_model: strOrNull(f.inverter_softstarter_brand_model),
    working_pressure: strOrNull(f.working_pressure),
    motor_lubrication_data: strOrNull(f.motor_lubrication_data),
    coalescing_filter_model: strOrNull(f.coalescing_filter_model),
    created_at: f.created_at,
    updated_at: f.updated_at,
  }
}

async function createEquipament(body) {
  saveLoading.value = true
  try {
    const response = await createEquipamentService(body, form.value.company_id)

    if (response?.status === 200) {
      $q.notify({ message: 'Equipamento criado com sucesso!', color: 'positive', position: 'top', icon: 'ion-md-checkmark-circle' })
    } else {
      $q.notify({ message: 'Erro ao criar equipamento!', color: 'negative', position: 'top', icon: 'ion-md-close-circle' })
    }
    return response
  } catch (e) {
    console.error(e)
    $q.notify({ message: 'Erro ao criar equipamento.', color: 'negative' })
    throw e
  } finally {
    saveLoading.value = false
  }
}

async function updateEquipament(body) {
  saveLoading.value = true
  try {
    const response = await updateEquipamentService(body, form.value.company_id)
    if (response?.status === 200) {
      $q.notify({ message: 'Equipamento atualizado com sucesso!', color: 'positive', position: 'top', icon: 'ion-md-checkmark-circle' })
    } else {
      $q.notify({ message: 'Erro ao atualizar equipamento!', color: 'negative', position: 'top', icon: 'ion-md-close-circle' })
    }
    return response
  } catch (e) {
    console.error(e)
    $q.notify({ message: 'Erro ao atualizar equipamento.', color: 'negative' })
    throw e
  } finally {
    saveLoading.value = false
  }
}

function close() {
  emit('update:modelValue', false)
}

function closeWithRefresh() {
  emit('update:modelValue', false)
  props.refresh()
}

function validateForm() {
  if (!strOrNull(form.value.name)) {
    $q.notify({ message: 'Informe o nome.', color: 'negative', position: 'top', icon: 'ion-md-warning' })
    return false
  }

  if (!strOrNull(form.value.company_id)) {
    $q.notify({ message: 'Selecione o cliente.', color: 'negative', position: 'top', icon: 'ion-md-warning' })
    return false
  }

  return true
}

async function onSave() {
  if (!validateForm()) return

  const payload = buildPayload()

  console.log('Payload to save:', JSON.stringify(payload, null, 2))

  try {
    if (isEdit.value) {
      await updateEquipament(payload)
    } else {
      await createEquipament(payload)
    }
    emit('save', payload)
    closeWithRefresh()
  } catch (e) {
    console.error(e)
  }
}
</script>

<style scoped lang="scss">
.dialog-card {
  min-width: min(820px, 100vw);
  width: min(820px, 100vw);
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
    background: #ede9fe;
    color: #6d28d9;
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
  padding: 22px 24px;
  background: var(--bg-muted);
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

.dialog-footer {
  padding: 16px 24px;
  background: var(--bg-surface);
}

.footer-action-btn {
  padding: 0 20px;
  height: 44px;
  min-width: 120px;
  border-radius: var(--radius-md);
  font-weight: 600;
}
</style>
