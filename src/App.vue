<template>
  <div class="app">
    <Navbar />
    <main class="page">
      <router-view />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue'
import AppFooter from './components/AppFooter.vue'
</script>

<style>
/* Theme tokens + base layout */
:root{
  --bg:#0b0c0f; --ink:#e9eaf0; --muted:#9aa0a6;
  --panel:rgba(255,255,255,.04); --panel-border:rgba(255,255,255,.12);
  --cy:#25c2f6; --mg:#b16cea; --pu:#7c5cff;
  --radius:18px; --radius-sm:14px; --blur: blur(14px);
  --maxw:1120px; --pad:20px;
}
*{box-sizing:border-box}
html,body,#app{height:100%}
body{margin:0;background:var(--bg);color:var(--ink);
     font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial}
.app{min-height:100vh; display:flex; flex-direction:column}
.page{flex:1; display:block}
.container{max-width:var(--maxw); margin:0 auto; padding:0 var(--pad)}
a{color:inherit; text-decoration:none}
</style>
