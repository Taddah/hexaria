import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [tailwindcss(), sveltekit()],
    optimizeDeps: {
        include: ['@xyflow/svelte']
    },
    ssr: {
        noExternal: ['@xyflow/svelte']
    },
    server: {
        fs: {
            allow: ['../shared']
        }
    }
});
