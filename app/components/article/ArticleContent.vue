<script setup lang="ts">
import Image from '@tiptap/extension-image'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { useFilePath } from '@/composables/useFilePath'

const props = defineProps<{
  content: string
}>()

function processArticleContent(content: string): string {
  if (!content)
    return content

  return content.replace(/<img([^>]*)\ssrc=["']([^"']+)["']([^>]*)>/gi, (match, before, src, after) => {
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) {
      return match
    }
    const fullPath = useFilePath(src)
    return `<img${before} src="${fullPath}"${after}>`
  })
}

const editor = useEditor({
  extensions: [
    StarterKit,
    Image,
  ],
  content: '',
  editable: false,
})

watch(() => props.content, (newContent) => {
  if (editor.value && newContent) {
    const processedContent = processArticleContent(newContent)
    editor.value.commands.setContent(processedContent)
  }
}, { immediate: true })

onUnmounted(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})
</script>

<template>
  <div class="article-content max-w-none">
    <EditorContent :editor="editor" />
  </div>
</template>

<style scoped>
.article-content :deep(.ProseMirror) {
  min-height: 300px;
  padding: 24px 0;
  outline: none;
  color: hsl(var(--foreground));
  line-height: 1.8;
}

.article-content :deep(.ProseMirror h1) {
  font-size: 2em;
  font-weight: 700;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  color: hsl(var(--foreground));
}

.article-content :deep(.ProseMirror h2) {
  font-size: 1.5em;
  font-weight: 700;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  color: hsl(var(--foreground));
}

.article-content :deep(.ProseMirror h3) {
  font-size: 1.25em;
  font-weight: 700;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  color: hsl(var(--foreground));
}

.article-content :deep(.ProseMirror p) {
  margin-bottom: 1em;
  line-height: 1.8;
}

.article-content :deep(.ProseMirror img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1.5em 0;
}

.article-content :deep(.ProseMirror ul),
.article-content :deep(.ProseMirror ol) {
  padding-left: 1.5em;
  margin-bottom: 1em;
}

.article-content :deep(.ProseMirror li) {
  margin-bottom: 0.5em;
}

.article-content :deep(.ProseMirror a) {
  color: hsl(var(--primary));
  text-decoration: underline;
  text-underline-offset: 2px;
}

.article-content :deep(.ProseMirror blockquote) {
  border-left: 3px solid hsl(var(--border));
  padding-left: 1em;
  margin: 1.5em 0;
  color: hsl(var(--muted-foreground));
  font-style: italic;
}

.article-content :deep(.ProseMirror code) {
  background-color: hsl(var(--muted));
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9em;
}

.article-content :deep(.ProseMirror pre) {
  background-color: hsl(var(--muted));
  color: hsl(var(--foreground));
  padding: 1em;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1.5em 0;
}

.article-content :deep(.ProseMirror pre code) {
  background-color: transparent;
  padding: 0;
  color: inherit;
}
</style>
