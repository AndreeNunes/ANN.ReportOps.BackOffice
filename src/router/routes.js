const routes = [
	{
		path: "/",
		redirect: "/login",
		component: () => import("layouts/LoginLayout.vue"),
		children: [
			{ path: "", component: () => import("pages/LoginPage.vue") },
		],
	},
	{
		path: "/home",
		component: () => import("layouts/MainLayout.vue"),
		children: [
			{ path: "", component: () => import("pages/IndexPage.vue") },
		],
	},
	{
		path: "/clientes",
		component: () => import("layouts/MainLayout.vue"),
		children: [
			{ path: "", component: () => import("pages/ClientPage.vue") },
		],
	},
	{
		path: "/equipamentos",
		name: "equipamentos",
		component: () => import("layouts/MainLayout.vue"),
		children: [
			{ path: "", component: () => import("pages/EquipamentPage.vue") },
		],
	},
	{
		path: "/relatorios/ordem-servico",
		component: () => import("layouts/MainLayout.vue"),
		children: [
			{ path: "", component: () => import("pages/OrdemServicoPage.vue") },
		],
	},

	// Always leave this as last one,
	// but you can also remove it
	{
		path: "/:catchAll(.*)*",
		component: () => import("pages/ErrorNotFound.vue"),
	},
];

export default routes;
