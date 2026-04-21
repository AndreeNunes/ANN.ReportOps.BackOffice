<template>
  <q-page class="page-full">
    <div class="row full-row no-gutters">
      <div v-if="showLeft" class="col-4 panel panel-left">
        <div class="panel-content">
          <q-input
            v-model="filter"
            outlined
            dense
            placeholder="Buscar empresas..."
            class="custom-input q-mb-sm"
          >
            <template #prepend>
              <q-icon name="ion-md-search" />
            </template>

            <template v-slot:append>
              <q-icon
                v-if="filter !== ''"
                name="clear"
                class="cursor-pointer"
                @click="resetFilter"
              />
            </template>
          </q-input>

          <div v-if="loadingCompanies" class="row items-center justify-center q-pa-md">
            <q-spinner-dots size="30" />
          </div>

          <div v-else>
            <q-tree
              :nodes="ordersTrends"
              default-expand-all
              node-key="id_company"
              @lazy-load="onLazyLoad"
              :filter="filter"
              :filter-method="filterTree"
            />            
          </div>
        </div>
      </div>

      <div :class="showLeft ? 'col-8 panel panel-right' : 'col-12 panel panel-right'">
        <div class="panel-content">
          <div>
            <q-btn outline size="sm" :icon="showLeft ? 'ion-md-arrow-back' : 'ion-md-arrow-forward'" color="grey-6" @click="toggleLeft" class="border" />
          </div>
          <div class="q-mt-md">
              <div v-if="loadingOrderDetails" class="row items-center justify-center q-pa-md">
                <q-spinner-dots size="30" />
              </div>

              <div v-else-if="orderSelected">
                <form-order :order="orderSelected" />
              </div>

              <div v-else class="text-center q-pa-md">
                <q-icon name="ion-md-information-circle-outline" size="4em" color="primary" />
                <p class="text-grey font-semibold q-mt-md">Selecione uma ordem de serviço para ver os detalhes.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import FormOrder from 'src/components/FormOrder.vue'
import { getOrderById, getOrderCounts, getOrdersByCompany } from 'src/service/reportService'
import { ref, onMounted } from 'vue'

const showLeft = ref(true)
const loadingCompanies = ref(true)
const ordersTrends = ref([])
const orderSelected = ref(null)
const loadingOrderDetails = ref(false)
const filter = ref('')


onMounted(async () => {
  const response = await getOrderCounts()

  if (response.status == 200) {
    ordersTrends.value = response.data.data.map(company => ({
      id_company: company.id_company,
      label: company.label.toUpperCase(),
      count: company.total_ordens_service,
      lazy: true,
      children: [],
    }))

    loadingCompanies.value = false
    return
  }
})

function toggleLeft() {
  showLeft.value = !showLeft.value
}

async function onLazyLoad({ node, key, done, fail }) {
  console.log('Carregando dados para:', node.label, node.id)

  try {
    if (node.id?.startsWith('ORDER_')) {
      loadingOrderDetails.value = true

      const id = node.id.split('_')[1]

      showLeft.value = false

      const response = await getOrderById(id)

      if (response.status === 200) {
        const order = response.data.data
        orderSelected.value = order
        done && done()

        loadingOrderDetails.value = false
        return
      }

      loadingOrderDetails.value = false
      showLeft.value = true

      fail()

      return
    }

    const companyId = key

    if (!companyId) {
      console.warn('ID da empresa não encontrado no nó:', node)
      fail()

      return
    }

    const response = await getOrdersByCompany(companyId)

    if (response.status === 200) {
      const orders = response.data.data.map(order => ({
        id: "ORDER_" + order.id,
        label: `Número de OS - ${order.OS_number}`,
        lazy: true, 
      }))

      node.children = orders
      done && done(orders)
    } else {
      fail && fail()
    }
  } catch (err) {
    console.error('Erro ao carregar ordens:', err)
    fail && fail()
  }
}

const filterTree = (node, filter) => {
  if (!filter) return true

  if (node.id && String(node.id).startsWith('ORDER_')) return true

  return node.label && node.label.toLowerCase().includes(filter.toLowerCase())
}

const resetFilter = () => {
  filter.value = ''
}

</script>

<style scoped>
.page-full {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.full-row {
  flex: 1 1 auto;
  display: flex;
  gap: 0;
}

.panel {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.panel-left {
  border-right: 1px solid #e0e0e0;
}

.panel-content {
  overflow: auto;
  padding: 16px;
}

.bg-red { background-color: #ffebee; }
.bg-blue { background-color: #e3f2fd; }

.border {
  border-radius: 8px;
}

</style>
