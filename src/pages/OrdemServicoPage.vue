<template>
  <q-page padding class="list-page">
    <header class="page-header">
      <div>
        <div class="page-header__title">Ordem de Serviço</div>
        <div class="page-header__subtitle">
          {{ orders.length }} {{ orders.length === 1 ? 'ordem registrada' : 'ordens registradas' }}
        </div>
      </div>
      <div class="page-header__actions">
        <q-btn
          color="primary"
          unelevated
          icon="ion-md-add"
          label="Adicionar ordem de serviço"
          @click="openAddOrder"
          class="primary-action-btn"
          rounded
        />
      </div>
    </header>

    <div class="surface-card toolbar">
      <q-input
        v-model="search"
        outlined
        placeholder="Buscar por OS, empresa ou equipamento..."
        class="custom-input toolbar__search"
        dense
        clearable
      >
        <template #prepend>
          <q-icon name="ion-md-search" />
        </template>
      </q-input>
    </div>

    <q-table
      v-model:pagination="pagination"
      class="rounded-table"
      flat
      :rows="filteredOrders"
      :columns="columns"
      :loading="loading"
      loading-label="Carregando ordens..."
      :rows-per-page-options="[10, 25, 50, 100]"
      no-data-label="Nenhuma ordem de serviço encontrada"
    >
      <template #no-data>
        <div v-if="!loading" class="empty-state">
          <q-icon name="ion-md-clipboard" size="42px" />
          <div class="empty-state__title">Nenhuma ordem de serviço</div>
          <div class="empty-state__hint">
            {{ search ? 'Tente ajustar os filtros.' : 'Quando ordens forem criadas, elas aparecerão aqui.' }}
          </div>
        </div>
      </template>

      <template #body-cell-OS="props">
        <q-td :props="props">
          <span class="os-badge">#{{ props.row.OS_number || '—' }}</span>
        </q-td>
      </template>

      <template #body-cell-name_company="props">
        <q-td :props="props">
          <div class="text-weight-medium">{{ props.row.name_company || '—' }}</div>
        </q-td>
      </template>

      <template #body-cell-actions="props">
        <q-td :props="props">
          <div class="row q-gutter-sm justify-center no-wrap">
            <q-btn
              color="primary"
              unelevated
              icon="ion-md-create"
              label="Editar"
              @click="openEditOrder(props.row)"
              rounded
              size="sm"
            />
            <q-btn
              color="secondary"
              unelevated
              icon="ion-md-download"
              label="PDF"
              :loading="pdfLoadingId === props.row.id"
              :disable="pdfLoadingId && pdfLoadingId !== props.row.id"
              @click="downloadOrderPdf(props.row)"
              rounded
              size="sm"
            />
          </div>
        </q-td>
      </template>
    </q-table>

    <AddUpdateOrdemServico
      v-if="orderDialogOpen"
      v-model:modelValue="orderDialogOpen"
      :details="orderFormDetails"
      :refresh="loadOrders"
    />
  </q-page>
</template>

<script setup>
import { getOrders } from 'src/service/reportService'
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import AddUpdateOrdemServico from 'src/components/AddUpdateOrdemServico.vue'
import { generateOrderPdf } from 'src/utils/generateOrderPdf'

const $q = useQuasar()

const orders = ref([])
const loading = ref(false)
const search = ref('')

const orderDialogOpen = ref(false)
const orderFormDetails = ref(null)
const pdfLoadingId = ref(null)

function openAddOrder() {
  orderFormDetails.value = null
  orderDialogOpen.value = true
}

function openEditOrder(row) {
  orderFormDetails.value = row
  orderDialogOpen.value = true
}

async function downloadOrderPdf(row) {
  if (!row?.id) return
  pdfLoadingId.value = row.id
  try {
    await generateOrderPdf(row.id)
  } catch (err) {
    console.error(err)
    $q.notify({
      message: err?.message || 'Erro ao gerar o PDF.',
      color: 'negative',
      position: 'top',
      icon: 'ion-md-close-circle',
    })
  } finally {
    pdfLoadingId.value = null
  }
}

const pagination = ref({
  page: 1,
  rowsPerPage: 50,
  sortBy: null,
  descending: false,
})

const columns = [
  {
    name: 'OS',
    label: 'Nº da OS',
    field: (row) => row.OS_number ?? '—',
    align: 'left',
    sortable: true,
  },
  {
    name: 'name_company',
    label: 'Empresa',
    field: (row) => row.name_company ?? '—',
    align: 'left',
    sortable: true,
  },
  {
    name: 'name_equipament',
    label: 'Equipamento',
    field: (row) => row.name_equipament ?? '—',
    align: 'left',
    sortable: true,
  },
  {
    name: 'closing_technician_responsible',
    label: 'Técnico responsável',
    field: (row) => row.closing_technician_responsible ?? '—',
    align: 'left',
    sortable: true,
  },
  {
    name: 'actions',
    label: 'Ações',
    field: 'id',
    align: 'center',
    sortable: false,
  },
]

const filteredOrders = computed(() => {
  const q = (search.value || '').trim().toLowerCase()
  if (!q) return orders.value
  return orders.value.filter((o) => {
    const os = String(o.OS_number || '').toLowerCase()
    const company = (o.name_company || '').toLowerCase()
    const equip = (o.name_equipament || '').toLowerCase()
    return os.includes(q) || company.includes(q) || equip.includes(q)
  })
})

async function loadOrders() {
  loading.value = true
  try {
    const response = await getOrders()
    if (response.status === 200) {
      orders.value = response.data.data || []
    }
  } finally {
    loading.value = false
  }
}

onMounted(loadOrders)
</script>

<style scoped lang="scss">
.list-page {
  max-width: 1280px;
  margin: 0 auto;
}

.primary-action-btn {
  height: 44px;
  padding: 0 20px;
}

.toolbar {
  padding: 14px;
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
  align-items: center;

  &__search {
    flex: 1;
    max-width: 480px;
  }
}

.os-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  background: var(--brand-50);
  color: var(--brand-600);
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 0.01em;
}

.empty-state {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 16px;
  color: var(--text-faint);

  &__title {
    margin-top: 12px;
    font-weight: 600;
    color: var(--text-base);
    font-size: 1rem;
  }

  &__hint {
    margin-top: 4px;
    font-size: 0.85rem;
    color: var(--text-muted);
  }
}
</style>
