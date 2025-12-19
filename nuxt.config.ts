// https://nuxt.com/docs/api/configuration/nuxt-config
//env load


export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // App configuration
  app: {
    head: {
      title: 'HagBlog - Exploring Ideas, One Post at a Time',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'HagBlog - Platform blog modern untuk berbagi ide dan pengetahuan' },
        { name: 'theme-color', content: '#3b82f6' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap' }
      ]
    }
  },

  // CSS files
  css: ['~/assets/css/main.css'],

  // SEO Modules
  modules: [
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    'nuxt-jsonld'
  ],

  // Sitemap configuration - @nuxtjs/sitemap v7+
  site: {
    url: 'https://hagblog.com',
  },

  // Robots.txt configuration - @nuxtjs/robots v5+
  robots: {
    disallow: ['/admin'],
    sitemap: '/sitemap.xml'
  },

  // Runtime config
  runtimeConfig: {
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
    public: {
      siteName: 'HagBlog',
      siteDescription: 'Exploring Ideas, One Post at a Time',
      siteUrl: 'https://hagblog.com',
      cloudinaryCloudName: process.env.NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
    }
  },

  // Vite configuration - suppress VueUse exports deprecation warning
  vite: {
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          // Ignore deprecation warnings from VueUse package exports
          if (warning.message?.includes('is no longer supported')) return
          if (warning.message?.includes('Mapping specifiers')) return
          warn(warning)
        }
      }
    }
  }
})
