<template>
    <q-stepper v-model="step" ref="stepper" color="primary" animated flat class="q-pa-none q-ma-none border">
      <q-step
        :name="1"
        title="Inicio"
        icon="business"
        :done="step > 1"
      >
        Try out different ad text to see what brings in the most customers, and
        learn how to enhance your ads using features like ad extensions. If you
        run into any problems with your ads, find out how to tell if they're
        running and how to resolve approval issues.
      </q-step>

      <q-step
        :name="2"
        title="Considerações de atendimento"
        icon="assignment"
        :done="step > 2"
      >
        An ad group contains one or more ads which target a shared set of
        keywords.
      </q-step>

      <q-step :name="3" title="Planos de manutenção" icon="assignment" :done="step > 3">
        This step won't show up because it is disabled.
      </q-step>

      <q-step :name="4" title="Leituras" icon="assignment" :done="step > 4">
        Try out different ad text to see what brings in the most customers, and
        learn how to enhance your ads using features like ad extensions. If you
        run into any problems with your ads, find out how to tell if they're
        running and how to resolve approval issues.
      </q-step>

      <q-step :name="5" title="Sala" icon="assignment" :done="step > 5">
        Try out different ad text to see what brings in the most customers, and
        learn how to enhance your ads using features like ad extensions. If you
        run into any problems with your ads, find out how to tell if they're
        running and how to resolve approval issues.
      </q-step>

      <q-step :name="6" title="Encerramento" icon="assignment" :done="step > 6">
        Try out different ad text to see what brings in the most customers, and
        learn how to enhance your ads using features like ad extensions. If you
        run into any problems with your ads, find out how to tell if they're
        running and how to resolve approval issues.
      </q-step>

      <template v-slot:navigation>
        <q-stepper-navigation class="row items-center justify-end">
          <q-btn
            flat
            no-caps
            class="footer-action-btn"
            rounded
            v-if="step > 1"
            color="primary"
            @click="$refs.stepper.previous()"
            label="Voltar"
          />
          <q-btn
            unelevated
            class="footer-action-btn q-ml-sm"
            no-caps
            @click="$refs.stepper.next()"
            color="primary"
            :label="step === 6 ? 'Salvar' : 'Continuar'"
            rounded
          />
        </q-stepper-navigation>
      </template>
    </q-stepper>
</template>

<script setup>
import { ref } from 'vue'

const step = ref(1)

defineProps({
    order: {
        type: Object,
        required: true
    }
})

</script>

<style scoped>

.footer-action-btn {
  padding-right: 10px;
  padding-left: 10px;
  height: 48px;
  width: 120px;
}

.border {
    border: 1px solid #e0e0e0;
    border-radius: 12px;
}

.min-h-400 {
    min-height: 400px;
}
</style>