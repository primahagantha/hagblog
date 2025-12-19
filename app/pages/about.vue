<template>
  <section class="about-hero">
      <div class="container">
        <span class="about-badge">👋 About Us</span>
        <h1 class="about-title">Hi, Welcome to <span class="text-gradient">HagBlog</span></h1>
        <p class="about-subtitle">Platform blog modern untuk berbagi ide dan pengetahuan.</p>
      </div>
    </section>

    <section class="section">
      <div class="container container-narrow">
        <h2 class="section-title">Our Story</h2>
        <p class="story-text">HagBlog dimulai dari keinginan sederhana untuk berbagi pengetahuan. Kami percaya setiap orang memiliki sesuatu berharga untuk dibagikan.</p>
        <p class="story-text">Fokus kami adalah konten berkualitas tentang teknologi, programming, dan lifestyle.</p>
      </div>
    </section>

    <section class="section section-alt">
      <div class="container">
        <h2 class="section-title text-center">Our Values</h2>
        <div class="values-grid">
          <div class="value-card">
            <span class="value-icon">📚</span>
            <h3>Quality Content</h3>
            <p>Artikel dengan riset mendalam dan perhatian pada detail.</p>
          </div>
          <div class="value-card">
            <span class="value-icon">🤝</span>
            <h3>Community First</h3>
            <p>Konten berdasarkan kebutuhan komunitas.</p>
          </div>
          <div class="value-card">
            <span class="value-icon">🚀</span>
            <h3>Always Learning</h3>
            <p>Selalu update dengan tren terbaru.</p>
          </div>
          <div class="value-card">
            <span class="value-icon">💡</span>
            <h3>Practical Focus</h3>
            <p>Konten yang bisa langsung dipraktikkan.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section cta-section">
      <div class="container text-center">
        <h2 class="cta-title">Want to Contribute?</h2>
        <p class="cta-desc">Kami terbuka untuk guest writers dan kolaborasi.</p>
        <a :href="mailtoLink" class="btn btn-primary">
          ✉️ Get in Touch
        </a>
      </div>
    </section>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'About - HagBlog',
  description: 'Kenali lebih dekat HagBlog, platform blog modern.',
})

// Pre-filled mailto link for better UX
const mailtoLink = computed(() => {
  const email = 'hello@hagblog.com'
  const subject = encodeURIComponent('Collaboration Inquiry - HagBlog')
  const body = encodeURIComponent(`Hi HagBlog Team,

I'm interested in contributing/collaborating with HagBlog.

[Please describe your idea or proposal here]

Best regards,
[Your Name]`)
  return `mailto:${email}?subject=${subject}&body=${body}`
})
</script>

<style scoped>
.about-hero { background: linear-gradient(135deg, var(--primary-50) 0%, var(--bg-primary) 100%); padding: var(--space-16) 0; text-align: center; }
[data-theme="dark"] .about-hero { background: linear-gradient(135deg, var(--primary-900) 0%, var(--bg-primary) 100%); }
.about-badge { display: inline-block; padding: var(--space-2) var(--space-4); font-size: var(--text-sm); color: var(--primary-600); background: var(--primary-100); border-radius: var(--radius-full); margin-bottom: var(--space-4); }
.about-title { font-size: var(--text-5xl); margin-bottom: var(--space-4); }
.text-gradient { background: linear-gradient(135deg, var(--primary-500), var(--accent-500)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.about-subtitle { font-size: var(--text-lg); color: var(--text-secondary); max-width: 500px; margin: 0 auto; }
.section { padding: var(--space-16) 0; }
.section-alt { background: var(--bg-tertiary); }
.section-title { font-size: var(--text-2xl); margin-bottom: var(--space-6); }
.text-center { text-align: center; }
.story-text { font-size: var(--text-lg); color: var(--text-secondary); line-height: 1.8; margin-bottom: var(--space-4); }
.values-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-6); margin-top: var(--space-8); }
.value-card { text-align: center; padding: var(--space-6); background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-xl); }
.value-icon { font-size: 2rem; display: block; margin-bottom: var(--space-3); }
.value-card h3 { font-size: var(--text-base); margin-bottom: var(--space-2); }
.value-card p { font-size: var(--text-sm); color: var(--text-secondary); margin: 0; }
.cta-section { background: linear-gradient(135deg, var(--primary-500), var(--primary-700)); padding: var(--space-12) 0; }
.cta-title { font-size: var(--text-2xl); color: white; margin-bottom: var(--space-2); }
.cta-desc { color: rgba(255,255,255,0.9); margin-bottom: var(--space-6); }
@media (max-width: 1024px) { .values-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) { .about-title { font-size: var(--text-3xl); } .values-grid { grid-template-columns: 1fr; } }
</style>
