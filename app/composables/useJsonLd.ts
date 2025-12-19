/**
 * JSON-LD Structured Data Composable
 * Provides structured data for SEO rich snippets
 */

interface BlogPostSchema {
  title: string
  description: string
  image: string
  datePublished: string
  dateModified?: string
  author: string
  url: string
}

interface WebsiteSchema {
  name: string
  description: string
  url: string
}

export const useJsonLd = () => {
  const config = useRuntimeConfig()
  const route = useRoute()

  // Website schema (for homepage)
  const setWebsiteSchema = (data?: Partial<WebsiteSchema>) => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: data?.name || config.public.siteName,
      description: data?.description || config.public.siteDescription,
      url: data?.url || config.public.siteUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${config.public.siteUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    }
    
    useHead({
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify(schema)
        }
      ]
    })
  }

  // Blog post schema (for article pages)
  const setBlogPostSchema = (post: BlogPostSchema) => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      image: post.image,
      datePublished: post.datePublished,
      dateModified: post.dateModified || post.datePublished,
      author: {
        '@type': 'Person',
        name: post.author
      },
      publisher: {
        '@type': 'Organization',
        name: config.public.siteName,
        logo: {
          '@type': 'ImageObject',
          url: `${config.public.siteUrl}/logo.png`
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': post.url
      }
    }

    useHead({
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify(schema)
        }
      ]
    })
  }

  // Breadcrumb schema
  const setBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    }

    useHead({
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify(schema)
        }
      ]
    })
  }

  // Organization schema (for about page)
  const setOrganizationSchema = () => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: config.public.siteName,
      url: config.public.siteUrl,
      logo: `${config.public.siteUrl}/logo.png`,
      description: config.public.siteDescription,
      sameAs: [
        'https://twitter.com/hagblog',
        'https://github.com/hagblog',
        'https://linkedin.com/company/hagblog'
      ]
    }

    useHead({
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify(schema)
        }
      ]
    })
  }

  return {
    setWebsiteSchema,
    setBlogPostSchema,
    setBreadcrumbSchema,
    setOrganizationSchema
  }
}
