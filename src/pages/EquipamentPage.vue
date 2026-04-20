<template>
	<q-page padding>
		<div class="row items-center justify-between q-mb-md">
			<div class="text-h4 text-weight-bold">Equipamentos</div>
			<q-btn
				color="primary"
				unelevated
				icon="ion-md-add"
				label="Adicionar equipamento"
				@click="openAddEquipment"
				rounded
			/>
		</div>

		<div class="row items-center justify-between q-col-gutter-sm">
			<q-input
				v-model="search"
				outlined
				placeholder="Buscar por ou nome do equipamento ou empresa..."
				class="custom-input q-mb-md col-9"
				dense
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
				class="custom-input q-mb-md col-3"
				clearable
			>
				<template v-slot:no-option>
					<q-item>
						<q-item-section class="text-grey">
							No results
						</q-item-section>
					</q-item>
				</template>
			</q-select>
		</div>

		<q-table
			v-model:pagination="pagination"
			class="rounded-table"
			flat
			bordered
			:rows="filteredEquipaments"
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
							@click="openEditEquipment(props.row)"
						/>
						<q-btn
							flat
							round
							dense
							icon="ion-md-trash"
							color="negative"
							aria-label="Remover"
							@click="confirmDelete(props.row.id_company, props.row.id)"
						/>
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
import { deleteEquipament, getEquipaments } from "../service/equipamentService";
import AddUpdateEquipament from "../components/AddUpdateEquipament.vue";
import { ref, onBeforeMount, watch } from "vue";
import { useQuasar, Dialog } from "quasar";
import { useRoute, useRouter } from "vue-router";

const clientDialogOpen = ref(false);
const clientFormDetails = ref(null);

const $q = useQuasar();

const equipaments = ref([]);
const clients = ref([]);
const selectedClients = ref([]);
const filteredClients = ref([]);
const filteredEquipaments = ref([]);
const route = useRoute();
const router = useRouter();

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
		name: "name",
		label: "Nome do equipamento",
		field: (row) => row.name ?? "—",
		align: "left",
		sortable: true,
	},
	{
		name: "manufacture_date",
		label: "Data de fabricação",
		field: (row) => row.manufacture_date ?? "—",
		align: "left",
		sortable: true,
	},
	{
		name: "company_name",
		label: "Nome da empresa",
		field: (row) => row.company_name ?? "—",
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

onBeforeMount(async () => {
	start();
});

const start = async () => {
	loading.value = true;

	try {
		const response = await getEquipaments();

		equipaments.value = response.data.data;

		clients.value = Object.values(
			response.data.data.reduce((acc, item) => {
				if (!acc[item.id_company]) {
					acc[item.id_company] = {
						id: item.id_company,
						company_name: item.company_name,
					};
				}
				return acc;
			}, {}),
		);

		clients.value.sort((a, b) =>
			a.company_name.localeCompare(b.company_name),
		);

		filteredClients.value = clients.value;
		filteredEquipaments.value = equipaments.value;

		const idFromUrl = route.query.id_company;

		if (idFromUrl) {
			router.replace({ query: {} });

			const companyExists = clients.value.find((c) => c.id === idFromUrl);

			if (!companyExists) {
				$q.notify({
					message:
						"Nenhum Equipamento foi encontrado para esse cliente!",
					color: "warning",
					position: "top",
					icon: "ion-md-warning",
				});

				return;
			}

			console.log("companyExists", companyExists);

			selectedClients.value = companyExists.id;

			filteredEquipaments.value = onFilterClient(
				filteredEquipaments.value,
			);
		}
	} finally {
		loading.value = false;
	}
};

function openAddEquipment() {
	clientFormDetails.value = null;
	clientDialogOpen.value = true;
}

function openEditEquipment(row) {
	clientFormDetails.value = row;
	clientDialogOpen.value = true;
}

watch(selectedClients, () => {
	onFilter();
});

const onFilterSearch = () => {
	const q = search.value.trim().toLowerCase();

	console.log("Search query:", q);

	if (!q) {
		return equipaments.value;
	}

	return equipaments.value.filter((e) => {
		const nameEquipament = (e.name || "").toLowerCase();
		const nameCompany = (e.company_name || "").toLowerCase();

		return nameEquipament.includes(q) || nameCompany.includes(q);
	});
};

const onFilterClient = (eq) => {
	if (selectedClients.value == null || selectedClients.value.length === 0) {
		return eq;
	}

	if (eq.length === 0) {
		return eq;
	}

	return eq.filter((e) => selectedClients.value.includes(e.id_company));
};

const onFilter = () => {
	const eqFiltered = onFilterClient(onFilterSearch());

	filteredEquipaments.value = eqFiltered;
};

const confirmDelete = (idCompany, id) => {
	Dialog.create({
		title: "Confirmar ação",
		message: "Você tem certeza que quer remover esse equipamento?",
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
			message: "Removendo equipamento...",
			progress: true,
			persistent: true,
			ok: false,
		});

		try {
			await deleteEquipament(idCompany, id);

			dialog.hide();

			$q.notify({
				message: "Equipamento removido com sucesso!",
				color: "positive",
				icon: "ion-md-checkmark-circle",
			});

			start();
		} catch (error) {
			console.log(error);

			dialog.hide();

			$q.notify({
				message: "Erro ao remover equipamento!",
				color: "negative",
				icon: "ion-md-close-circle",
			});
		}
	});
};
</script>

<style scoped>
.rounded-table {
	border-radius: 16px;
	overflow: hidden;
}
</style>
