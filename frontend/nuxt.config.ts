import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },
	devServer: {
		port: 5173
	},
	css: ['~/assets/css/tailwind.css'],
	vite: {
		optimizeDeps: {
			include: [
				'@vueuse/core',
				'@vue/devtools-core',
				'@vue/devtools-kit',
				'lucide-vue-next',
				'vue-sonner',
				'clsx',
				'tailwind-merge',
				'class-variance-authority',
				'reka-ui',
				'@vee-validate/zod',
				'vee-validate',
				'zod',
				'@tanstack/vue-table'
			]
		},
		plugins: [tailwindcss()]
	},
	modules: ['shadcn-nuxt', '@nuxt/eslint', '@nuxt/image', '@nuxtjs/color-mode', '@nuxt/content'],
	colorMode: {
		preference: 'light',
		fallback: 'light',
		classSuffix: ''
	},
	shadcn: {
		/**
		 * Prefix for all the imported component.
		 * @default "Ui"
		 */
		prefix: '',
		/**
		 * Directory that the component lives in.
		 * Will respect the Nuxt aliases.
		 * @link https://nuxt.com/docs/api/nuxt-config#alias
		 * @default "@/components/ui"
		 */
		componentDir: '@/components/ui'
	},
	runtimeConfig: {
		public: {
			apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'http://localhost:8000/api',
			googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''
		}
	}
});
