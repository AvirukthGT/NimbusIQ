const BASE = 'http://api.weatherapi.com/v1'
const KEY = import.meta.env.VITE_WEATHER_API_KEY

export async function getWeather(q = 'Melbourne', days = 7) {
  const currentUrl  = `${BASE}/current.json?key=${KEY}&q=${encodeURIComponent(q)}&aqi=yes`
  const forecastUrl = `${BASE}/forecast.json?key=${KEY}&q=${encodeURIComponent(q)}&days=${days}&aqi=yes&alerts=yes`
  const [cRes, fRes] = await Promise.all([fetch(currentUrl), fetch(forecastUrl)])
  if (!cRes.ok || !fRes.ok) throw new Error('Weather API error')
  const [current, forecast] = await Promise.all([cRes.json(), fRes.json()])
  return { current, forecast }
}
