<template>
  <q-page class="flex flex-center">
    <div class="full-width row justify-center q-pa-md">
      <div class="col-12 col-sm-8 col-md-5 col-lg-4">
        <div class="text-center q-mb-lg">
          <img
            alt="GGA logo"
            src="~assets/GGA.jpg"
            style="height: 300px"
          >
        </div>
        
        <q-card flat bordered class="q-pa-lg">
          <q-form @submit.prevent="handleLogin">
            <div class="q-mb-md">
              <div class="text-h5 text-weight-bold">Bem-vindo!</div>
              <div class="text-subtitle2 text-grey-7">Acesse com seu e-mail e senha.</div>
            </div>

            <q-input
              v-model="email"
              label="E-mail"
              type="email"
              :disable="loading"
              autocomplete="email"
              autocapitalize="off"
              outlined
            />

            <div class="q-mt-md" />

            <q-input
              v-model="password"
              label="Senha"
              :type="isPwd ? 'password' : 'text'"
              :disable="loading"
              autocomplete="current-password"
              outlined
            >
              <template #append>
                <q-icon
                  :name="isPwd ? 'ion-md-eye' : 'ion-md-eye-off'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>

            <q-btn
              class="q-mt-md full-width"
              color="primary"
              label="Entrar"
              type="submit"
              :loading="loading"
              :disable="loading"
              unelevated
              size="lg"
              data-testid="login-submit"
            />
          </q-form>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { loginService } from '../service/loginService'

const $q = useQuasar()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const isPwd = ref(true)

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function notifyError(message) {
  $q.notify({
    message,
    color: 'negative',
    position: 'top',
    icon: 'ion-md-warning',
  })
}

function validateLoginForm() {
  const trimmedEmail = email.value.trim()

  if (!trimmedEmail) {
    notifyError('Informe seu e-mail.')
    return false
  }

  if (!emailPattern.test(trimmedEmail)) {
    notifyError('Digite um e-mail válido.')
    return false
  }

  if (!password.value) {
    notifyError('Informe sua senha.')
    return false
  }

  return true
}

function apiErrorMessage(error) {
  const status = error?.response?.status

  if (status === 401 || status === 403) {
    return 'E-mail ou senha incorretos.'
  }
  if (status === 422) {
    return 'Dados inválidos. Verifique e tente novamente.'
  }
  if (status >= 500) {
    return 'Serviço indisponível no momento. Tente mais tarde.'
  }

  return 'Erro ao entrar. Tente novamente.'
}

async function handleLogin() {
  if (!validateLoginForm()) {
    return
  }

  loading.value = true

  try {
    const response = await loginService(email.value.trim(), password.value)

    if (response.status === 200 && response.data?.token) {
      localStorage.setItem('TOKEN', response.data.token)
      localStorage.setItem('accessToken', response.data.token)
      await router.push('/home')
    } else {
      notifyError('Não foi possível entrar. Verifique seus dados.')
    }
  } catch (error) {
    notifyError(apiErrorMessage(error))
  } finally {
    loading.value = false
  }
}
</script>
