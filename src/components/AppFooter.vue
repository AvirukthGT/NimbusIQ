<template>
  <footer class="footer">
    <!-- ambient glow -->
    <span aria-hidden="true" class="glow"></span>

    <div class="container inner">
      <!-- brand -->
      <div class="brand">
        <span class="logo-ring" aria-hidden="true">
          <span class="ring r1"></span>
          <span class="ring r2"></span>
        </span>
        <div class="brand-text">
          <strong class="name">NimbusIQ</strong>
          <span class="tagline">Weather, distilled.</span>
        </div>
      </div>

      <!-- nav / social -->
      <nav class="nav">
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/weatherapi">WeatherAPI</a>
        <a href="https://www.weatherapi.com/" target="_blank" rel="noopener">Docs</a>
      </nav>

      <div class="meta">
        <div class="copy">© {{ year }} NimbusIQ</div>
        <div class="data muted">Data via WeatherAPI</div>

        <div class="social" aria-label="Social links">
          <a class="ico" href="#" aria-label="GitHub" title="GitHub">
            <!-- GitHub -->
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
              <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.4c.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.39-3.88-1.39-.53-1.34-1.29-1.7-1.29-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.21 1.78 1.21 1.04 1.78 2.73 1.27 3.4.97.11-.75.41-1.27.74-1.56-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.2-3.07-.12-.29-.52-1.47.11-3.06 0 0 .98-.31 3.21 1.17a11.1 11.1 0 0 1 5.84 0c2.23-1.48 3.21-1.17 3.21-1.17.63 1.59.23 2.77.11 3.06.75.8 1.2 1.82 1.2 3.07 0 4.39-2.69 5.37-5.25 5.66.42.36.8 1.07.8 2.16v3.2c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .5z"/>
            </svg>
          </a>
          <a class="ico" href="#" aria-label="Twitter / X" title="Twitter / X">
            <!-- X -->
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
              <path d="M18.9 3H22l-9.1 10.4L21.6 21h-7.2l-5.7-6.9L2.4 21H0l9.9-11.3L2 3h7.2l5.2 6.3L18.9 3z"/>
            </svg>
          </a>
        </div>

        <button class="to-top" @click="toTop" aria-label="Back to top">↑</button>
      </div>
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
function toTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
/* --- foundation --- */
.footer{
  position: relative;
  overflow: clip;
  border-top: 1px solid var(--panel-border, rgba(255,255,255,.08));
  background:
    radial-gradient(1200px 60px at 50% 0, rgba(255,255,255,.06), transparent 60%),
    /* star specks */
    radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,.15), transparent 60%),
    radial-gradient(1px 1px at 70% 50%, rgba(255,255,255,.15), transparent 60%),
    radial-gradient(1px 1px at 40% 80%, rgba(255,255,255,.12), transparent 60%),
    linear-gradient(to top, rgba(10,14,24,.75), rgba(10,14,24,.35));
  backdrop-filter: var(--blur, saturate(140%) blur(10px));
  -webkit-backdrop-filter: var(--blur, saturate(140%) blur(10px));
}
.inner{
  display:grid;
  grid-template-columns: 1fr auto auto;
  gap: 2rem;
  align-items: center;
  min-height: 84px;
  padding: 18px clamp(16px, 4vw, 36px);
  color: var(--muted, #a4b2c8);
}

/* ambient glow blob */
.glow{
  position:absolute; inset:auto 10% -40% auto; width: 420px; height: 420px;
  background: radial-gradient(50% 50% at 50% 50%, rgba(90,140,255,.18), rgba(120,60,255,.14) 45%, transparent 70%);
  filter: blur(30px);
  pointer-events:none;
  animation: float 16s ease-in-out infinite;
}
@keyframes float { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-10px) } }
@media (prefers-reduced-motion: reduce){ .glow{ animation: none } }

/* brand */
.brand{ display:flex; gap:.9rem; align-items:center }
.logo-ring{ position:relative; width:34px; height:34px; display:inline-grid; place-items:center }
.ring{
  position:absolute; inset:0; border-radius:999px;
  background: conic-gradient(from 0deg, var(--accent, #7aa2ff), #b388ff 40%, #7aa2ff 80%);
  opacity:.18;
  box-shadow: 0 0 18px rgba(122,162,255,.25) inset;
}
.r1{ filter: blur(6px) }
.r2{ inset:4px; background: radial-gradient(60% 60% at 50% 50%, rgba(255,255,255,.2), rgba(255,255,255,.05) 60%, transparent 70%); border-radius: 999px; }
.brand-text .name{ color:#eaf0ff; letter-spacing:.3px; font-weight:700 }
.brand-text .tagline{ font-size:.82rem; opacity:.7; display:block; margin-top:2px }

/* nav */
.nav{ display:flex; gap:1.2rem; align-items:center; flex-wrap:wrap }
.nav a{
  color: var(--muted, #a4b2c8);
  text-decoration: none;
  padding:6px 10px;
  border-radius: 10px;
  transition: 180ms ease;
  border: 1px solid transparent;
}
.nav a:hover{
  color:#eaf0ff;
  border-color: rgba(122,162,255,.25);
  background: linear-gradient(180deg, rgba(122,162,255,.12), rgba(122,162,255,.05));
  box-shadow: 0 0 0 3px rgba(122,162,255,.08);
}

/* meta / right cluster */
.meta{ display:flex; gap:1rem; align-items:center; flex-wrap:wrap; justify-self:end }
.copy{ color:#d7e0f9 }
.data{ font-size:.9rem }
.social{ display:flex; gap:.6rem }
.ico{
  display:grid; place-items:center;
  width:32px; height:32px; border-radius:10px;
  color:#c8d6ff; opacity:.8; transition: 160ms ease;
  border:1px solid rgba(255,255,255,.08);
  background: linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.02));
}
.ico:hover{ opacity:1; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(122,162,255,.15) }

.to-top{
  border: 1px solid rgba(255,255,255,.12);
  background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
  color:#eaf0ff; padding:6px 10px; border-radius:10px; cursor:pointer;
  transition: 160ms ease; line-height:1; font-size:.9rem;
}
.to-top:hover{ transform: translateY(-1px); box-shadow: 0 6px 18px rgba(122,162,255,.18) }

/* layout: small screens */
@media (max-width: 900px){
  .inner{ grid-template-columns: 1fr; gap:1rem; text-align:left }
  .meta{ justify-self:start }
}
</style>
