<template>
  <header class="navbar">
    <div class="glow"></div>
    <div class="container nav-inner">
      <!-- Brand -->
<RouterLink to="/" class="brand" aria-label="NimbusIQ">
  <span class="orb" aria-hidden="true"></span>
  <span class="text">NimbusIQ</span>
</RouterLink>

      <!-- Links -->
      <nav class="pillbar" role="navigation" aria-label="Primary">
        <RouterLink to="/" class="link" active-class="active">Home</RouterLink>
        <RouterLink to="/about" class="link" active-class="active">About</RouterLink>
        <a class="link" href="https://www.weatherapi.com/" target="_blank" rel="noreferrer">WeatherAPI</a>
        <!-- subtle moving highlight -->
        <span class="sweep" aria-hidden="true"></span>
      </nav>
    </div>
  </header>
</template>

<script setup>
// no JS needed 🎉
</script>

<style scoped>
/* ====== base/fallbacks for your CSS vars ====== */
:root{
  --ink:#e9eef5;
  --muted:#c0c7d2cc;
  --panel-border:#2c2f33;
  --blur: blur(10px);
  --cy:#25c2f6;
  --mg:#b86bff;
  --bg0:#0b0c0f;
}

/* ====== navbar container ====== */
.navbar{
  position: absolute;     /* instead of sticky */
  top: 0; left: 0; right: 0;
  background: transparent;
  border: 0;
  box-shadow: none;
  z-index: 50;
}
main, .hero, .page { padding-top: 72px; }
.nav-inner {
  height:72px;
  display:flex;
  align-items:center;
  justify-content:space-between;  /* brand left, links right */
  padding: 0 32px;                /* adds breathing room from page edges */
  width: 100%;                    /* stretch full width */
  max-width: 100%;                /* ensure not constrained */
   
}

/* ambient glow behind brand */
.glow{
  display: none; 
  position:absolute; inset:auto 0 0 0; height:120px; z-index:-1;
  background:
    radial-gradient(1200px 200px at 15% 0%, rgba(37,194,246,.18), transparent 60%),
    radial-gradient(800px 160px at 85% 0%, rgba(184,107,255,.14), transparent 60%);
  pointer-events:none;
}

/* ====== brand ====== */
.brand {
  display:flex;
  align-items:center;
  gap:12px;
  font-weight:700;
  letter-spacing:.3px;
  color: var(--ink);
  text-decoration: none;   /* remove underline */
  cursor: pointer;
}
.brand:hover {
  opacity: .9;             /* optional subtle hover effect */
}

.text{ color:var(--ink); font-size:1.05rem; opacity:.95 }

/* living orb */
.orb{
  width:28px; height:28px; border-radius:10px; position:relative;
  background: conic-gradient(from 180deg, var(--cy), var(--mg), var(--cy));
  filter: drop-shadow(0 0 18px rgba(184,107,255,.35));
  animation: spin 8s linear infinite;
}
.orb::before{
  content:""; position:absolute; inset:2px; border-radius:8px;
  background: radial-gradient(120% 120% at 30% 20%, #fff8, transparent 40%) ,
              linear-gradient(135deg, #17191f, #0f1116);
}
@keyframes spin{
  to { transform: rotate(360deg); }
}
@media (prefers-reduced-motion: reduce){
  .orb{ animation:none }
}

/* ====== pillbar & links ====== */
.pillbar{
  position:relative;
  display:flex; align-items:center;
  gap:50px;                /* ⬅️ increased spacing between pills */
  padding:6px 18px;        /* ⬅️ added more horizontal padding inside pillbar */
  background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03));
  border:1px solid var(--panel-border);
  border-radius:18px;
  backdrop-filter: blur(8px);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
}

.link{
  position:relative;
  color:var(--muted); text-decoration:none;
  padding:10px 16px;       /* ⬅️ slightly wider pill buttons */
  border-radius:14px; font-weight:500;
  transition: transform .18s ease, color .18s ease, background .18s ease;
  border:1px solid transparent;
  outline: none;
}


/* underline grows in */
.link::after{
  content:""; position:absolute; left:12px; right:12px; bottom:7px; height:2px;
  background: linear-gradient(90deg, var(--cy), var(--mg));
  transform: scaleX(0); transform-origin:left;
  transition: transform .22s ease;
  opacity:.85;
}
.link:hover{ color:var(--ink); background:rgba(255,255,255,.05); transform: translateY(-1px) }
.link:hover::after{ transform: scaleX(1) }

/* active = luminous pill */
.active{
  color:#0c0e12; 
  background: linear-gradient(135deg, rgba(37,194,246,.85), rgba(184,107,255,.85));
  border-color: transparent;
  box-shadow:
    0 6px 18px rgba(37,194,246,.18),
    0 8px 28px rgba(184,107,255,.16),
    inset 0 1px 0 rgba(255,255,255,.35);
}
.active::after{ display:none }

/* sweep highlight that slowly moves across the pillbar */
.sweep{
  position:absolute; inset:2px; border-radius:16px; pointer-events:none;
  background:
    linear-gradient(120deg, transparent 20%, rgba(255,255,255,.06) 35%, transparent 55%) no-repeat;
  background-size: 200% 100%;
  animation: sweep 6s ease-in-out infinite;
  mix-blend-mode: soft-light;
}
@keyframes sweep{
  0% { background-position: 180% 0 }
  50% { background-position: -40% 0 }
  100% { background-position: 180% 0 }
}

/* focus visible for keyboard nav */
.link:focus-visible{
  box-shadow: 0 0 0 2px rgba(255,255,255,.2), 0 0 0 4px rgba(37,194,246,.35);
}

/* small screens */
@media (max-width: 640px){
  .nav-inner{ height:64px }
  .pillbar{ gap:4px; padding:4px }
  .link{ padding:8px 12px }
}
/* 1) Make the header truly transparent & shadowless */
.navbar,
.navbar::before,
.navbar::after,
.navbar > .container,
.navbar > .container::before,
.navbar > .container::after,
.navbar .nav-inner {
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  -webkit-box-shadow: none !important;
  filter: none !important;
}

/* 2) Ensure no accidental overlay */
.glow { display: none !important; }

/* 3) Re-apply glass only to the pillbar (so you still have the nice look) */
.pillbar{
  background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03));
  border:1px solid var(--panel-border);
  border-radius:18px;
  backdrop-filter: blur(8px);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.04);  /* keep this one */
}

/* Optional: if you ever added a drop shadow to the brand, kill it */
.brand, .brand * { box-shadow: none !important; }
</style>
