<template>
  <q-page padding class="dashboard-page">
    <header class="page-header">
      <div>
        <div class="page-header__title">Olá, bem-vindo de volta</div>
        <div class="page-header__subtitle">
          Visão geral das suas operações em {{ todayLabel }}
        </div>
      </div>
      <div class="page-header__actions">
        <q-btn
          color="primary"
          unelevated
          icon="ion-md-add"
          label="Nova ordem de serviço"
          to="/relatorios/ordem-servico"
          class="primary-action-btn"
          rounded
        />
      </div>
    </header>

    <section class="stats-grid">
      <article class="stat-card" v-for="stat in stats" :key="stat.key">
        <div class="stat-card__head">
          <div class="stat-card__icon" :class="`stat-card__icon--${stat.tone}`">
            <q-icon :name="stat.icon" size="22px" />
          </div>
          <q-btn
            flat
            dense
            round
            icon="ion-md-arrow-forward"
            :to="stat.to"
            class="stat-card__cta"
            size="sm"
          >
            <q-tooltip>Abrir</q-tooltip>
          </q-btn>
        </div>
        <div class="stat-card__label">{{ stat.label }}</div>
        <div class="stat-card__value">
          <q-skeleton v-if="loading" type="text" width="60%" height="32px" />
          <template v-else>{{ stat.value }}</template>
        </div>
        <div class="stat-card__hint">{{ stat.hint }}</div>
      </article>
    </section>

    <section class="dashboard-grid">
      <article class="surface-card panel">
        <header class="panel__head">
          <div>
            <div class="panel__title">Ordens de serviço recentes</div>
            <div class="panel__subtitle">Últimas atividades registradas</div>
          </div>
          <q-btn
            flat
            no-caps
            color="primary"
            label="Ver todas"
            to="/relatorios/ordem-servico"
            icon-right="ion-md-arrow-forward"
            size="sm"
          />
        </header>

        <div v-if="loading" class="panel__loading">
          <q-skeleton type="text" v-for="n in 4" :key="n" height="20px" class="q-mb-sm" />
        </div>

        <div v-else-if="recentOrders.length === 0" class="panel__empty">
          <q-icon name="ion-md-clipboard" size="38px" />
          <div class="q-mt-sm">Nenhuma ordem de serviço ainda</div>
        </div>

        <q-list v-else class="recent-list" separator>
          <q-item v-for="order in recentOrders" :key="order.id || order.OS_number" class="recent-list__item">
            <q-item-section avatar>
              <div class="recent-list__avatar">
                <q-icon name="ion-md-clipboard" size="18px" />
              </div>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">
                OS #{{ order.OS_number || '—' }}
              </q-item-label>
              <q-item-label caption>
                {{ order.company_name || 'Empresa não informada' }}
                <span v-if="order.equipament_name"> • {{ order.equipament_name }}</span>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </article>

      <article class="surface-card panel">
        <header class="panel__head">
          <div>
            <div class="panel__title">Atalhos</div>
            <div class="panel__subtitle">Ações rápidas</div>
          </div>
        </header>

        <div class="shortcut-grid">
          <router-link to="/clientes" class="shortcut">
            <div class="shortcut__icon shortcut__icon--blue">
              <q-icon name="ion-md-business" size="20px" />
            </div>
            <div>
              <div class="shortcut__title">Clientes</div>
              <div class="shortcut__hint">Gerencie sua base</div>
            </div>
            <q-icon name="ion-md-arrow-forward" class="shortcut__arrow" />
          </router-link>

          <router-link to="/equipamentos" class="shortcut">
            <div class="shortcut__icon shortcut__icon--violet">
              <q-icon name="ion-md-build" size="20px" />
            </div>
            <div>
              <div class="shortcut__title">Equipamentos</div>
              <div class="shortcut__hint">Cadastros técnicos</div>
            </div>
            <q-icon name="ion-md-arrow-forward" class="shortcut__arrow" />
          </router-link>

          <router-link to="/relatorios/ordem-servico" class="shortcut">
            <div class="shortcut__icon shortcut__icon--orange">
              <q-icon name="ion-md-clipboard" size="20px" />
            </div>
            <div>
              <div class="shortcut__title">Ordens de serviço</div>
              <div class="shortcut__hint">Veja relatórios</div>
            </div>
            <q-icon name="ion-md-arrow-forward" class="shortcut__arrow" />
          </router-link>
        </div>
      </article>
    </section>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getDashboard } from '../service/reportService'

const loading = ref(true)
const clientCount = ref(0)
const equipamentCount = ref(0)
const orderCount = ref(0)
const recentOrders = ref([])

const todayLabel = computed(() =>
  new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }),
)

const stats = computed(() => [
  {
    key: 'clients',
    label: 'Clientes',
    value: clientCount.value,
    hint: 'Empresas cadastradas',
    icon: 'ion-md-business',
    tone: 'blue',
    to: '/clientes',
  },
  {
    key: 'equipaments',
    label: 'Equipamentos',
    value: equipamentCount.value,
    hint: 'Itens monitorados',
    icon: 'ion-md-build',
    tone: 'violet',
    to: '/equipamentos',
  },
  {
    key: 'orders',
    label: 'Ordens de serviço',
    value: orderCount.value,
    hint: 'Total registrado',
    icon: 'ion-md-clipboard',
    tone: 'orange',
    to: '/relatorios/ordem-servico',
  },
])

async function loadDashboard() {
  loading.value = true
  try {
    const response = await getDashboard()
    const data = response?.data?.data

    if (data) {
      clientCount.value = data.totals?.companies ?? 0
      equipamentCount.value = data.totals?.equipaments ?? 0
      orderCount.value = data.totals?.reports ?? 0
      recentOrders.value = data.last_orders ?? []
    }
  } finally {
    loading.value = false
  }
}

onMounted(loadDashboard)
</script>

<style scoped lang="scss">
.dashboard-page {
  max-width: 1280px;
  margin: 0 auto;
}

.primary-action-btn {
  height: 44px;
  padding: 0 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  transition: transform 0.18s ease, box-shadow 0.18s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  &__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 18px;
  }

  &__icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;

    &--blue {
      background: #e0ecff;
      color: #1d4ed8;
    }

    &--violet {
      background: #ede9fe;
      color: #6d28d9;
    }

    &--orange {
      background: #ffedd5;
      color: #c2410c;
    }
  }

  &__cta {
    color: var(--text-faint);
  }

  &__label {
    font-size: 0.78rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted);
    margin-bottom: 6px;
  }

  &__value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-strong);
    letter-spacing: -0.02em;
    line-height: 1.1;
    margin-bottom: 4px;
  }

  &__hint {
    font-size: 0.8rem;
    color: var(--text-faint);
  }
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  @media (min-width: 1024px) {
    grid-template-columns: 1.4fr 1fr;
  }
}

.panel {
  padding: 22px;

  &__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 16px;
    gap: 12px;
  }

  &__title {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--text-strong);
    letter-spacing: -0.01em;
  }

  &__subtitle {
    font-size: 0.82rem;
    color: var(--text-muted);
    margin-top: 2px;
  }

  &__loading {
    padding: 8px 0;
  }

  &__empty {
    text-align: center;
    padding: 40px 16px;
    color: var(--text-faint);
  }
}

.recent-list {
  margin: 0 -22px -22px;

  &__item {
    padding: 14px 22px;
  }

  &__avatar {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: var(--brand-50);
    color: var(--brand-600);
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.shortcut-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.shortcut {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-soft);
  text-decoration: none;
  color: inherit;
  transition: background-color 0.15s ease, transform 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: var(--bg-soft);
    border-color: var(--border-strong);
    transform: translateX(2px);

    .shortcut__arrow {
      color: var(--brand-600);
    }
  }

  &__icon {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &--blue {
      background: #e0ecff;
      color: #1d4ed8;
    }

    &--violet {
      background: #ede9fe;
      color: #6d28d9;
    }

    &--orange {
      background: #ffedd5;
      color: #c2410c;
    }
  }

  &__title {
    font-weight: 600;
    color: var(--text-strong);
    font-size: 0.92rem;
  }

  &__hint {
    font-size: 0.78rem;
    color: var(--text-muted);
    margin-top: 2px;
  }

  &__arrow {
    margin-left: auto;
    color: var(--text-faint);
    transition: color 0.15s ease;
  }
}
</style>
