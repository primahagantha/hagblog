/**
 * Database Seed Script
 * Creates initial admin users, categories, and sample blog posts
 * 
 * Usage: npx tsx src/seed.ts
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./db/schema";
import { auth } from "./auth";
import { eq } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function seed() {
  console.log("🌱 Starting database seed...\n");

  try {
    // Create admin user
    console.log("Creating admin user...");
    
    // Re-create admin user to ensure correct password hash
    console.log("Re-creating admin user...");
    
    // Delete existing to allow fresh creation
    await db.delete(schema.user).where(eq(schema.user.email, "blogger1@hagblog.com"));
    
    const adminRes = await auth.api.signUpEmail({
      body: {
        email: "blogger1@hagblog.com",
        password: "admin123",
        name: "Blogger Admin",
      }
    });
    const adminId = adminRes.user.id;
    
    // Update role and verification
    await db.update(schema.user).set({
      role: "admin",
      emailVerified: true
    }).where(eq(schema.user.id, adminId));
    
    console.log("✅ Admin user ready: blogger1@hagblog.com / admin123\n");

    // Re-create blogger user
    console.log("Re-creating blogger user...");
    
    await db.delete(schema.user).where(eq(schema.user.email, "writer@hagblog.com"));
    
    const bloggerRes = await auth.api.signUpEmail({
      body: {
        email: "writer@hagblog.com",
        password: "blogger123",
        name: "Blog Writer",
      }
    });
    const bloggerId = bloggerRes.user.id;
    
    // Update role and verification
    await db.update(schema.user).set({
      role: "blogger",
      emailVerified: true
    }).where(eq(schema.user.id, bloggerId));

    console.log("✅ Blogger user ready: writer@hagblog.com / blog123\n");

    // Create categories
    console.log("Creating categories...");
    const categories = [
      { name: "Teknologi", slug: "teknologi", icon: "💻", description: "Artikel seputar teknologi terbaru" },
      { name: "Tutorial", slug: "tutorial", icon: "📚", description: "Panduan dan tutorial langkah demi langkah" },
      { name: "Tips", slug: "tips", icon: "💡", description: "Tips dan trik praktis" },
      { name: "Lifestyle", slug: "lifestyle", icon: "🌿", description: "Gaya hidup dan pengembangan diri" },
    ];

    for (const cat of categories) {
      await db.insert(schema.category).values(cat).onConflictDoNothing();
    }
    console.log("✅ Categories created\n");

    // Get category IDs
    const createdCategories = await db.query.category.findMany();
    const categoryMap = Object.fromEntries(createdCategories.map(c => [c.slug, c.id]));

    // Create sample posts
    console.log("Creating sample blog posts...");
    const posts = [
      {
        title: "Getting Started with Vue 3: A Complete Guide for Beginners",
        slug: "getting-started-with-vue-3",
        content: `# Getting Started with Vue 3

Vue 3 adalah framework JavaScript modern yang powerful untuk membangun user interface. Dalam panduan ini, kita akan membahas dasar-dasar Vue 3.

## Apa yang Baru di Vue 3?

Vue 3 hadir dengan banyak fitur baru yang menarik:

- **Composition API** - Cara baru untuk mengorganisir logika komponen
- **Teleport** - Render komponen di luar DOM hierarchy
- **Fragments** - Multiple root elements dalam satu komponen
- **Better TypeScript Support** - Integrasi TypeScript yang lebih baik

## Instalasi

\`\`\`bash
npm create vue@latest my-vue-app
cd my-vue-app
npm install
npm run dev
\`\`\`

## Composition API Basics

\`\`\`javascript
import { ref, computed } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const doubled = computed(() => count.value * 2)
    
    function increment() {
      count.value++
    }
    
    return { count, doubled, increment }
  }
}
\`\`\`

Selamat belajar Vue 3! 🚀`,
        excerpt: "Vue 3 hadir dengan banyak fitur baru seperti Composition API, Teleport, dan Fragments. Pelajari cara memulai dengan panduan lengkap ini.",
        featuredImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
        categoryId: categoryMap["tutorial"],
        authorId: adminId,
        status: "published" as const,
        featured: true,
        viewCount: 1250,
        publishedAt: new Date("2025-12-15"),
      },
      {
        title: "Tips Produktivitas untuk Developer",
        slug: "tips-produktivitas-developer",
        content: `# Tips Produktivitas untuk Developer

Sebagai developer, produktivitas adalah kunci kesuksesan. Berikut tips yang sudah terbukti efektif.

## 1. Gunakan Pomodoro Technique

Bekerja dalam interval 25 menit, istirahat 5 menit. Setiap 4 pomodoro, istirahat lebih panjang.

## 2. Setup Environment yang Nyaman

- Gunakan mechanical keyboard yang nyaman
- Monitor dengan resolusi tinggi
- Kursi ergonomis

## 3. Master Your Tools

- Pelajari keyboard shortcuts
- Gunakan snippets dan extensions
- Automatisasi tugas repetitif

## 4. Code Review yang Efektif

Review code orang lain tidak hanya membantu tim, tapi juga meningkatkan skill kamu.

Stay productive! 💪`,
        excerpt: "Tingkatkan produktivitas coding dengan tips dan tools yang sudah terbukti efektif untuk developer.",
        featuredImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
        categoryId: categoryMap["tips"],
        authorId: adminId,
        status: "published" as const,
        featured: false,
        viewCount: 856,
        publishedAt: new Date("2025-12-14"),
      },
      {
        title: "SEO Optimization dengan Nuxt 3",
        slug: "nuxt-3-seo-optimization",
        content: `# SEO Optimization dengan Nuxt 3

Nuxt 3 menyediakan fitur SEO yang powerful. Mari pelajari cara mengoptimalkannya.

## Meta Tags

\`\`\`vue
<script setup>
useSeoMeta({
  title: 'My Page Title',
  description: 'Description of my page',
  ogImage: '/og-image.jpg',
})
</script>
\`\`\`

## Structured Data

Gunakan \`nuxt-jsonld\` untuk menambahkan JSON-LD structured data.

## Performance

- Lazy load images
- Minimize JavaScript bundle
- Use CDN for static assets

Happy optimizing! 🔍`,
        excerpt: "Optimalkan website Nuxt 3 kamu untuk mesin pencari dengan teknik SEO terbaik dan praktis.",
        featuredImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
        categoryId: categoryMap["teknologi"],
        authorId: adminId,
        status: "published" as const,
        featured: false,
        viewCount: 623,
        publishedAt: new Date("2025-12-13"),
      },
      {
        title: "Menjaga Work-Life Balance sebagai Developer",
        slug: "work-life-balance",
        content: `# Menjaga Work-Life Balance sebagai Developer

Burnout adalah musuh produktivitas. Berikut cara menjaga keseimbangan.

## Set Boundaries

- Tentukan jam kerja yang jelas
- Matikan notifikasi di luar jam kerja
- Pisahkan workspace dari living space

## Take Care of Your Health

- Olahraga teratur
- Tidur cukup (7-8 jam)
- Makan sehat dan teratur

## Hobbies Outside of Coding

Temukan hobi yang tidak berhubungan dengan komputer:
- Olahraga outdoor
- Membaca buku
- Berkebun

Balance is key! 🧘`,
        excerpt: "Panduan praktis untuk menjaga keseimbangan antara pekerjaan dan kehidupan pribadi sebagai developer.",
        featuredImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
        categoryId: categoryMap["lifestyle"],
        authorId: adminId,
        status: "published" as const,
        featured: false,
        viewCount: 412,
        publishedAt: new Date("2025-12-12"),
      },
      {
        title: "React vs Vue: Perbandingan Lengkap",
        slug: "react-vs-vue",
        content: `# React vs Vue: Perbandingan Lengkap

Kedua framework populer ini memiliki kelebihan masing-masing. Mari bandingkan.

## Learning Curve

- **Vue**: Lebih mudah dipelajari, dokumentasi yang sangat bagus
- **React**: Memerlukan pemahaman JavaScript yang lebih dalam

## Performance

Keduanya memiliki performa yang hampir sama untuk kebanyakan use case.

## Ecosystem

- **React**: Ecosystem yang lebih besar
- **Vue**: Solusi first-party yang lebih terintegrasi

## Kesimpulan

Pilih yang sesuai dengan kebutuhan tim dan project kamu! 🤔`,
        excerpt: "Perbandingan mendalam antara React dan Vue untuk membantu kamu memilih framework yang tepat.",
        featuredImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
        categoryId: categoryMap["teknologi"],
        authorId: adminId,
        status: "published" as const,
        featured: false,
        viewCount: 945,
        publishedAt: new Date("2025-12-11"),
      },
      {
        title: "Tailwind CSS Tips and Tricks",
        slug: "tailwind-css-tips",
        content: `# Tailwind CSS Tips and Tricks

Koleksi tips untuk memaksimalkan penggunaan Tailwind CSS.

## Custom Colors

\`\`\`javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
      }
    }
  }
}
\`\`\`

## Responsive Design

\`\`\`html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <!-- Content -->
</div>
\`\`\`

## Dark Mode

\`\`\`html
<div class="bg-white dark:bg-gray-900">
  <!-- Content -->
</div>
\`\`\`

Happy styling! 🎨`,
        excerpt: "Koleksi tips dan tricks untuk memaksimalkan penggunaan Tailwind CSS dalam project kamu.",
        featuredImage: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800",
        categoryId: categoryMap["tutorial"],
        authorId: adminId,
        status: "published" as const,
        featured: false,
        viewCount: 734,
        publishedAt: new Date("2025-12-10"),
      },
    ];

    for (const post of posts) {
      await db.insert(schema.post).values(post).onConflictDoNothing();
    }
    console.log("✅ Sample posts created\n");

    // Create sample settings
    console.log("Creating default settings...");
    const settings = [
      { key: "siteName", value: "HagBlog" },
      { key: "siteDescription", value: "Exploring Ideas, One Post at a Time" },
      { key: "postsPerPage", value: "10" },
      { key: "maintenance.enabled", value: "false" },
      { key: "maintenance.message", value: "Site is under maintenance" },
      { key: "comments.enabled", value: "true" },
    ];

    for (const setting of settings) {
      await db.insert(schema.setting).values(setting).onConflictDoNothing();
    }
    console.log("✅ Settings created\n");

    console.log("🎉 Seed completed successfully!");
    console.log("\n📝 Login credentials:");
    console.log("   Admin: blogger1@hagblog.com / admin123");
    console.log("   Writer: writer@hagblog.com / blog123");

  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  } finally {
    await client.end();
  }
}

seed();
