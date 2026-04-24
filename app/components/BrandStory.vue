<script setup lang="ts">
const visible = ref(false)
const sectionRef = ref<HTMLElement>()

useIntersectionObserver(
  sectionRef,
  ([{ isIntersecting }]) => {
    if (isIntersecting) {
      visible.value = true
    }
  },
  { threshold: 0.2 },
)
</script>

<template>
  <section
    ref="sectionRef"
    class="relative overflow-hidden py-28 md:py-40 lg:py-52"
  >
    <div class="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
      <div class="max-w-2xl">
        <!-- Overline -->
        <span
          class="block font-body text-[10px] font-medium uppercase tracking-[0.3em] text-foreground/30 transition-all duration-1000"
          :class="visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
        >
          Our Philosophy
        </span>

        <!-- Main Statement -->
        <h2
          class="mt-6 font-display text-3xl font-light leading-snug tracking-wide text-foreground md:text-4xl lg:text-5xl lg:leading-snug transition-all duration-1000 delay-200"
          :class="visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
        >
          每一颗宝石，<br>
          都有属于它的故事
        </h2>

        <!-- Divider -->
        <div
          class="mt-8 h-px bg-foreground/15 transition-all duration-1000 delay-300"
          :class="visible ? 'w-16 opacity-100' : 'w-0 opacity-0'"
        />

        <!-- Body -->
        <p
          class="mt-8 font-body text-sm font-light leading-relaxed tracking-wide text-foreground/50 max-w-lg transition-all duration-1000 delay-[400ms]"
          :class="visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
        >
          我们相信，真正的奢华不在于喧嚣的展示，而在于安静的发现。每一件作品都经过精心甄选，只为等待那个懂得欣赏它的人。
        </p>

        <!-- CTA -->
        <div
          class="mt-10 transition-all duration-1000 delay-[500ms]"
          :class="visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
        >
          <NuxtLink
            to="/products"
            class="group inline-flex items-center gap-3 font-body text-[11px] font-medium tracking-[0.2em] text-foreground/70 uppercase transition-colors duration-300 hover:text-foreground"
          >
            <span class="relative">
              浏览全部藏品
              <span class="absolute -bottom-1 left-0 h-px w-0 bg-foreground transition-all duration-500 group-hover:w-full" />
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="transition-transform duration-300 group-hover:translate-x-1"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
