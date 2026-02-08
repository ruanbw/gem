<script setup lang="ts">
import { FacebookIcon, InstagramIcon, LinkedinIcon, TwitterIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const footerLinks = {
  product: [
    { name: 'Features', href: '#' },
    { name: 'Pricing', href: '#' },
    { name: 'Documentation', href: '#' },
    { name: 'Guides', href: '#' },
  ],
  company: [
    { name: 'About', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'Careers', href: '#' },
    { name: 'Contact', href: '#' },
  ],
  legal: [
    { name: 'Privacy', href: '#' },
    { name: 'Terms', href: '#' },
    { name: 'License', href: '#' },
  ],
}

const socialLinks = [
  { icon: FacebookIcon, href: '#' },
  { icon: TwitterIcon, href: '#' },
  { icon: InstagramIcon, href: '#' },
  { icon: LinkedinIcon, href: '#' },
]
</script>

<template>
  <section class="relative w-full flex items-center bg-white py-8 md:py-16 lg:py-24">
    <div class="container mx-auto px-4 md:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row justify-between gap-12 lg:gap-40">
        <!-- Brand Column -->
        <div class="space-y-6 max-w-[300px]">
          <div class="flex items-center space-x-2">
            <div class="size-8 rounded-lg bg-primary/10" />
            <span class="text-xl font-bold">Brand</span>
          </div>
          <p class="text-muted-foreground">
            Building better websites with modern tools and frameworks.
          </p>
          <div class="space-y-4">
            <h3 class="font-medium">
              Subscribe to our newsletter
            </h3>
            <div class="flex gap-2">
              <Input type="email" placeholder="Enter your email" />
              <Button>Subscribe</Button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 gap-8 flex-1">
          <!-- Product Links -->
          <div class="space-y-6">
            <h3 class="text-lg font-semibold">
              Product
            </h3>
            <ul class="space-y-3">
              <li v-for="link in footerLinks.product" :key="link.name">
                <a :href="link.href" class="text-muted-foreground hover:text-primary transition-colors">
                  {{ link.name }}
                </a>
              </li>
            </ul>
          </div>
          <!-- Company Links -->
          <div class="space-y-6">
            <h3 class="text-lg font-semibold">
              Company
            </h3>
            <ul class="space-y-3">
              <li v-for="link in footerLinks.company" :key="link.name">
                <a :href="link.href" class="text-muted-foreground hover:text-primary transition-colors">
                  {{ link.name }}
                </a>
              </li>
            </ul>
          </div>
          <!-- Legal Links -->
          <div class="space-y-6">
            <h3 class="text-lg font-semibold">
              Legal
            </h3>
            <ul class="space-y-3">
              <li v-for="link in footerLinks.legal" :key="link.name">
                <a :href="link.href" class="text-muted-foreground hover:text-primary transition-colors">
                  {{ link.name }}
                </a>
              </li>
            </ul>
            <!-- Social Links -->
            <div class="flex gap-4 pt-4">
              <a
                v-for="social in socialLinks" :key="social.href" :href="social.href"
                class="text-muted-foreground hover:text-primary transition-colors"
              >
                <component :is="social.icon" class="size-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t mt-16 pt-8">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <p class="text-sm text-muted-foreground">
            2024 Your Company. All rights reserved.
          </p>
          <div class="flex items-center gap-4">
            <a href="#" class="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" class="text-sm text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </a>
            <a href="#" class="text-sm text-muted-foreground hover:text-primary transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
