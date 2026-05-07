<template>
  <q-page padding class="list-page">
    <header class="page-header">
      <div>
        <div class="page-header__title">Clientes</div>
        <div class="page-header__subtitle">
          {{ clients.length }} {{ clients.length === 1 ? 'empresa cadastrada' : 'empresas cadastradas' }}
        </div>
      </div>
      <div class="page-header__actions">
        <q-btn
          color="primary"
          unelevated
          icon="ion-md-add"
          label="Adicionar cliente"
          @click="openAddClient"
          class="primary-action-btn"
          rounded
        />
      </div>
    </header>

    <div class="surface-card toolbar">
      <q-input
        v-model="search"
        outlined
        placeholder="Buscar por documento ou nome..."
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
      :rows="filteredClients"
      :columns="columns"
      row-key="id"
      :loading="loading"
      loading-label="Carregando clientes..."
      :rows-per-page-options="[10, 25, 50, 100]"
      no-data-label="Nenhum cliente encontrado"
    >
      <template #no-data>
        <div v-if="!loading" class="empty-state">
          <q-icon name="ion-md-business" size="42px" />
          <div class="empty-state__title">Nenhum cliente encontrado</div>
          <div class="empty-state__hint">
            {{ search ? 'Tente ajustar os filtros de busca.' : 'Cadastre o primeiro cliente para começar.' }}
          </div>
          <q-btn
            v-if="!search"
            color="primary"
            unelevated
            icon="ion-md-add"
            label="Adicionar cliente"
            @click="openAddClient"
            rounded
            class="q-mt-md"
          />
        </div>
      </template>

      <template #body-cell-name="props">
        <q-td :props="props">
          <div class="client-cell">
            <div class="client-cell__avatar">
              {{ getInitials(props.row.name) }}
            </div>
            <div>
              <div class="client-cell__name">{{ props.row.name || '—' }}</div>
              <div class="client-cell__email">{{ props.row.email || 'Sem e-mail' }}</div>
            </div>
          </div>
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
              @click="openEditClient(props.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="ion-md-build"
              color="primary"
              aria-label="Equipamentos"
              @click="toEquipaments(props.row)"
            >
              <q-tooltip>Ver equipamentos</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="ion-md-trash"
              color="negative"
              aria-label="Remover"
              @click="confirmDelete(props.row.id)"
            >
              <q-tooltip>Remover</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>
    </q-table>

    <AddUpdateClient
      v-model="clientDialogOpen"
      :details="clientFormDetails"
      :refresh="start"
    />
  </q-page>
</template>

<script setup>
import { deleteClient, getClients } from '../service/clientService'
import { ref, computed, onMounted } from 'vue'
import { useQuasar, Dialog } from 'quasar'
import AddUpdateClient from '../components/AddUpdateClient.vue'
import { maskCnpjFromString, maskPhone } from 'src/utils/masks'

const clientDialogOpen = ref(false)
const clientFormDetails = ref(null)

const $q = useQuasar()

function openAddClient() {
  clientFormDetails.value = null
  clientDialogOpen.value = true
}

function openEditClient(row) {
  clientFormDetails.value = row
  clientDialogOpen.value = true
}

function getInitials(name) {
  if (!name) return '—'
  return name
    .split(' ')
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const confirmDelete = (id) => {
  Dialog.create({
    title: 'Confirmar ação',
    message: 'Você tem certeza que quer remover esse cliente?',
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Remover', color: 'negative', unelevated: true },
    persistent: true,
  }).onOk(async () => {
    const dialog = Dialog.create({
      message: 'Removendo cliente...',
      progress: true,
      persistent: true,
      ok: false,
    })

    try {
      await deleteClient(id)
      dialog.hide()
      $q.notify({
        message: 'Cliente removido com sucesso!',
        color: 'positive',
        icon: 'ion-md-checkmark-circle',
      })
      start()
    } catch (error) {
      console.log(error)
      dialog.hide()
      $q.notify({
        message: 'Erro ao remover cliente!',
        color: 'negative',
        icon: 'ion-md-close-circle',
      })
    }
  })
}

const clients = ref([])
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
    name: 'document',
    label: 'Documento',
    field: (row) => row.document ?? '—',
    align: 'left',
    sortable: true,
    format: (val) => (val ? maskCnpjFromString(val) : '—'),
  },
  {
    name: 'name',
    label: 'Nome',
    field: (row) => row.name ?? '—',
    align: 'left',
    sortable: true,
  },
  {
    name: 'phone',
    label: 'Telefone',
    field: (row) => row.phone ?? '—',
    align: 'left',
    sortable: true,
    format: (val) => (val ? maskPhone(val) : '—'),
  },
  {
    name: 'actions',
    label: 'Ações',
    field: 'id',
    align: 'center',
    sortable: false,
  },
]

const filteredClients = computed(() => {
  const q = (search.value || '').trim().toLowerCase()
  if (!q) return clients.value
  return clients.value.filter((c) => {
    const doc = (c.document || '').toLowerCase()
    const name = (c.name || '').toLowerCase()
    return doc.includes(q) || name.includes(q)
  })
})

onMounted(async () => {
  start()
})

const start = async () => {
  loading.value = true
  try {
    const response = await getClients()
    clients.value = response.data.data
  } finally {
    loading.value = false
  }
}

const toEquipaments = (row) => {
  window.location.href = `#/equipamentos?id_company=${row.id}`
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
  align-items: center;

  &__search {
    flex: 1;
    max-width: 480px;
  }
}

.client-cell {
  display: flex;
  align-items: center;
  gap: 12px;

  &__avatar {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: var(--brand-50);
    color: var(--brand-600);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.78rem;
    letter-spacing: 0.02em;
    flex-shrink: 0;
  }

  &__name {
    font-weight: 600;
    color: var(--text-strong);
    font-size: 0.9rem;
  }

  &__email {
    font-size: 0.78rem;
    color: var(--text-muted);
    margin-top: 2px;
  }
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
