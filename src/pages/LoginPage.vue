<template>
  <q-page class="login-page">
    <div class="login-shell">
      <aside class="login-side">
        <div class="login-side__brand">
          <div class="brand-mark">
            <q-icon name="ion-md-pulse" size="24px" />
          </div>
          <div>
            <div class="brand-name">ReportOps</div>
            <div class="brand-tag">BackOffice</div>
          </div>
        </div>

        <div class="login-side__content">
          <h1 class="login-side__title">
            Operações em campo, <br />sob controle.
          </h1>
          <p class="login-side__subtitle">
            Plataforma de gestão de ordens de serviço, clientes e equipamentos para
            equipes técnicas.
          </p>

          <ul class="login-side__features">
            <li>
              <q-icon name="ion-md-checkmark-circle" />
              <span>Cadastro centralizado de clientes e equipamentos</span>
            </li>
            <li>
              <q-icon name="ion-md-checkmark-circle" />
              <span>Acompanhamento de ordens de serviço em tempo real</span>
            </li>
            <li>
              <q-icon name="ion-md-checkmark-circle" />
              <span>Relatórios prontos para o time de operações</span>
            </li>
          </ul>
        </div>

        <div class="login-side__footer">
          © {{ new Date().getFullYear() }} GGA — Todos os direitos reservados
        </div>
      </aside>

      <main class="login-main">
        <div class="login-card">
          <div class="login-card__head">
            <div class="login-card__eyebrow">Bem-vindo de volta</div>
            <h2 class="login-card__title">Acesse sua conta</h2>
            <p class="login-card__subtitle">
              Use seu e-mail corporativo para entrar no painel.
            </p>
          </div>

          <q-form class="login-form" @submit.prevent="handleLogin">
            <label class="field-label">E-mail</label>
            <q-input
              v-model="email"
              type="email"
              placeholder="voce@empresa.com.br"
              :disable="loading"
              autocomplete="email"
              autocapitalize="off"
              outlined
              dense
              class="custom-input"
              hide-bottom-space
            >
              <template #prepend>
                <q-icon name="ion-md-mail" />
              </template>
            </q-input>

            <label class="field-label q-mt-md">Senha</label>
            <q-input
              v-model="password"
              :type="isPwd ? 'password' : 'text'"
              placeholder="••••••••"
              :disable="loading"
              autocomplete="current-password"
              outlined
              dense
              class="custom-input"
              hide-bottom-space
            >
              <template #prepend>
                <q-icon name="ion-md-lock" />
              </template>
              <template #append>
                <q-icon
                  :name="isPwd ? 'ion-md-eye' : 'ion-md-eye-off'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>

            <q-btn
              class="login-submit q-mt-lg"
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

          <div class="login-card__hint">
            Esqueceu sua senha? Fale com o administrador do sistema.
          </div>
        </div>
      </main>
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

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  background: var(--bg-page);
}

.login-shell {
  display: grid;
  grid-template-columns: 1fr;
  min-height: 100vh;

  @media (min-width: 1024px) {
    grid-template-columns: 1.05fr 1fr;
  }
}

.login-side {
  display: none;
  position: relative;
  padding: 48px;
  color: white;
  background: var(--brand-gradient);
  overflow: hidden;
  flex-direction: column;
  justify-content: space-between;

  @media (min-width: 1024px) {
    display: flex;
  }

  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
    pointer-events: none;
  }

  &::before {
    width: 480px;
    height: 480px;
    top: -180px;
    right: -180px;
  }

  &::after {
    width: 320px;
    height: 320px;
    bottom: -120px;
    left: -120px;
    background: rgba(255, 255, 255, 0.06);
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: 14px;
    position: relative;
    z-index: 1;
  }

  &__content {
    position: relative;
    z-index: 1;
    max-width: 480px;
  }

  &__title {
    font-size: 2.5rem;
    line-height: 1.1;
    font-weight: 700;
    letter-spacing: -0.025em;
    margin: 0 0 16px;
  }

  &__subtitle {
    font-size: 1rem;
    line-height: 1.55;
    color: rgba(255, 255, 255, 0.85);
    margin: 0 0 32px;
    max-width: 460px;
  }

  &__features {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 14px;

    li {
      display: flex;
      gap: 12px;
      align-items: center;
      font-size: 0.95rem;
      color: rgba(255, 255, 255, 0.92);

      .q-icon {
        color: rgba(255, 255, 255, 0.95);
        font-size: 20px;
        flex-shrink: 0;
      }
    }
  }

  &__footer {
    position: relative;
    z-index: 1;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.7);
  }
}

.brand-mark {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
}

.brand-name {
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.brand-tag {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.75);
  margin-top: 2px;
}

.login-main {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
}

.login-card {
  width: 100%;
  max-width: 420px;

  &__head {
    margin-bottom: 28px;
  }

  &__eyebrow {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--brand-600);
    margin-bottom: 8px;
  }

  &__title {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-strong);
    letter-spacing: -0.02em;
    margin: 0 0 6px;
  }

  &__subtitle {
    font-size: 0.95rem;
    color: var(--text-muted);
    margin: 0;
  }

  &__hint {
    margin-top: 24px;
    font-size: 0.8rem;
    color: var(--text-muted);
    text-align: center;
  }
}

.login-form {
  display: flex;
  flex-direction: column;
}

.field-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-base);
  margin-bottom: 6px;
  letter-spacing: -0.005em;
}

.login-submit {
  height: 48px;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: var(--radius-md);
}
</style>
