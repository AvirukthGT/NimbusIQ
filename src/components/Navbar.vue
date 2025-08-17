<template>
  <header class="navbar">
    <div class="container nav-inner">
      <div class="brand">
        <span class="dot"></span>
        <span class="text">NimbusIQ</span>
      </div>

      <nav class="links">
        <RouterLink to="/" class="link" active-class="active">Home</RouterLink>
        <RouterLink to="/about" class="link" active-class="active">About</RouterLink>
        <a class="link" href="https://www.weatherapi.com/" target="_blank" rel="noreferrer">WeatherAPI</a>
      </nav>
    </div>
  </header>
</template>

<script setup>
</script>

<style scoped>
.navbar{
  position:sticky; top:0; z-index:20;
  background: linear-gradient(to bottom, rgba(12,13,15,.9), rgba(12,13,15,.6));
  border-bottom:1px solid var(--panel-border);
  backdrop-filter:var(--blur);
}
.nav-inner{height:64px; display:flex; align-items:center; justify-content:space-between}
.brand{display:flex; align-items:center; gap:10px; font-weight:700; letter-spacing:.3px}
.dot{width:22px; height:22px; border-radius:8px;
     background:linear-gradient(135deg,var(--cy),var(--mg));
     box-shadow:0 0 28px rgba(37,194,246,.45)}
.text{opacity:.95}
.links{display:flex; gap:6px}
.link{
  color:var(--muted); padding:8px 12px; border-radius:12px;
  border:1px solid transparent; transition:all .18s ease;
}
.link:hover{ color:var(--ink); background:rgba(255,255,255,.06); border-color:var(--panel-border) }
.active{ color:var(--ink); background:rgba(255,255,255,.08); border-color:var(--panel-border) }
</style>
