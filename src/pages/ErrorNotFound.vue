<template>
  <div class="error-page">
    <div class="error-page__inner">
      <div class="error-badge">
        <q-icon name="ion-md-help" size="32px" />
      </div>

      <div class="error-code">404</div>
      <h1 class="error-title">Página não encontrada</h1>
      <p class="error-subtitle">
        O endereço que você tentou acessar não existe ou foi movido.
      </p>

      <div class="error-actions">
        <q-btn
          color="primary"
          unelevated
          icon="ion-md-arrow-back"
          label="Voltar para o início"
          to="/home"
          rounded
          size="lg"
          class="error-action-btn"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
//
</script>

<style scoped lang="scss">
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  background:
    radial-gradient(circle at 20% 20%, rgba(37, 99, 235, 0.08), transparent 40%),
    radial-gradient(circle at 80% 80%, rgba(124, 58, 237, 0.08), transparent 40%),
    var(--bg-page);

  &__inner {
    text-align: center;
    max-width: 520px;
  }
}

.error-badge {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: var(--brand-gradient);
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-brand);
  margin-bottom: 24px;
}

.error-code {
  font-size: 6rem;
  font-weight: 800;
  line-height: 1;
  background: var(--brand-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.04em;
  margin-bottom: 12px;
}

.error-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-strong);
  letter-spacing: -0.02em;
  margin: 0 0 8px;
}

.error-subtitle {
  font-size: 1rem;
  color: var(--text-muted);
  margin: 0 0 32px;
  line-height: 1.5;
}

.error-actions {
  display: flex;
  justify-content: center;
}

.error-action-btn {
  height: 48px;
  padding: 0 24px;
}
</style>
