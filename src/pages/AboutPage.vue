<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import * as d3 from 'd3'
import { getWeather } from '../lib/weather'

/* ---------- state ---------- */
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

const days = computed(() => forecast.value?.forecast?.forecastday || [])
const series = computed(() =>
  days.value.map(d => ({
    date: new Date(d.date + 'T00:00:00'),
    max: d.day.maxtemp_c,
    min: d.day.mintemp_c,
    rain: +d.day.daily_chance_of_rain
  }))
)

/* ---------- D3 mounts ---------- */
const tempEl = ref(null)
const rainEl = ref(null)
let ro1, ro2

function renderAll () {
  renderTemps()
  renderRain()
}

watch(series, renderAll, { immediate: false })

onMounted(() => {
  load()
  ro1 = new ResizeObserver(renderTemps); tempEl.value && ro1.observe(tempEl.value)
  ro2 = new ResizeObserver(renderRain);  rainEl.value && ro2.observe(rainEl.value)
  initStars()
})
onBeforeUnmount(() => {
  ro1?.disconnect(); ro2?.disconnect()
  cancelAnimationFrame(rafId)
})

/* ---------- Temps line chart ---------- */
function renderTemps () {
  const el = tempEl.value; if (!el) return
  el.innerHTML = ''
  const data = series.value; if (!data.length) return

  const margin = { top: 24, right: 24, bottom: 36, left: 44 }
  const width  = el.clientWidth || 680
  const height = 300
  const w = width - margin.left - margin.right
  const h = height - margin.top - margin.bottom

  const svg = d3.create('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('width', '100%').attr('height', '100%')

  const defs = svg.append('defs')
  defs.append('linearGradient').attr('id','gradHot').attr('x1','0').attr('x2','1')
    .selectAll('stop').data([
      {o:'0%','c':'#25c2f6'}, {o:'100%','c':'#b86bff'}
    ]).enter().append('stop').attr('offset',d=>d.o).attr('stop-color',d=>d.c)
  defs.append('linearGradient').attr('id','gradCold').attr('x1','0').attr('x2','1')
    .selectAll('stop').data([
      {o:'0%','c':'#9bd0ff'}, {o:'100%','c':'#a39bff'}
    ]).enter().append('stop').attr('offset',d=>d.o).attr('stop-color',d=>d.c)

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  const x = d3.scaleUtc().domain(d3.extent(data, d => d.date)).range([0, w])
  const y = d3.scaleLinear()
    .domain([d3.min(data, d=>d.min)-2, d3.max(data, d=>d.max)+2]).nice()
    .range([h, 0])

  const ax = d3.axisBottom(x).ticks(data.length).tickFormat(d3.timeFormat('%a %d'))
  const ay = d3.axisLeft(y).ticks(5)

  const gx = g.append('g').attr('transform',`translate(0,${h})`).call(ax)
  const gy = g.append('g').call(ay)
  ;[gx, gy].forEach(axg => {
    axg.selectAll('text').attr('fill','var(--muted)').style('font-size','12px')
    axg.selectAll('path,line').attr('stroke','rgba(255,255,255,.15)')
  })

  const line = (key, stroke) => d3.line()
    .x(d => x(d.date)).y(d => y(d[key])).curve(d3.curveMonotoneX)

  g.append('path').datum(data).attr('fill','none').attr('stroke','url(#gradHot)').attr('stroke-width',2.5).attr('d', line('max'))
  g.append('path').datum(data).attr('fill','none').attr('stroke','url(#gradCold)').attr('stroke-width',2.5).attr('d', line('min'))

  // Tooltip
  const focus = g.append('g').style('display', 'none')
  focus.append('line').attr('y1',0).attr('y2',h).attr('stroke','rgba(255,255,255,.25)')
  const dotH = focus.append('circle').attr('r',4).attr('fill','var(--cy)')
  const dotC = focus.append('circle').attr('r',4).attr('fill','var(--mg)')

  const tip = d3.select(el).append('div').attr('class','tooltip')

  svg.on('mousemove', (ev) => {
    const [mx] = d3.pointer(ev, g.node())
    const d = data[d3.bisector(d=>d.date).center(data, x.invert(mx))]
    focus.style('display', null)
    focus.attr('transform',`translate(${x(d.date)},0)`)
    dotH.attr('cx',0).attr('cy', y(d.max))
    dotC.attr('cx',0).attr('cy', y(d.min))
    tip.style('opacity',1)
      .style('left', (x(d.date) + margin.left + 10) + 'px')
      .style('top',  (y(d.max) + margin.top - 28) + 'px')
      .html(`<strong>${d3.timeFormat('%a %d %b')(d.date)}</strong><br>High: ${Math.round(d.max)}°C<br>Low: ${Math.round(d.min)}°C`)
  }).on('mouseleave', () => tip.style('opacity',0) && focus.style('display','none'))

  el.appendChild(svg.node())
}

/* ---------- Rain bars ---------- */
function renderRain () {
  const el = rainEl.value; if (!el) return
  el.innerHTML = ''
  const data = series.value; if (!data.length) return

  const margin = { top: 24, right: 24, bottom: 36, left: 42 }
  const width  = el.clientWidth || 680
  const height = 280
  const w = width - margin.left - margin.right
  const h = height - margin.top - margin.bottom

  const svg = d3.create('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('width', '100%').attr('height', '100%')

  const defs = svg.append('defs')
  const gr = defs.append('linearGradient').attr('id','gradRain').attr('x1','0').attr('y1','0').attr('x2','0').attr('y2','1')
  gr.append('stop').attr('offset','0%').attr('stop-color','#25c2f6')
  gr.append('stop').attr('offset','100%').attr('stop-color','#b86bff')

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  const x = d3.scaleBand().domain(data.map(d => d.date)).range([0, w]).padding(0.22)
  const y = d3.scaleLinear().domain([0, 100]).nice().range([h, 0])

  const ax = d3.axisBottom(x).tickFormat(d3.timeFormat('%a %d'))
  const ay = d3.axisLeft(y).ticks(5).tickFormat(d => d + '%')

  const gx = g.append('g').attr('transform',`translate(0,${h})`).call(ax)
  const gy = g.append('g').call(ay)
  ;[gx, gy].forEach(axg => {
    axg.selectAll('text').attr('fill','var(--muted)').style('font-size','12px')
    axg.selectAll('path,line').attr('stroke','rgba(255,255,255,.15)')
  })

  const bars = g.selectAll('rect').data(data).join('rect')
    .attr('x', d => x(d.date))
    .attr('y', d => y(d.rain))
    .attr('width', x.bandwidth())
    .attr('height', d => h - y(d.rain))
    .attr('rx', 10)
    .attr('fill', 'url(#gradRain)')

  const tip = d3.select(el).append('div').attr('class','tooltip')
  bars.on('mousemove', function (ev, d) {
    const [mx, my] = d3.pointer(ev, this.ownerSVGElement)
    tip.style('opacity',1)
      .style('left', (mx + 12) + 'px')
      .style('top',  (my - 24) + 'px')
      .html(`<strong>${d3.timeFormat('%a %d %b')(d.date)}</strong><br>Rain: ${Math.round(d.rain)}%`)
  }).on('mouseleave', () => tip.style('opacity',0))

  el.appendChild(svg.node())
}

/* ---------- tiny animated starfield (same vibe as Home) ---------- */
const starsCanvas = ref(null)
let rafId = 0
function initStars () {
  const c = starsCanvas.value; if (!c) return
  const ctx = c.getContext('2d', { alpha: false })
  let w = c.width = c.offsetWidth, h = c.height = c.offsetHeight
  const count = Math.round((w * h) / 15000)
  const stars = new Array(count).fill(0).map(() => ({
    x: Math.random() * w, y: Math.random() * h,
    z: .2 + Math.random() * .8, r: .4 + Math.random() * 1.2
  }))
  const draw = () => {
    ctx.fillStyle = '#0b0c0f'; ctx.fillRect(0, 0, w, h)
    for (const p of stars) {
      p.y += .1 * p.z; if (p.y > h) { p.y = -2; p.x = Math.random() * w }
      const a = .5 + .5 * Math.sin((Date.now() * 0.002 + p.x) * p.z)
      ctx.fillStyle = `rgba(255,255,255,${.05 + .7 * a * p.z})`
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill()
    }
    rafId = requestAnimationFrame(draw)
  }
  draw()
}
</script>

<template>
  <section class="stage">
    <canvas ref="starsCanvas" class="bg-stars"></canvas>
    <div class="bg-aurora"></div>
    <div class="bg-grid"></div>

    <div class="fold">
      <!-- Hero -->
      <div class="container hero">
        <h1 class="title">Weather Insights</h1>
        <p class="subtitle">D3-powered trends for the next 7 days.</p>

        <div class="search">
          <input v-model="query" @keyup.enter="load" class="search-input"
                 placeholder="Try Melbourne or -37.8136,144.9631" />
          <button class="search-btn" :disabled="loading" @click="load">
            <span>{{ loading ? 'Loading…' : 'Search' }}</span><i class="pulse"></i>
          </button>
        </div>
        <div class="base">Uses your WeatherAPI data</div>
      </div>

      <!-- Charts -->
      <div class="container grid insights">
        <article class="card neon">
          <div class="rowtop">
            <h3 class="card-title">High vs Low Temperature</h3>
            <div class="muted">Daily °C</div>
          </div>
          <div ref="tempEl" class="chart"></div>
        </article>

        <article class="card neon">
          <div class="rowtop">
            <h3 class="card-title">Rain Probability</h3>
            <div class="muted">Chance of precipitation</div>
          </div>
          <div ref="rainEl" class="chart"></div>
        </article>
      </div>

      <section v-if="error" class="container">
        <div class="alert">{{ error }}</div>
      </section>
    </div>
  </section>
</template>

<style scoped>
:root{
  --navH: 72px; --footH: 60px;
  --panel: rgba(18,21,26,.72); --panel-border:#2c2f33;
  --radius: 16px; --radius-sm: 12px;
  --ink:#e9eef5; --muted:#c0c7d2cc;
  --cy:#25c2f6; --mg:#b86bff; --blur: blur(10px);
}
.container{ width:min(1200px,92%); margin-inline:auto }

/* page shell */
.stage{ position:relative; min-height:calc(100dvh - var(--footH)); padding-top:var(--navH); overflow:hidden }
.fold{ min-height:calc(100dvh - var(--navH) - var(--footH)); display:grid; place-content:center; gap:56px; padding:120px 0 80px }

/* background */
.bg-stars{ position:absolute; inset:0; z-index:0; width:100%; height:100% }
.bg-aurora{ position:absolute; inset:-20% -10% auto -10%; height:70%;
  background:
    radial-gradient(60% 55% at 30% 20%, rgba(37,194,246,.28), transparent 60%),
    radial-gradient(60% 55% at 70% 10%, rgba(177,108,234,.25), transparent 60%),
    radial-gradient(50% 45% at 50% 0, rgba(124,92,255,.18), transparent 60%);
  filter:blur(40px); animation:drift 22s ease-in-out infinite alternate; z-index:1; pointer-events:none }
@keyframes drift{ 0%{transform:translateY(-6%) scale(1)} 50%{transform:translateY(4%) scale(1.05)} 100%{transform:translateY(-2%) scale(1.02)} }
.bg-grid{ position:absolute; inset:0; z-index:2; opacity:.16; pointer-events:none;
  background:
    linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px) 0 0/44px 44px,
    linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px) 0 0/44px 44px;
  mask-image: radial-gradient(ellipse at 50% -20%, black 40%, transparent 70%); }
.bg-grid::after{ content:""; position:absolute; inset:0;
  background:radial-gradient(1200px 300px at 50% -120px, rgba(37,194,246,.22), transparent 70%) }

/* hero */
.hero{ position:relative; z-index:3; text-align:center }
.title{ font-size:3.2rem; margin:0; line-height:1.1 }
.subtitle{ color:var(--muted); margin:.8rem 0 1.6rem }

/* search */
.search{ display:flex; gap:12px; justify-content:center; align-items:center }
.search-input{ width:min(760px,100%); padding:16px 18px; border-radius:16px; background:rgba(255,255,255,.06); color:var(--ink); border:1px solid var(--panel-border); outline:none; backdrop-filter:var(--blur) }
.search-input::placeholder{ color:#88909a }
.search-btn{ position:relative; overflow:hidden; padding:14px 20px; border:none; color:#0b0c0f; font-weight:800; cursor:pointer; border-radius:16px; background:linear-gradient(135deg,var(--cy),var(--mg)); box-shadow:0 8px 26px rgba(37,194,246,.25); transition:transform .15s ease, box-shadow .2s ease }
.search-btn:hover{ transform:translateY(-1px); box-shadow:0 12px 34px rgba(177,108,234,.28) }
.search-btn .pulse{ position:absolute; inset:-40% -10% auto -10%; height:200%; background: radial-gradient(120px 90px at 10% 40%, rgba(255,255,255,.4), transparent 40%); mix-blend-mode:overlay; filter:blur(12px); animation:pulse 3s ease-in-out infinite; pointer-events:none }
@keyframes pulse{ 0%,100%{transform:translateX(-10%)} 50%{transform:translateX(40%)} }
.base{ margin-top:10px; font-size:.9rem; color:var(--muted) }

/* grid/cards */
.grid{ display:grid; gap:28px; z-index:3 }
@media(min-width:980px){ .grid{ grid-template-columns: 1fr 1fr } }
.card{ background:var(--panel); border:1px solid var(--panel-border); border-radius:var(--radius); padding:24px; backdrop-filter:var(--blur); box-shadow:0 22px 64px rgba(0,0,0,.42); transition:transform .2s, box-shadow .25s }
.card:hover{ transform:translateY(-2px); box-shadow:0 28px 76px rgba(0,0,0,.46) }
.neon{ position:relative }
.neon::before{ content:""; position:absolute; inset:-1px; border-radius:inherit; z-index:-1; background:linear-gradient(135deg, rgba(37,194,246,.35), rgba(177,108,234,.35)); filter:blur(18px); opacity:.25; transition:opacity .25s }
.neon:hover::before{ opacity:.45 }
.card-title{ margin:0 0 10px; font-weight:800; font-size:1.2rem }
.rowtop{ display:flex; align-items:center; justify-content:space-between; margin-bottom:10px }
.muted{ color:var(--muted) }

/* charts */
.chart{ position:relative; height:320px }
.chart svg{ width:100%; height:100% }
.tooltip{
  position:absolute; pointer-events:none; opacity:0;
  padding:8px 10px; border-radius:10px; font-size:.85rem; color:var(--ink);
  background:rgba(0,0,0,.6); border:1px solid var(--panel-border); backdrop-filter:var(--blur)
}

/* alerts */
.alert{ margin:8px 0 28px; padding:12px 14px; border-radius:14px; background:rgba(220,80,80,.16); border:1px solid rgba(220,80,80,.35) }
</style>
