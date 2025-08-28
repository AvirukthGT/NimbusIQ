<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { getWeather } from '../lib/weather'

const query = ref(localStorage.getItem('nimbusiq:lastQ') || 'London')
const loading = ref(false)
const error = ref('')
const current = ref(null)
const forecast = ref(null)

async function load () {
  try {
    loading.value = true; error.value = ''
    const data = await getWeather(query.value, 7)
    current.value = data.current
    forecast.value = data.forecast
    localStorage.setItem('nimbusiq:lastQ', query.value)
  } catch (e) {
    error.value = e.message || 'Failed to load'
  } finally {
    loading.value = false
  }
}

const place = computed(() => {
  const l = current.value?.location
  return l ? `${l.name}, ${l.country}` : ''
})
const days = computed(() => forecast.value?.forecast?.forecastday || [])

/* tiny animated starfield (canvas) */
const starsCanvas = ref(null)
let rafId = 0
function initStars () {
  const c = starsCanvas.value; if (!c) return
  const ctx = c.getContext('2d', { alpha: false })
  let w = c.width = c.offsetWidth, h = c.height = c.offsetHeight
  const count = Math.round((w * h) / 15000)
  const s = new Array(count).fill(0).map(() => ({
    x: Math.random() * w, y: Math.random() * h,
    z: .2 + Math.random() * .8, r: .4 + Math.random() * 1.2
  }))
  const draw = () => {
    ctx.fillStyle = '#0b0c0f'; ctx.fillRect(0, 0, w, h)
    for (const p of s) {
      p.y += .1 * p.z; if (p.y > h) { p.y = -2; p.x = Math.random() * w }
      const a = .5 + .5 * Math.sin((Date.now() * 0.002 + p.x) * p.z)
      ctx.fillStyle = `rgba(255,255,255,${.05 + .7 * a * p.z})`
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill()
    }
    rafId = requestAnimationFrame(draw)
  }
  draw()
}

onMounted(() => { load(); initStars() })
onBeforeUnmount(() => cancelAnimationFrame(rafId))
</script>

<template>
  <section class="stage">
    <!-- Background layers -->
    <canvas ref="starsCanvas" class="bg-stars"></canvas>
    <div class="bg-aurora"></div>
    <div class="bg-grid"></div>

    <!-- Centered fold (hero + cards) -->
    <div class="fold">
      <!-- Hero -->
      <div class="container hero">
        <h1 class="title">Weather, distilled.</h1>
        <p class="subtitle">Clean insights — timezone-aware, AQI-aware, alert-ready.</p>

        <div class="search">
          <input v-model="query" @keyup.enter="load" class="search-input"
                 placeholder="Search city or lat,long (e.g. -37.8136,144.9631)" />
          <button class="search-btn" :disabled="loading" @click="load">
            <span>{{ loading ? 'Loading…' : 'Search' }}</span><i class="pulse"></i>
          </button>
        </div>
        <div class="base">Base: http://api.weatherapi.com/v1</div>
      </div>

      <!-- Cards -->
      <div class="container grid">
        <!-- Current -->
        <article class="card neon current">
          <div v-if="!current && loading" class="skel">
            <div class="s title"></div><div class="s temp"></div><div class="s row"></div><div class="s row"></div>
          </div>

          <template v-else-if="current">
            <div class="head">
              <h2 class="card-title truncate">{{ place }}</h2>
              <span class="chip nowrap">{{ current.current.condition.text }}</span>

            </div>

            <div class="temp-line">
              <div class="temp">{{ Math.round(current.current.temp_c) }}°C</div>
              <div class="feels">Feels {{ Math.round(current.current.feelslike_c) }}°</div>
            </div>

            <div class="stats">
              <div class="stat"><span>Wind</span><strong>{{ Math.round(current.current.wind_kph) }} km/h</strong></div>
              <div class="stat"><span>Humidity</span><strong>{{ current.current.humidity }}%</strong></div>
              <div class="stat"><span>UV</span><strong>{{ current.current.uv }}</strong></div>
              <div class="stat"><span>AQI PM2.5</span><strong>{{ current.current.air_quality?.['pm2_5']?.toFixed?.(1) ?? '—' }}</strong></div>
              <div class="stat wide"><span>Timezone</span><strong class="truncate">{{ current.location.tz_id }}</strong></div>
            </div>
          </template>

          <p v-else class="muted">Search a location to begin.</p>
        </article>

        <!-- Forecast -->
        <article class="card neon">
          <div class="rowtop">
            <h3 class="card-title">7-Day Outlook</h3>
            <div class="muted">Daily highs • rain chance</div>
          </div>

          <div v-if="loading && !forecast" class="forecast-skel">
            <div v-for="n in 7" :key="n" class="s day"></div>
          </div>

          <div v-else-if="days.length" class="forecast-grid">
            <div v-for="d in days" :key="d.date" class="day">
              <div class="date">{{ d.date }}</div>
              <div class="max">{{ Math.round(d.day.maxtemp_c) }}°</div>
              <div class="cond truncate" :title="d.day.condition.text">{{ d.day.condition.text }}</div>

              <div class="rain">Rain {{ Math.round(d.day.daily_chance_of_rain) }}%</div>
            </div>
          </div>

          <p v-else class="muted">No forecast yet.</p>
        </article>
      </div>
    </div>

    <!-- Errors -->
    <section v-if="error" class="container">
      <div class="alert">{{ error }}</div>
    </section>
  </section>
</template>

<style scoped>
/* ---------- layout variables ---------- */
:root{
  --navH: 72px;
  --footH: 60px;

  --panel: rgba(18,21,26,.72);
  --panel-border:#2c2f33;
  --radius: 16px;
  --radius-sm: 12px;
  --ink:#e9eef5;
  --muted:#c0c7d2cc;
  --cy:#25c2f6; --mg:#b86bff;
  --blur: blur(10px);
}

/* ---------- helpers ---------- */
.truncate{ max-width:100%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
.nowrap{ white-space:nowrap }

/* ---------- containers ---------- */
.container{
  width:min(1200px, 92%);
  margin-inline:auto;
}

/* ---------- page shell ---------- */
.stage{
  position: relative;
  min-height: calc(100dvh - var(--footH));
  padding-top: var(--navH);
  overflow: hidden;
}

/* ---------- center hero + cards ---------- */
.fold{
  min-height: calc(100dvh - var(--navH) - var(--footH));
  display: grid;
  place-content: center;
  gap: 64px;                   /* more breathing room */
  padding: 120px 0 80px;
}

/* ---------- background layers ---------- */
.bg-stars{ position:absolute; inset:0; z-index:0; width:100%; height:100% }
.bg-aurora{
  position:absolute; inset:-20% -10% auto -10%; height:70%;
  background:
    radial-gradient(60% 55% at 30% 20%, rgba(37,194,246,.28), transparent 60%),
    radial-gradient(60% 55% at 70% 10%, rgba(177,108,234,.25), transparent 60%),
    radial-gradient(50% 45% at 50% 0, rgba(124,92,255,.18), transparent 60%);
  filter:blur(40px); animation:drift 22s ease-in-out infinite alternate; z-index:1; pointer-events:none
}
@keyframes drift{ 0%{transform:translateY(-6%) scale(1)} 50%{transform:translateY(4%) scale(1.05)} 100%{transform:translateY(-2%) scale(1.02)} }
.bg-grid{
  position:absolute; inset:0; z-index:2; opacity:.16; pointer-events:none;
  background:
    linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px) 0 0/44px 44px,
    linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px) 0 0/44px 44px;
  mask-image: radial-gradient(ellipse at 50% -20%, black 40%, transparent 70%);
}
.bg-grid::after{ content:""; position:absolute; inset:0;
  background:radial-gradient(1200px 300px at 50% -120px, rgba(37,194,246,.22), transparent 70%) }

/* ---------- hero ---------- */
.hero{ position:relative; z-index:3; text-align:center }
.title{ font-size:3.4rem; line-height:1.1; margin:0 }
.subtitle{ color:var(--muted); margin:.8rem 0 1.6rem; font-size:1.05rem }

/* ---------- search ---------- */
.search{ display:flex; gap:12px; justify-content:center; align-items:center; margin-top:.4rem }
.search-input{
  width:min(760px,100%); padding:16px 18px; border-radius:16px;
  background:rgba(255,255,255,.06);
  color:var(--ink); border:1px solid var(--panel-border); outline:none; backdrop-filter: var(--blur)
}
.search-input::placeholder{ color:#88909a }
.search-btn{
  position:relative; overflow:hidden; padding:14px 20px; border:none; color:#0b0c0f; font-weight:800; cursor:pointer;
  border-radius:16px; background:linear-gradient(135deg,var(--cy),var(--mg)); box-shadow:0 8px 26px rgba(37,194,246,.25);
  transition:transform .15s ease, box-shadow .2s ease
}
.search-btn:hover{ transform:translateY(-1px); box-shadow:0 12px 34px rgba(177,108,234,.28) }
.search-btn .pulse{
  position:absolute; inset:-40% -10% auto -10%; height:200%;
  background: radial-gradient(120px 90px at 10% 40%, rgba(255,255,255,.4), transparent 40%);
  mix-blend-mode:overlay; filter:blur(12px); animation:pulse 3s ease-in-out infinite; pointer-events:none
}
@keyframes pulse{ 0%,100%{transform:translateX(-10%)} 50%{transform:translateX(40%)} }
.base{ margin-top:10px; font-size:.9rem; color:var(--muted) }

/* ---------- grid cards ---------- */
.grid{
  display:grid; gap:28px; position:relative; z-index:3;
  grid-template-columns: 1fr;                 /* single column on mobile */
}
@media(min-width:980px){
  .grid{ grid-template-columns: 1.05fr 1.6fr }
}

/* ---------- cards ---------- */
.card{
  background: var(--panel);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius);
  padding: 24px;                               /* more padding */
  backdrop-filter: var(--blur);
  box-shadow: 0 22px 64px rgba(0,0,0,.42);
  transform: translateY(0);
  transition: transform .2s, box-shadow .25s, border-color .2s;
}
.card:hover{ transform: translateY(-2px); box-shadow: 0 28px 76px rgba(0,0,0,.46) }
.neon{ position:relative }
.neon::before{
  content:""; position:absolute; inset:-1px; border-radius:inherit; z-index:-1;
  background:linear-gradient(135deg, rgba(37,194,246,.35), rgba(177,108,234,.35));
  filter:blur(18px); opacity:.25; transition:opacity .25s
}
.neon:hover::before{ opacity:.45 }
.card-title{ margin:0 0 10px; font-weight:800; font-size:1.2rem }

/* ---------- current card ---------- */
.current .head{ display:flex; align-items:center; justify-content:space-between; gap:16px }
.current .head .chip{ white-space:nowrap }     /* prevent wrap */
.temp-line{ display:flex; align-items:baseline; gap:22px; margin:12px 0 14px }
.temp{ font-size:3.6rem; font-weight:800; letter-spacing:-.5px; line-height:1 }
.feels{ color:var(--muted) }

.stats{
  display:grid; gap:12px;
  grid-template-columns: repeat(2, minmax(0,1fr));
  margin-top:12px
}
@media(min-width:640px){
  .stats{ grid-template-columns: repeat(3, minmax(0,1fr)) }
}
.stat{
  display:flex; align-items:center; justify-content:space-between;
  padding:12px 14px; background:rgba(255,255,255,.05);
  border:1px solid var(--panel-border); border-radius: var(--radius-sm)
}
.stat strong{ white-space:nowrap }             /* keep figures on one line */
.stat.wide{ grid-column: span 2 }

/* ---------- forecast ---------- */
.rowtop{ display:flex; align-items:center; justify-content:space-between; margin-bottom:10px }
.forecast-grid{
  display:grid; gap:14px;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); /* auto-fit with min width */
}
.day{
  text-align:center; padding:14px; border-radius:14px; background:rgba(255,255,255,.05);
  border:1px solid var(--panel-border);
  transition: transform .18s, box-shadow .18s, background .2s;
  box-shadow: 0 8px 24px rgba(0,0,0,.25);
  min-height: 168px;                            /* taller to avoid wrap */
}
.day:hover{ transform:translateY(-3px) scale(1.02); background:rgba(255,255,255,.065) }
.date{ font-size:.8rem; color:var(--muted) }
.max{ font-size:1.6rem; font-weight:800; margin-top:4px }
.cond{ font-size:.95rem; margin-top:4px; }
.cond.truncate{ display:block }                /* reuse ellipsis utility */
.rain{ font-size:.8rem; color:var(--muted); margin-top:6px }

/* ---------- alerts + skeletons ---------- */
.alert{ margin:8px 0 28px; padding:12px 14px; border-radius:14px; background:rgba(220,80,80,.16); border:1px solid rgba(220,80,80,.35) }
.s{ background:rgba(255,255,255,.09); border-radius:12px }
.s.title{ height:18px; width:40%; margin:6px 0 }
.s.temp{ height:48px; width:26%; margin:8px 0 }
.s.row{ height:14px; width:80%; margin:6px 0 }
.forecast-skel{ display:grid; grid-template-columns:repeat(7,1fr); gap:12px }
.forecast-skel .day{ height:96px; border-radius:12px }

/* --- Current card fixes (paste after your existing styles) --- */

/* Make the stats grid auto-fit into comfortably wide pills */
.current .stats{
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}

/* Force proper spacing inside each pill */
.current .stat{
  display: flex !important;          /* ensure flex wins over any global styles */
  align-items: center;
  gap: 10px;                         /* visible gap even if content is short */
}

/* Push the value to the right and keep it on one line */
.current .stat strong{
  margin-left: auto;                 /* creates space between label and value */
  white-space: nowrap;               /* prevents "16 km/h" breaking */
}

/* Let longer labels wrap softly without squashing the value */
.current .stat span{
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Keep the timezone from exploding layout but allow a fuller preview */
.current .truncate{
  max-width: 420px;                  /* wider before ellipsis on desktop */
}
@media (max-width: 760px){
  .current .truncate{ max-width: 260px; }
}

</style>
