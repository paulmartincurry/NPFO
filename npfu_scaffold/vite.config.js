import { defineConfig } from 'vite'

// Base configuration for Vite when deploying via GitHub Pages.
// The base property ensures assets are served correctly when hosted
// from a subpath. Adjust the path if the repository name changes.
export default defineConfig({
  base: '/npfu/'
})
