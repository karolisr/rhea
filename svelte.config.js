import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  preprocess: [vitePreprocess({})],
  kit: {
    // See https://kit.svelte.dev/docs/adapters
    adapter: adapter(),
    prerender: {
      // entries: ['*', '/view/[recid]']
      entries: ['*']
    },
    alias: {
      '$rhea': 'src/rhea',
      '$rhea/*': 'src/rhea/*',
      '$styles': 'src/styles',
      '$styles/*': 'src/styles/*'
    },
    files: {
      appTemplate: 'src/app.html',
      routes: 'src/routes',
      assets: 'assets',
      lib: 'src/lib'
    }
  }
}

export default config
