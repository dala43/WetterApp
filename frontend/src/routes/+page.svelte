<script>
  import { onMount } from 'svelte';
  let city = '';
  let weatherData = null; // ein Objekt pro Stadt, keine Liste mehr
  let error = '';
  let loading = false;

  async function searchWeather() {
    if (!city.trim()) return;

    loading = true;
    error = '';
    weatherData = null;

    try {
      // 1. Collector starten (kein attribute mehr nötig)
      const startResponse = await fetch('http://localhost:3001/collectors/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: city.trim() }) // attribute weg
      });

      if (!startResponse.ok) {
        const msg = await startResponse.json();
        console.warn('Collector-Fehler:', msg);
        // Fehler ignorieren, wenn Collector schon läuft
      }

      // 2. Kurz warten (Collector braucht ein paar Sekunden)
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 3. Wetterdaten abrufen
      const res = await fetch(`http://localhost:3001/weather?city=${encodeURIComponent(city.trim())}`);
      if (!res.ok) {
        error = 'Fehler beim Abrufen der Wetterdaten vom Server';
        loading = false;
        return;
      }
      const data = await res.json();

      // Da in DB pro Ort nur ein Datensatz mit allen Spalten gespeichert wird,
      // einfach den neuesten nehmen (oder ersten)
      weatherData = data[0] || null;

    } catch (err) {
      error = 'Fehler beim Laden der Wetterdaten';
      console.error(err);
    } finally {
      loading = false;
    }
  }
</script>

<div class="max-w-xl mx-auto p-4">
  <h1 class="text-2xl font-bold mb-4">Wetterdaten suchen</h1>

  <div class="flex gap-2 mb-4">
    <input
      type="text"
      placeholder="Stadt eingeben (z. B. Berlin)"
      bind:value={city}
      class="flex-1 border rounded p-2"
    />
    <button on:click={searchWeather} class="bg-blue-600 text-white px-4 py-2 rounded">
      Suchen
    </button>
  </div>

  {#if loading}
    <p>Lade Wetterdaten...</p>
  {/if}

  {#if error}
    <p class="text-red-500">{error}</p>
  {/if}

  {#if weatherData}
    <div class="bg-gray-100 p-4 rounded space-y-1">
      <h2 class="font-semibold text-lg mb-2">{weatherData.ort}</h2>
      <p>Temperatur: {weatherData.temperatur} °C</p>
      <p>Gefühlte Temperatur: {weatherData.fuehlbare_temperatur} °C</p>
      <p>Luftfeuchtigkeit: {weatherData.luftfeuchtigkeit} %</p>
      <p>Luftdruck: {weatherData.luftdruck} hPa</p>
      <p>Wetter: {weatherData.wetter_haupt} ({weatherData.wetter_beschreibung})</p>
      <p>Sichtweite: {weatherData.sichtweite} m</p>
      <p>Bewölkung: {weatherData.bewölkung} %</p>
      <p>Windgeschwindigkeit: {weatherData.wind_geschwindigkeit} m/s</p>
      <p>Windrichtung: {weatherData.wind_richtung}°</p>
      <p>Windböen: {weatherData.wind_böen} m/s</p>
      <p>Sonnenaufgang: {new Date(weatherData.sonnenaufgang).toLocaleTimeString()}</p>
      <p>Sonnenuntergang: {new Date(weatherData.sonnenuntergang).toLocaleTimeString()}</p>
      <p>Messzeitpunkt: {new Date(weatherData.messzeitpunkt).toLocaleString()}</p>
      <p>Niederschlag 1h: {weatherData.niederschlag_1h ?? 0} mm</p>
      <p>Niederschlag 3h: {weatherData.niederschlag_3h ?? 0} mm</p>
      <p>Schneefall 1h: {weatherData.schneefall_1h ?? 0} mm</p>
      <p>Schneefall 3h: {weatherData.schneefall_3h ?? 0} mm</p>
    </div>
  {/if}
</div>
