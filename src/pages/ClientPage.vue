<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h4 text-weight-bold">Clientes</div>
      <q-btn
        color="primary"
        unelevated
        icon="ion-md-add"
        label="Adicionar cliente"
        @click="openAddClient"
        rounded
      />
    </div>
    <q-input
      v-model="search"
      outlined
      placeholder="Buscar por documento ou nome..."
      class="custom-input q-mb-md"
      dense
    >
      <template #prepend>
        <q-icon name="ion-md-search" />
      </template>

      <template v-if="search" #append>
        <q-icon name="ion-md-close" class="cursor-pointer" @click="search = ''" />
      </template>
    </q-input>

    <q-table
      v-model:pagination="pagination"
      class="rounded-table"
      flat
      bordered
      :rows="filteredClients"
      :columns="columns"
      row-key="id"
      :loading="loading"
      loading-label="Carregando..."
      :rows-per-page-options="[10, 25, 50, 100]"
      no-data-label="Nenhum cliente encontrado"
    >
      <template #body-cell-actions="props">
        <q-td :props="props">
          <div class="row no-wrap items-center justify-center q-gutter-x-sm">
            <q-btn
              flat
              round
              dense
              icon="ion-md-create"
              color="primary"
              aria-label="Editar"
              @click="openEditClient(props.row)"
            />
            <q-btn flat round dense icon="ion-md-build" color="primary" aria-label="Equipamento" />
            <q-btn flat round dense icon="ion-md-trash" color="negative" aria-label="Remover" />
          </div>
        </q-td>
      </template>
    </q-table>

    <AddUpdateClient v-model="clientDialogOpen" :details="clientFormDetails" />
  </q-page>
</template>

<script setup>
import { getClients } from '../service/clientService'
import { ref, computed, onMounted } from 'vue'
import AddUpdateClient from '../components/AddUpdateClient.vue'

const clientDialogOpen = ref(false)
const clientFormDetails = ref(null)

function openAddClient() {
  clientFormDetails.value = null
  clientDialogOpen.value = true
}

function openEditClient(row) {
  clientFormDetails.value = row
  clientDialogOpen.value = true
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
  },
  {
    name: 'name',
    label: 'Nome',
    field: (row) => row.name ?? '—',
    align: 'left',
    sortable: true,
  },
  {
    name: 'email',
    label: 'E-mail',
    field: (row) => row.email ?? '—',
    align: 'left',
    sortable: true,
  },
  {
    name: 'phone',
    label: 'Telefone',
    field: (row) => row.phone ?? '—',
    align: 'left',
    sortable: true,
  },
  {
    name: 'created_at',
    label: 'Criado em',
    field: 'created_at',
    align: 'left',
    sortable: true,
    format: (val) => (val ? new Date(val).toLocaleString('pt-BR') : '—'),
  },
  { name: 'actions', label: 'Ações', field: 'id', align: 'center', sortable: false },
]

const filteredClients = computed(() => {
  const q = search.value.trim().toLowerCase()

  if (!q) {
    return clients.value
  }
  return clients.value.filter((c) => {
    const doc = (c.document || '').toLowerCase()
    const name = (c.name || '').toLowerCase()
    return doc.includes(q) || name.includes(q)
  })
})

onMounted(async () => {
  loading.value = true

  try {
    const response = await getClients()
    clients.value = response.data.data
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.rounded-table {
  border-radius: 16px;
  overflow: hidden;
}
</style>
