<template>
  <footer class="footer">
    <div class="container inner">
      <div>© {{ new Date().getFullYear() }} NimbusIQ</div>
      <div class="muted">Data via WeatherAPI</div>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.footer{
  border-top:1px solid var(--panel-border);
  background:linear-gradient(to top, rgba(255,255,255,.04), rgba(255,255,255,.02));
  backdrop-filter:var(--blur);
}
.inner{height:60px; display:flex; align-items:center; justify-content:space-between; color:var(--muted)}
.muted{color:var(--muted)}
</style>
