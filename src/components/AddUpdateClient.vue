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
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ isEdit ? 'Editar cliente' : 'Novo cliente' }}</div>
        <q-space />
        <q-btn flat round dense icon="ion-md-close" aria-label="Fechar" @click="close" />
      </q-card-section>

      <q-separator class="q-mt-md" />

      <q-card-section class="col scroll">
        <div class="column q-gutter-sm">
          <q-input
            v-model="form.name"
            label="Nome"
            dense
            outlined
            :disable="saveLoading"
            hide-bottom-space
            rounded
            class="custom-input"
          />
          <q-input
            :model-value="form.document"
            label="Documento (CNPJ)"
            dense
            outlined
            :disable="saveLoading"
            hide-bottom-space
            maxlength="18"
            autocomplete="off"
            class="custom-input"
            @update:model-value="onDocumentUpdate"
          />

          <q-expansion-item
            v-model="expandConta"
            header-class="q-pa-none q-pl-sm q-mt-md"
            header-style="border-bottom: 1px solid #e0e0e0;"
            label="Informações de conta"
          >
            <div class="column q-col-gutter-sm q-pt-sm">
              <q-input
                v-model="form.email"
                label="E-mail"
                type="email"
                dense
                outlined
                autocomplete="off"
                :disable="saveLoading"
                hide-bottom-space
                class="custom-input"
              />
              <q-input
                v-model="form.phone"
                label="Telefone"
                dense
                outlined
                :disable="saveLoading"
                hide-bottom-space
                class="custom-input"
              />
            </div>
          </q-expansion-item>

          <q-expansion-item
            v-model="expandEndereco"
            label="Endereço"
            header-class="q-pa-none q-pl-sm"
            header-style="border-bottom: 1px solid #e0e0e0;"
          >
            <div class="column q-pt-sm q-pb-sm">
              <div class="row q-col-gutter-sm">
                <div class="col-3">
                  <q-input
                    :model-value="form.zip_code"
                    label="CEP"
                    dense
                    outlined
                    :disable="saveLoading"
                    :loading="cepLookupLoading"
                    hide-bottom-space
                    :maxlength="CEP_MAX_DIGITS"
                    autocomplete="postal-code"
                    class="custom-input"
                    @update:model-value="onZipCodeUpdate"
                    @blur="onCepBlur"
                  />
                </div>
                <div class="col-7">
                  <q-input
                    v-model="form.street"
                    label="Logradouro"
                    dense
                    outlined
                    :disable="saveLoading"
                    hide-bottom-space
                    class="custom-input"
                  />
                </div>
                <div class="col-2">
                  <q-input
                    :model-value="form.number"
                    label="Número"
                    dense
                    outlined
                    :disable="saveLoading"
                    hide-bottom-space
                    :maxlength="ADDRESS_NUMBER_MAX_DIGITS"
                    autocomplete="off"
                    class="custom-input"
                    @update:model-value="onNumberUpdate"
                  />
                </div>
                <div class="col-6">
                  <q-input
                    v-model="form.neighborhood"
                    label="Bairro"
                    dense
                    outlined
                    :disable="saveLoading"
                    hide-bottom-space
                    class="custom-input"
                  />
                </div>
                <div class="col-6">
                  <q-input
                    v-model="form.city"
                    label="Cidade"
                    dense
                    outlined
                    :disable="saveLoading"
                    hide-bottom-space
                    class="custom-input"
                  />
                </div>
                <div class="col-6">
                  <q-input
                    v-model="form.complement"
                    label="Complemento"
                    dense
                    outlined
                    :disable="saveLoading"
                    hide-bottom-space
                    class="custom-input"
                  />
                </div>
                <div class="col-6">
                  <q-input
                    v-model="form.state"
                    label="UF"
                    dense
                    outlined
                    maxlength="2"
                    :disable="saveLoading"
                    hide-bottom-space
                    class="custom-input"
                  />
                </div>
              </div>
            </div>
          </q-expansion-item>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-px-lg q-py-lg q-gutter-md">
        <q-btn
          flat
          no-caps
          class="footer-action-btn"
          label="Fechar"
          color="primary"
          rounded
          :disable="saveLoading"
          @click="close"
        />
        <q-btn
          unelevated
          no-caps
          class="footer-action-btn"
          color="primary"
          :label="saveLabel"
          rounded
          :loading="saveLoading"
          :disable="saveLoading"
          @click="onSave"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import {
  maskCnpjFromString,
  digitsOnlySlice,
  CEP_MAX_DIGITS,
  ADDRESS_NUMBER_MAX_DIGITS,
  unmask,
} from '../utils/masks'
import { getInfoCep } from '../service/cepService'
import { createClient as createClientService, updateClient as updateClientService} from 'src/service/clientService'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  details: { type: Object, default: null },
  refresh: { type: Function, default: () => {} }
})

const emit = defineEmits(['update:modelValue', 'save'])

const $q = useQuasar()

const expandConta = ref(true)
const expandEndereco = ref(true)
const saveLoading = ref(false)
const cepLookupLoading = ref(false)

function emptyForm() {
  return {
    id: null,
    client_id: '',
    name: '',
    document: '',
    email: '',
    phone: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: '',
    created_at: null,
    updated_at: null,
  }
}

const form = ref(emptyForm())

const isEdit = computed(() => Boolean(form.value.id))

const saveLabel = computed(() => (isEdit.value ? 'Atualizar' : 'Salvar'))

function onDocumentUpdate(val) {
  form.value.document = maskCnpjFromString(val)
}

function onZipCodeUpdate(val) {
  form.value.zip_code = digitsOnlySlice(val, CEP_MAX_DIGITS)
}

function onNumberUpdate(val) {
  form.value.number = digitsOnlySlice(val, ADDRESS_NUMBER_MAX_DIGITS)
}

function hydrateForm() {
  if (props.details) {
    const d = props.details
    form.value = {
      id: d.id ?? null,
      client_id: d.client_id ?? '',
      name: d.name ?? '',
      document: maskCnpjFromString(d.document ?? ''),
      email: d.email ?? '',
      phone: d.phone ?? '',
      street: d.street ?? '',
      number: digitsOnlySlice(d.number, ADDRESS_NUMBER_MAX_DIGITS),
      complement: d.complement ?? '',
      neighborhood: d.neighborhood ?? '',
      city: d.city ?? '',
      state: d.state ?? '',
      zip_code: digitsOnlySlice(d.zip_code, CEP_MAX_DIGITS),
      created_at: d.created_at ?? null,
      updated_at: d.updated_at ?? null,
    }
  } else {
    form.value = emptyForm()
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      hydrateForm()
    }
  },
)

function strOrNull(v) {
  if (v === null || v === undefined) {
    return null
  }
  const s = String(v).trim()
  return s === '' ? null : s
}

function buildPayload() {
  const f = form.value

  return {
    id: f.id,
    client_id: strOrNull(f.client_id),
    name: strOrNull(f.name),
    document: unmask(f.document),
    email: strOrNull(f.email),
    phone: strOrNull(f.phone),
    street: strOrNull(f.street),
    number: strOrNull(f.number),
    complement: strOrNull(f.complement),
    neighborhood: strOrNull(f.neighborhood),
    city: strOrNull(f.city),
    state: strOrNull(f.state),
    zip_code: strOrNull(f.zip_code),
    created_at: f.created_at,
    updated_at: f.updated_at,
  }
}

async function createClient(body) {
  saveLoading.value = true

  const response = await createClientService(body);

  if (response?.status === 201) {
    $q.notify({
      message: "Cliente criado com sucesso!",
      color: 'positive',
      position: 'top',
      icon: 'ion-md-checkmark-circle'
    })
  } else {
    $q.notify({
      message: "Erro ao criar cliente!",
      color: 'negative',
      position: 'top',
      icon: 'ion-md-close-circle'
    })
  }

  saveLoading.value = false
}

async function updateClient(body) {
  saveLoading.value = true

  const response = await updateClientService(body, form.value.id);

  if (response?.status === 200) {
    $q.notify({
      message: "Cliente criado com sucesso!",
      color: 'positive',
      position: 'top',
      icon: 'ion-md-checkmark-circle'
    })
  } else {
    $q.notify({
      message: "Erro ao criar cliente!",
      color: 'negative',
      position: 'top',
      icon: 'ion-md-close-circle'
    })
  }

  saveLoading.value = false
}

function close() {
  emit('update:modelValue', false)
}

function closeWithRefresh() {
  emit('update:modelValue', false)
  props.refresh();
}

function validateForm() {
  if (!strOrNull(form.value.name)) {
    $q.notify({
      message: 'Informe o nome.',
      color: 'negative',
      position: 'top',
      icon: 'ion-md-warning',
    })
    return false
  }
  if (!strOrNull(form.value.document)) {
    $q.notify({
      message: 'Informe o documento.',
      color: 'negative',
      position: 'top',
      icon: 'ion-md-warning',
    })
    return false
  }
  return true
}

async function onSave() {
  if (!validateForm()) {
    return
  }

  const payload = buildPayload()

  saveLoading.value = true
  
  try {
    if (isEdit.value) {
      await updateClient(payload)
    } else {
      await createClient(payload)
    }
    emit('save', payload)
    closeWithRefresh()
  } catch (e) {
    console.error(e)
    $q.notify({
      message: 'Não foi possível salvar. Tente novamente.',
      color: 'negative',
      position: 'top',
    })
  } finally {
    saveLoading.value = false
  }
}

async function onCepBlur() {
  const cep = digitsOnlySlice(form.value.zip_code, CEP_MAX_DIGITS)
  if (cep.length !== CEP_MAX_DIGITS) {
    return
  }

  cepLookupLoading.value = true

  try {
    const response = await getInfoCep(cep)
    const body = response.data

    if (!body?.success || !body?.data) {
      $q.notify({
        message: body?.message || 'CEP não encontrado.',
        color: 'warning',
        position: 'top',
        icon: 'ion-md-warning',
      })
      return
    }

    const d = body.data
    form.value.street = d.street ?? ''
    form.value.neighborhood = d.neighborhood ?? ''
    form.value.city = d.city ?? ''
    form.value.state = String(d.state ?? '')
      .slice(0, 2)
      .toUpperCase()
    if (d.cep) {
      form.value.zip_code = digitsOnlySlice(d.cep, CEP_MAX_DIGITS)
    }
  } catch (e) {
    const msg = e?.response?.data?.message || 'Erro ao buscar o CEP. Tente novamente.'
    $q.notify({
      message: msg,
      color: 'negative',
      position: 'top',
      icon: 'ion-md-warning',
    })
  } finally {
    cepLookupLoading.value = false
  }
}
</script>

<style scoped>
.footer-action-btn {
  padding-right: 20px;
  padding-left: 20px;
  height: 48px;
  width: 120px;
}

.dialog-card {
  min-width: min(900px, 100vw);
  border-top-left-radius: 16px;
  border-bottom-left-radius: 16px;
}
</style>
