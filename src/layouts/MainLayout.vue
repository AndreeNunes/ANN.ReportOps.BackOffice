<template>
  <q-layout view="hHh LpR fFf">
    <q-header class="app-header">
      <q-toolbar class="app-toolbar">
        <q-btn
          flat
          dense
          round
          icon="ion-md-menu"
          aria-label="Menu"
          class="menu-btn"
          @click="toggleLeftDrawer"
        />

        <div class="page-meta">
          <div class="page-meta__crumb">{{ pageMeta.section }}</div>
          <div class="page-meta__title">{{ pageMeta.title }}</div>
        </div>

        <q-space />

        <q-btn flat round dense icon="ion-md-notifications-outline" class="header-icon-btn">
          <q-tooltip class="bg-dark">Notificações</q-tooltip>
        </q-btn>

        <q-btn flat dense class="user-chip">
          <q-avatar size="32px" class="user-avatar">
            <span>{{ userInitials }}</span>
          </q-avatar>
          <div class="user-chip__text">
            <div class="user-chip__name">{{ userName }}</div>
            <div class="user-chip__role">Administrador</div>
          </div>
          <q-icon name="ion-md-arrow-dropdown" size="18px" class="q-ml-xs" />

          <q-menu anchor="bottom right" self="top right" class="user-menu">
            <q-list style="min-width: 220px">
              <q-item class="user-menu__header">
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ userName }}</q-item-label>
                  <q-item-label caption>Sessão ativa</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="logout">
                <q-item-section avatar>
                  <q-icon name="ion-ios-log-out" color="negative" />
                </q-item-section>
                <q-item-section class="text-negative text-weight-medium">Sair</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :width="260"
      :breakpoint="900"
      class="app-drawer"
    >
      <div class="column full-height">
        <div class="brand">
          <div class="brand__mark">
            <q-icon name="ion-md-pulse" size="22px" />
          </div>
          <div class="brand__text">
            <div class="brand__name">ReportOps</div>
            <div class="brand__hint">BackOffice</div>
          </div>
        </div>

        <q-scroll-area class="col drawer-scroll">
          <div class="nav-section-label">Navegação</div>

          <q-list padding class="nav-list">
            <q-item to="/home" exact class="nav-item" active-class="nav-item--active">
              <q-item-section avatar>
                <q-icon name="ion-md-home" />
              </q-item-section>
              <q-item-section>Início</q-item-section>
            </q-item>

            <q-expansion-item
              v-model="relatoriosExpanded"
              expand-separator
              icon="ion-md-folder-open"
              label="Relatórios"
              class="nav-expansion"
              header-class="nav-item"
            >
              <q-item
                to="/relatorios/ordem-servico"
                clickable
                v-ripple
                class="nav-item nav-item--child"
                active-class="nav-item--active"
              >
                <q-item-section avatar>
                  <q-icon name="ion-md-clipboard" />
                </q-item-section>
                <q-item-section>Ordem de serviço</q-item-section>
              </q-item>
            </q-expansion-item>
          </q-list>

          <div class="nav-section-label">Cadastros</div>

          <q-list padding class="nav-list">
            <q-item to="/clientes" class="nav-item" active-class="nav-item--active">
              <q-item-section avatar>
                <q-icon name="ion-md-business" />
              </q-item-section>
              <q-item-section>Clientes</q-item-section>
            </q-item>

            <q-item to="/equipamentos" class="nav-item" active-class="nav-item--active">
              <q-item-section avatar>
                <q-icon name="ion-md-build" />
              </q-item-section>
              <q-item-section>Equipamentos</q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>

        <div class="drawer-footer">
          <q-item clickable v-ripple class="logout-item" @click="logout">
            <q-item-section avatar>
              <q-icon name="ion-ios-log-out" />
            </q-item-section>
            <q-item-section>Sair</q-item-section>
          </q-item>
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const leftDrawerOpen = ref(false)
const relatoriosExpanded = ref(route.path.startsWith('/relatorios'))

const userName = 'Administrador'
const userInitials = computed(() =>
  userName
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase(),
)

const pageMeta = computed(() => {
  const path = route.path
  if (path.startsWith('/home')) return { section: 'Visão geral', title: 'Início' }
  if (path.startsWith('/clientes')) return { section: 'Cadastros', title: 'Clientes' }
  if (path.startsWith('/equipamentos')) return { section: 'Cadastros', title: 'Equipamentos' }
  if (path.startsWith('/relatorios/ordem-servico'))
    return { section: 'Relatórios', title: 'Ordem de serviço' }
  return { section: '', title: '' }
})

watch(
  () => route.path,
  (path) => {
    if (path.startsWith('/relatorios')) {
      relatoriosExpanded.value = true
    }
  },
)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function logout() {
  localStorage.removeItem('TOKEN')
  localStorage.removeItem('accessToken')
  router.push('/')
}
</script>

<style scoped lang="scss">
.app-header {
  background: var(--bg-surface);
  color: var(--text-base);
  border-bottom: 1px solid var(--border-soft);
  box-shadow: var(--shadow-xs);
}

.app-toolbar {
  min-height: 64px;
  padding: 0 20px;
  gap: 12px;
}

.menu-btn {
  color: var(--text-muted);
}

.page-meta {
  margin-left: 4px;

  &__crumb {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-faint);
    font-weight: 600;
    line-height: 1;
  }

  &__title {
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--text-strong);
    line-height: 1.4;
    letter-spacing: -0.01em;
  }
}

.header-icon-btn {
  color: var(--text-muted);
}

.user-chip {
  border-radius: var(--radius-md);
  padding: 4px 10px 4px 4px;
  text-transform: none;
  font-weight: 500;

  &__text {
    text-align: left;
    margin-left: 10px;
    line-height: 1.1;
  }

  &__name {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-strong);
  }

  &__role {
    font-size: 0.7rem;
    color: var(--text-muted);
    margin-top: 2px;
  }
}

.user-avatar {
  background: var(--brand-gradient);
  color: white;
  font-weight: 700;
  font-size: 0.8rem;
}

.user-menu {
  border-radius: var(--radius-md);

  &__header {
    padding-top: 12px;
    padding-bottom: 12px;
  }
}

.app-drawer {
  background: var(--bg-surface);
  border-right: 1px solid var(--border-soft);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid var(--border-soft);

  &__mark {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: var(--brand-gradient);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow-brand);
  }

  &__name {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--text-strong);
    letter-spacing: -0.02em;
    line-height: 1.1;
  }

  &__hint {
    font-size: 0.72rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
    margin-top: 2px;
  }
}

.drawer-scroll {
  padding: 8px 12px 16px;
}

.nav-section-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-faint);
  padding: 18px 12px 8px;
}

.nav-list {
  padding: 0;
}

:deep(.nav-item) {
  border-radius: var(--radius-md);
  margin: 2px 4px;
  padding: 10px 12px;
  min-height: 40px;
  color: var(--text-base);
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.15s ease, color 0.15s ease;

  .q-icon {
    color: var(--text-muted);
    font-size: 20px;
  }

  &:hover {
    background: var(--bg-soft);
    color: var(--text-strong);
  }
}

:deep(.nav-item--active) {
  background: var(--brand-50) !important;
  color: var(--brand-600) !important;
  font-weight: 600;

  .q-icon {
    color: var(--brand-600);
  }
}

:deep(.nav-item--child) {
  margin-left: 18px;
}

:deep(.nav-expansion .q-expansion-item__container > .q-item) {
  border-radius: var(--radius-md);
  margin: 2px 4px;
  min-height: 40px;
}

.drawer-footer {
  padding: 12px;
  border-top: 1px solid var(--border-soft);
}

.logout-item {
  border-radius: var(--radius-md);
  color: var(--text-muted);
  font-weight: 500;
  padding: 10px 12px;

  .q-icon {
    color: var(--text-muted);
  }

  &:hover {
    background: #fef2f2;
    color: var(--q-negative);

    .q-icon {
      color: var(--q-negative);
    }
  }
}
</style>
