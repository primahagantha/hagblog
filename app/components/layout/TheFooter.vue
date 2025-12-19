<template>
  <footer class="footer">
    <div class="container">
      <!-- Main Footer Content -->
      <div class="footer-grid">
        <!-- Brand Section -->
        <div class="footer-brand">
          <NuxtLink to="/" class="footer-logo">
            <span class="logo-icon">📝</span>
            <span class="logo-text">Hag<span class="logo-accent">Blog</span></span>
          </NuxtLink>
          <p class="footer-tagline">
            Exploring ideas, one post at a time. Platform blog modern untuk berbagi ide dan pengetahuan.
          </p>
          <div class="social-links">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Twitter">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="GitHub">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="LinkedIn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="footer-section">
          <h4 class="footer-title">Quick Links</h4>
          <ul class="footer-links">
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li><NuxtLink to="/blog">Blog</NuxtLink></li>
            <li><NuxtLink to="/about">About</NuxtLink></li>
            <li><NuxtLink to="/search">Search</NuxtLink></li>
          </ul>
        </div>

        <!-- Categories -->
        <div class="footer-section">
          <h4 class="footer-title">Categories</h4>
          <ul class="footer-links">
            <li><NuxtLink to="/category/teknologi">Teknologi</NuxtLink></li>
            <li><NuxtLink to="/category/lifestyle">Lifestyle</NuxtLink></li>
            <li><NuxtLink to="/category/tutorial">Tutorial</NuxtLink></li>
            <li><NuxtLink to="/category/tips">Tips & Trik</NuxtLink></li>
          </ul>
        </div>

        <!-- Newsletter -->
        <div class="footer-section footer-newsletter">
          <h4 class="footer-title">Stay Updated</h4>
          <p class="newsletter-text">Subscribe to get the latest posts delivered to your inbox.</p>
          <form class="newsletter-form" @submit.prevent="handleSubscribe">
            <input 
              type="email" 
              v-model="email"
              placeholder="Enter your email" 
              class="newsletter-input"
              required
            >
            <button type="submit" class="newsletter-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </button>
          </form>
        </div>
      </div>

      <!-- Footer Bottom -->
      <div class="footer-bottom">
        <p class="copyright">
          © {{ new Date().getFullYear() }} HagBlog. All rights reserved.
        </p>
        <div class="footer-bottom-links">
          <NuxtLink to="/privacy">Privacy Policy</NuxtLink>
          <NuxtLink to="/terms">Terms of Service</NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const email = ref('')

const handleSubscribe = () => {
  // TODO: Implement newsletter subscription
  console.log('Subscribe:', email.value)
  email.value = ''
}
</script>

<style scoped>
.footer {
  background-color: var(--neutral-900);
  color: var(--neutral-300);
  padding: var(--space-16) 0 var(--space-8);
  margin-top: auto;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: var(--space-8);
  margin-bottom: var(--space-12);
}

/* Brand */
.footer-brand {
  max-width: 300px;
}

.footer-logo {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 700;
  color: white;
  text-decoration: none;
  margin-bottom: var(--space-4);
}

.logo-icon {
  font-size: 1.5rem;
}

.logo-accent {
  color: var(--primary-400);
}

.footer-tagline {
  font-size: var(--text-sm);
  line-height: 1.7;
  color: var(--neutral-400);
  margin-bottom: var(--space-6);
}

/* Social Links */
.social-links {
  display: flex;
  gap: var(--space-3);
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: var(--neutral-800);
  color: var(--neutral-400);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
}

.social-link:hover {
  background-color: var(--primary-500);
  color: white;
  transform: translateY(-2px);
}

/* Footer Sections */
.footer-section {
  display: flex;
  flex-direction: column;
}

.footer-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-4);
}

.footer-links {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.footer-links a {
  font-size: var(--text-sm);
  color: var(--neutral-400);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.footer-links a:hover {
  color: var(--primary-400);
}

/* Newsletter */
.newsletter-text {
  font-size: var(--text-sm);
  color: var(--neutral-400);
  margin-bottom: var(--space-4);
}

.newsletter-form {
  display: flex;
  gap: var(--space-2);
}

.newsletter-input {
  flex: 1;
  padding: var(--space-3);
  font-size: var(--text-sm);
  color: white;
  background-color: var(--neutral-800);
  border: 1px solid var(--neutral-700);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
}

.newsletter-input:focus {
  outline: none;
  border-color: var(--primary-500);
}

.newsletter-input::placeholder {
  color: var(--neutral-500);
}

.newsletter-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.newsletter-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* Footer Bottom */
.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-8);
  border-top: 1px solid var(--neutral-800);
}

.copyright {
  font-size: var(--text-sm);
  color: var(--neutral-500);
}

.footer-bottom-links {
  display: flex;
  gap: var(--space-6);
}

.footer-bottom-links a {
  font-size: var(--text-sm);
  color: var(--neutral-500);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.footer-bottom-links a:hover {
  color: var(--primary-400);
}

/* Responsive */
@media (max-width: 1024px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
  }

  .footer-brand {
    grid-column: span 2;
    max-width: none;
  }
}

@media (max-width: 640px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: var(--space-8);
  }

  .footer-brand {
    grid-column: span 1;
  }

  .footer-bottom {
    flex-direction: column;
    gap: var(--space-4);
    text-align: center;
  }
}
</style>
