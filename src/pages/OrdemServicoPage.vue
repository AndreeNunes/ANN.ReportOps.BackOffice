<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
			<div class="text-h4 text-weight-bold">Ordem de Serviço</div>
			<q-btn
				color="primary"
				unelevated
				icon="ion-md-add"
				label="Adicionar ordem de serviço"
				@click="() => {}"
				rounded
			/>
		</div>

    <q-table
      v-model:pagination="pagination"
      class="rounded-table"
      flat
      bordered
      :rows="orders"
      :columns="columns"
    >
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            color="primary"
            unelevated
            icon="ion-md-eye"
            label="Visualizar"
            @click="() => {}"
            rounded
          />
        </q-td>
      </template>
    </q-table>
    
  </q-page>
</template>

<script setup>
import { getOrders } from 'src/service/reportService'
import { ref, onMounted } from 'vue'

const orders = ref([])

const pagination = ref({
	page: 1,
	rowsPerPage: 50,
	sortBy: null,
	descending: false,
});

const columns = [
	{
		name: "OS",
		label: "Número da OS",
		field: (row) => row.OS_number ?? "—",
		align: "left",
		sortable: true,
	},
	{
		name: "name_company",
		label: "Nome da empresa",
		field: (row) => row.name_company ?? "—",
		align: "left",
		sortable: true,
	},
	{
		name: "name_equipament",
		label: "Nome do equipamento",
		field: (row) => row.name_equipament ?? "—",
		align: "left",
		sortable: true,
	},
  {
    name: "closing_technician_responsible",
    label: "Técnico responsável pelo fechamento",
    field: (row) => row.closing_technician_responsible ?? "—",
    align: "left",
    sortable: true,
  },
  {
    name: "created_at",
    label: "Data de criação",
    field: (row) => row.created_at ?? "—",
    align: "left",
    sortable: true,
  },
	{
		name: "actions",
		label: "Ações",
		field: "id",
		align: "center",
		sortable: false,
	},
];

onMounted(async () => {
  const response = await getOrders()

  if (response.status == 200) {
    orders.value = response.data.data

    return
  }
})

</script>

<style scoped>
.rounded-table {
	border-radius: 16px;
	overflow: hidden;
}
</style>
