<template>
  <q-page padding class="list-page">
    <header class="page-header">
      <div>
        <div class="page-header__title">Equipamentos</div>
        <div class="page-header__subtitle">
          {{ equipaments.length }} {{ equipaments.length === 1 ? 'equipamento cadastrado' : 'equipamentos cadastrados' }}
        </div>
      </div>
      <div class="page-header__actions">
        <q-btn
          color="primary"
          unelevated
          icon="ion-md-add"
          label="Adicionar equipamento"
          @click="openAddEquipment"
          class="primary-action-btn"
          rounded
        />
      </div>
    </header>

    <div class="surface-card toolbar">
      <q-input
        v-model="search"
        outlined
        placeholder="Buscar por nome do equipamento ou empresa..."
        class="custom-input toolbar__search"
        dense
        clearable
        @update:model-value="onFilter"
        debounce="300"
      >
        <template #prepend>
          <q-icon name="ion-md-search" />
        </template>
      </q-input>

      <q-select
        v-model="selectedClients"
        :options="filteredClients"
        option-label="company_name"
        option-value="id"
        outlined
        dense
        input-debounce="0"
        label="Cliente"
        emit-value
        map-options
        class="custom-input toolbar__filter"
        clearable
      >
        <template #prepend>
          <q-icon name="ion-md-business" />
        </template>
        <template #no-option>
          <q-item>
            <q-item-section class="text-grey">Nenhum cliente</q-item-section>
          </q-item>
        </template>
      </q-select>
    </div>

    <q-table
      v-model:pagination="pagination"
      class="rounded-table"
      flat
      :rows="filteredEquipaments"
      :columns="columns"
      row-key="id"
      :loading="loading"
      loading-label="Carregando equipamentos..."
      :rows-per-page-options="[10, 25, 50, 100]"
      no-data-label="Nenhum equipamento encontrado"
    >
      <template #no-data>
        <div class="empty-state">
          <q-icon name="ion-md-build" size="42px" />
          <div class="empty-state__title">Nenhum equipamento encontrado</div>
          <div class="empty-state__hint">
            {{ search || selectedClients?.length ? 'Tente ajustar os filtros.' : 'Cadastre o primeiro equipamento.' }}
          </div>
        </div>
      </template>

      <template #body-cell-name="props">
        <q-td :props="props">
          <div class="equip-cell">
            <div class="equip-cell__icon">
              <q-icon name="ion-md-build" size="18px" />
            </div>
            <div>
              <div class="equip-cell__name">{{ props.row.name || '—' }}</div>
              <div class="equip-cell__hint">{{ props.row.company_name || 'Sem cliente' }}</div>
            </div>
          </div>
        </q-td>
      </template>

      <template #body-cell-manufacture_date="props">
        <q-td :props="props">
          <span class="status-chip status-chip--neutral">
            <q-icon name="ion-md-calendar" size="14px" />
            {{ props.row.manufacture_date || '—' }}
          </span>
        </q-td>
      </template>

      <template #body-cell-actions="props">
        <q-td :props="props">
          <div class="row no-wrap items-center justify-center q-gutter-x-xs">
            <q-btn
              flat
              round
              dense
              icon="ion-md-create"
              color="primary"
              aria-label="Editar"
              @click="openEditEquipment(props.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="ion-md-trash"
              color="negative"
              aria-label="Remover"
              @click="confirmDelete(props.row.id_company, props.row.id)"
            >
              <q-tooltip>Remover</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>
    </q-table>

    <AddUpdateEquipament
      v-if="clientDialogOpen"
      v-model:modelValue="clientDialogOpen"
      :details="clientFormDetails"
      :refresh="start"
    />
  </q-page>
</template>

<script setup>
import { deleteEquipament, getEquipaments } from '../service/equipamentService'
import AddUpdateEquipament from '../components/AddUpdateEquipament.vue'
import { ref, onBeforeMount, watch } from 'vue'
import { useQuasar, Dialog } from 'quasar'
import { useRoute, useRouter } from 'vue-router'

const clientDialogOpen = ref(false)
const clientFormDetails = ref(null)

const $q = useQuasar()

const equipaments = ref([])
const clients = ref([])
const selectedClients = ref([])
const filteredClients = ref([])
const filteredEquipaments = ref([])
const route = useRoute()
const router = useRouter()

const search = ref('')
const loading = ref(false)

const pagination = ref({
  page: 1,
  rowsPerPage: 50,
  sortBy: null,
  descending: false,
})

const columns = [
  {
    name: 'name',
    label: 'Equipamento',
    field: (row) => row.name ?? '—',
    align: 'left',
    sortable: true,
  },
  {
    name: 'manufacture_date',
    label: 'Fabricação',
    field: (row) => row.manufacture_date ?? '—',
    align: 'left',
    sortable: true,
  },
  {
    name: 'company_name',
    label: 'Empresa',
    field: (row) => row.company_name ?? '—',
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

onBeforeMount(async () => {
  start()
})

const start = async () => {
  loading.value = true
  try {
    const response = await getEquipaments()
    equipaments.value = response.data.data

    clients.value = Object.values(
      response.data.data.reduce((acc, item) => {
        if (!acc[item.id_company]) {
          acc[item.id_company] = {
            id: item.id_company,
            company_name: item.company_name,
          }
        }
        return acc
      }, {}),
    )

    clients.value.sort((a, b) => a.company_name.localeCompare(b.company_name))

    filteredClients.value = clients.value
    filteredEquipaments.value = equipaments.value

    const idFromUrl = route.query.id_company

    if (idFromUrl) {
      router.replace({ query: {} })
      const companyExists = clients.value.find((c) => c.id === idFromUrl)

      if (!companyExists) {
        $q.notify({
          message: 'Nenhum equipamento foi encontrado para esse cliente!',
          color: 'warning',
          position: 'top',
          icon: 'ion-md-warning',
        })
        return
      }

      selectedClients.value = companyExists.id
      filteredEquipaments.value = onFilterClient(filteredEquipaments.value)
    }
  } finally {
    loading.value = false
  }
}

function openAddEquipment() {
  clientFormDetails.value = null
  clientDialogOpen.value = true
}

function openEditEquipment(row) {
  clientFormDetails.value = row
  clientDialogOpen.value = true
}

watch(selectedClients, () => {
  onFilter()
})

const onFilterSearch = () => {
  const q = (search.value || '').trim().toLowerCase()
  if (!q) return equipaments.value

  return equipaments.value.filter((e) => {
    const nameEquipament = (e.name || '').toLowerCase()
    const nameCompany = (e.company_name || '').toLowerCase()
    return nameEquipament.includes(q) || nameCompany.includes(q)
  })
}

const onFilterClient = (eq) => {
  if (selectedClients.value == null || selectedClients.value.length === 0) {
    return eq
  }
  if (eq.length === 0) return eq
  return eq.filter((e) => selectedClients.value.includes(e.id_company))
}

const onFilter = () => {
  const eqFiltered = onFilterClient(onFilterSearch())
  filteredEquipaments.value = eqFiltered
}

const confirmDelete = (idCompany, id) => {
  Dialog.create({
    title: 'Confirmar ação',
    message: 'Você tem certeza que quer remover esse equipamento?',
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Remover', color: 'negative', unelevated: true },
    persistent: true,
  }).onOk(async () => {
    const dialog = Dialog.create({
      message: 'Removendo equipamento...',
      progress: true,
      persistent: true,
      ok: false,
    })

    try {
      await deleteEquipament(idCompany, id)
      dialog.hide()
      $q.notify({
        message: 'Equipamento removido com sucesso!',
        color: 'positive',
        icon: 'ion-md-checkmark-circle',
      })
      start()
    } catch (error) {
      console.log(error)
      dialog.hide()
      $q.notify({
        message: 'Erro ao remover equipamento!',
        color: 'negative',
        icon: 'ion-md-close-circle',
      })
    }
  })
}
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
  flex-wrap: wrap;
  align-items: center;

  &__search {
    flex: 1;
    min-width: 260px;
  }

  &__filter {
    width: 280px;
  }
}

.equip-cell {
  display: flex;
  align-items: center;
  gap: 12px;

  &__icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: #ede9fe;
    color: #6d28d9;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__name {
    font-weight: 600;
    color: var(--text-strong);
    font-size: 0.9rem;
  }

  &__hint {
    font-size: 0.78rem;
    color: var(--text-muted);
    margin-top: 2px;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
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
