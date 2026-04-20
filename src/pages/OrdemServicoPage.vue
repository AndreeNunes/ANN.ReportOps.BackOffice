<template>
  <q-page padding class="row ordem-page">
    <!-- Left tree inline -->
    <div v-if="treeVisible" class="left-panel column">
      <q-input
        v-model="filter"
        outlined
        dense
        placeholder="Buscar empresas..."
        class="q-mb-sm"
      >
        <template #prepend>
          <q-icon name="ion-md-search" />
        </template>
      </q-input>

      <q-scroll-area class="left-scroll">
        <q-list bordered dense>
          <q-item-label header>Empresas</q-item-label>

          <div v-if="loadingCompanies" class="row items-center justify-center q-pa-md">
            <q-spinner-dots size="30" />
          </div>

          <q-expansion-item
            v-for="company in filteredCompanies"
            :key="company.id_company"
            v-model="company.expanded"
            dense
            expand-separator
            @show="onExpandCompany(company)"
          >
            <template #header>
              <div class="row items-center justify-between" style="width:100%;">
                <div class="row items-center ellipsis">
                  <q-icon name="ion-md-business" class="q-mr-sm" />
                  <div class="text-subtitle2 ellipsis">{{ company.label }}</div>
                </div>
                <q-badge color="primary">{{ company.total_ordens_service }}</q-badge>
              </div>
            </template>

            <q-list dense>
              <q-item v-if="company.loading">
                <q-item-section>
                  <q-spinner-dots size="20" />
                </q-item-section>
                <q-item-section>Carregando ordens...</q-item-section>
              </q-item>

              <q-item
                v-for="order in company.orders || []"
                :key="order.id"
                clickable
                @click="selectOrder(order)"
              >
                <q-item-section>
                  <q-item-label>{{ order.OS_number }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="company.orders && company.orders.length === 0">
                <q-item-section>Nenhuma ordem encontrada</q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>
        </q-list>
      </q-scroll-area>
    </div>

    <!-- Right panel -->
    <div class="column right-panel q-pl-md" style="flex:1; min-width:0;">
      <div class="row items-center justify-between q-mb-sm">
        <div class="row items-center">
          <q-btn flat dense round icon="ion-md-menu" @click="toggleTree" aria-label="Alternar árvore" />
          <div class="text-h5 q-ml-sm">Ordens de Serviço</div>
        </div>
      </div>

      <q-scroll-area class="right-scroll">
        <div class="q-pa-sm">
          <div v-if="selectedOrderJson">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-h6 q-mb-sm">Detalhes da Ordem</div>
                <pre class="json-pre">{{ selectedOrderJson }}</pre>
              </q-card-section>
            </q-card>
          </div>

          <div v-else class="text-grey">Selecione uma ordem à esquerda para ver o JSON</div>
        </div>
      </q-scroll-area>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { getOrderCounts, getOrdersByCompany, getOrderById } from '../service/reportService'

const $q = useQuasar()

const companies = ref([])
const loadingCompanies = ref(false)
const filter = ref('')
const selectedOrderJson = ref(null)
const treeVisible = ref(true)

onMounted(async () => {
  loadingCompanies.value = true

  try {
    const response = await getOrderCounts()
    const data = response.data?.data || []

    companies.value = data.map((c) => ({
      ...c,
      orders: null,
      loading: false,
      expanded: false,
    }))
  } catch (error) {
    console.error(error)
    $q.notify({ message: 'Erro ao carregar empresas', color: 'negative' })
  } finally {
    loadingCompanies.value = false
  }
})

const filteredCompanies = computed(() => {
  const q = filter.value.trim().toLowerCase()

  if (!q) return companies.value

  return companies.value.filter((c) => (c.label || '').toLowerCase().includes(q))
})

async function onExpandCompany(company) {
  if (company.expanded && company.orders === null) {
    company.loading = true

    try {
      const response = await getOrdersByCompany(company.id_company)
      company.orders = response.data?.data || []
    } catch (error) {
      console.error(error)
      $q.notify({ message: 'Erro ao carregar ordens da empresa', color: 'negative' })
      company.orders = []
    } finally {
      company.loading = false
    }
  }
}

async function selectOrder(order) {
  selectedOrderJson.value = null

  try {
    const response = await getOrderById(order.id)
    const payload = response.data?.data?.ordem_service ?? response.data?.data ?? response.data
    selectedOrderJson.value = JSON.stringify(payload, null, 2)
  } catch (error) {
    console.error(error)
    $q.notify({ message: 'Erro ao carregar ordem', color: 'negative' })
  }
}

function toggleTree() {
  treeVisible.value = !treeVisible.value
}
</script>

<style scoped>
.ordem-page {
  align-items: stretch;
}
.left-panel {
  width: 640px;
  max-width: 40%;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
}

.left-scroll {
  flex: 1 1 auto;
  min-height: 0;
}
.right-panel {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
}
.right-scroll {
  flex: 1 1 auto;
  min-height: 0;
}
.json-pre {
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 13px;
}
.open-tree-btn { display: none }
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Hide native scrollbars but keep content scrollable */
.left-scroll,
.left-scroll .q-scrollarea__content,
.right-scroll,
.right-scroll .q-scrollarea__content {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
.left-scroll::-webkit-scrollbar,
.left-scroll .q-scrollarea__content::-webkit-scrollbar,
.right-scroll::-webkit-scrollbar,
.right-scroll .q-scrollarea__content::-webkit-scrollbar {
  display: none; /* WebKit */
  width: 0;
  height: 0;
}
</style>
