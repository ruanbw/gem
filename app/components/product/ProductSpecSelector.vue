<script setup lang="ts">
interface Props {
  specStructure: Record<string, string[]>
  specNames: string[]
  selectedSpecs: Record<string, string>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:selectedSpecs': [value: Record<string, string>]
}>()

function selectSpec(specName: string, specValue: string) {
  if (props.selectedSpecs[specName] === specValue) return
  emit('update:selectedSpecs', { ...props.selectedSpecs, [specName]: specValue })
}
</script>

<template>
  <div class="space-y-5">
    <div v-for="specName in specNames" :key="specName">
      <div class="text-[11px] tracking-widest text-[#8A8986] mb-2.5">
        {{ specName }}
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="specValue in (specStructure[specName] || [])"
          :key="`${specName}-${specValue}`"
          class="px-4 py-1.5 text-xs transition-colors"
          :class="[
            selectedSpecs[specName] === specValue
              ? 'border border-[#1A1A1A] text-[#1A1A1A]'
              : 'border border-[#D5D4D0] text-[#8A8986] hover:border-[#8A8986]',
          ]"
          @click="selectSpec(specName, specValue)"
        >
          {{ specValue }}
        </button>
      </div>
    </div>
  </div>
</template>
