<template>
  <q-layout view="lHh Lpr lFf">
    <q-header>
      <q-toolbar>
        <q-btn flat dense round icon="ion-md-menu" aria-label="Menu" @click="toggleLeftDrawer" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered width="240">
      <div class="column full-height">
        <q-scroll-area class="col">
          <q-list>
            <q-item-label header> Menu </q-item-label>

            <q-item to="/home">
              <q-item-section avatar>
                <q-icon name="ion-md-home" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Início</q-item-label>
              </q-item-section>
            </q-item>

            <q-expansion-item
              v-model="relatoriosExpanded"
              expand-separator
              icon="ion-md-folder-open"
              label="Relatórios"
            >
              <q-item to="/relatorios/ordem-servico" clickable v-ripple>
                <q-item-section avatar>
                  <q-icon name="ion-md-clipboard" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Ordem de serviço</q-item-label>
                </q-item-section>
              </q-item>
            </q-expansion-item>

            <q-item to="/clientes">
              <q-item-section avatar>
                <q-icon name="ion-md-business" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Clientes</q-item-label>
              </q-item-section>
            </q-item>

            <q-item to="/equipamentos">
              <q-item-section avatar>
                <q-icon name="ion-md-build" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Equipamentos</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>

        <q-separator />

        <q-list>
          <q-item clickable v-ripple @click="logout">
            <q-item-section avatar>
              <q-icon name="ion-ios-log-out" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Sair</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const leftDrawerOpen = ref(false)
const relatoriosExpanded = ref(route.path.startsWith('/relatorios'))

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
