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
				<q-icon
					name="ion-md-close"
					class="cursor-pointer"
					@click="search = ''"
				/>
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
					<div
						class="row no-wrap items-center justify-center q-gutter-x-sm"
					>
						<q-btn
							flat
							round
							dense
							icon="ion-md-create"
							color="primary"
							aria-label="Editar"
							@click="openEditClient(props.row)"
						/>
						<q-btn
							flat
							round
							dense
							icon="ion-md-build"
							color="primary"
							aria-label="Equipamento"
							@click="toEquipaments(props.row)"
						/>
						<q-btn
							flat
							round
							dense
							icon="ion-md-trash"
							color="negative"
							aria-label="Remover"
							@click="confirmDelete(props.row.id)"
						/>
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
import { deleteClient, getClients } from "../service/clientService";
import { ref, computed, onMounted } from "vue";
import { useQuasar, Dialog } from "quasar";
import AddUpdateClient from "../components/AddUpdateClient.vue";
import { maskCnpjFromString, maskPhone } from "src/utils/masks";

const clientDialogOpen = ref(false);
const clientFormDetails = ref(null);

const $q = useQuasar();

function openAddClient() {
	clientFormDetails.value = null;
	clientDialogOpen.value = true;
}

function openEditClient(row) {
	clientFormDetails.value = row;
	clientDialogOpen.value = true;
}

const confirmDelete = (id) => {
	console.log(id);
	Dialog.create({
		title: "Confirmar ação",
		message: "Você tem certeza que quer remover esse cliente?",
		cancel: {
			label: "Cancelar",
			flat: true,
		},
		ok: {
			label: "Remover",
			color: "negative",
			unelevated: true,
		},
		persistent: true,
	}).onOk(async () => {
		const dialog = Dialog.create({
			message: "Removendo cliente...",
			progress: true,
			persistent: true,
			ok: false,
		});

		try {
			await deleteClient(id);

			dialog.hide();

			$q.notify({
				message: "Cliente removido com sucesso!",
				color: "positive",
				icon: "ion-md-checkmark-circle",
			});

			start();
		} catch (error) {
			console.log(error);

			dialog.hide();

			$q.notify({
				message: "Erro ao remover cliente!",
				color: "negative",
				icon: "ion-md-close-circle",
			});
		}
	});
};

const clients = ref([]);
const search = ref("");
const loading = ref(false);

const pagination = ref({
	page: 1,
	rowsPerPage: 50,
	sortBy: null,
	descending: false,
});

const columns = [
	{
		name: "document",
		label: "Documento",
		field: (row) => row.document ?? "—",
		align: "left",
		sortable: true,
		format: (val) => (val ? maskCnpjFromString(val) : "—"),
	},
	{
		name: "name",
		label: "Nome",
		field: (row) => row.name ?? "—",
		align: "left",
		sortable: true,
	},
	{
		name: "email",
		label: "E-mail",
		field: (row) => row.email ?? "—",
		align: "left",
		sortable: true,
	},
	{
		name: "phone",
		label: "Telefone",
		field: (row) => row.phone ?? "—",
		align: "left",
		sortable: true,
		format: (val) => (val ? maskPhone(val) : "—"),
	},
	{
		name: "actions",
		label: "Ações",
		field: "id",
		align: "center",
		sortable: false,
	},
];

const filteredClients = computed(() => {
	const q = search.value.trim().toLowerCase();

	if (!q) {
		return clients.value;
	}
	return clients.value.filter((c) => {
		const doc = (c.document || "").toLowerCase();
		const name = (c.name || "").toLowerCase();
		return doc.includes(q) || name.includes(q);
	});
});

onMounted(async () => {
	start();
});

const start = async () => {
	loading.value = true;

	try {
		const response = await getClients();
		clients.value = response.data.data;
	} finally {
		loading.value = false;
	}
};

const toEquipaments = (row) => {
	window.location.href = `#/equipamentos?id_company=${row.id}`;
};
</script>

<style scoped>
.rounded-table {
	border-radius: 16px;
	overflow: hidden;
}
</style>
