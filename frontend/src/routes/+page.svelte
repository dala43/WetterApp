<script>
  import WeatherCard from './WeatherCard.svelte';
  let city = '';
  let weatherData = null;
  let error = '';
  let loading = false;

  async function searchWeather() {
    if (!city.trim()) return;

    loading = true;
    error = '';
    weatherData = null;

    try {
      // Collector starten
      const startResponse = await fetch('http://localhost:3001/collectors/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: city.trim() })
      });

      if (!startResponse.ok) {
        const msg = await startResponse.json();
        console.warn('Collector-Fehler:', msg);
        // Fehler ignorieren, wenn Collector schon läuft
      }

      // Kurze Pause, damit Collector Daten sammeln kann
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Wetterdaten abrufen
      const res = await fetch(`http://localhost:3001/weather?city=${encodeURIComponent(city.trim())}`);
      if (!res.ok) {
        error = 'Fehler beim Abrufen der Wetterdaten vom Server';
        loading = false;
        return;
      }

      const data = await res.json();
      weatherData = data[0] || null;

    } catch (err) {
      error = 'Fehler beim Laden der Wetterdaten';
      console.error(err);
    } finally {
      loading = false;
    }
  }
</script>

<style>
  .container {
    max-width: 600px;
    margin: 2rem auto;
    padding: 1rem;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  input[type="text"] {
    padding: 0.5rem;
    font-size: 1rem;
    flex-grow: 1;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  button {
    padding: 0.5rem 1rem;
    margin-left: 0.5rem;
    background-color: #1e90ff;
    border: none;
    border-radius: 4px;
    color: white;
    font-weight: bold;
    cursor: pointer;
  }

  button:hover {
    background-color: #0f70d4;
  }

  .search-bar {
    display: flex;
    margin-bottom: 1rem;
  }

  .error {
    color: #cc0000;
  }
</style>

<div class="container">
  <h1>Wetterdaten suchen</h1>

  <div class="search-bar">
    <input
      type="text"
      placeholder="Stadt eingeben (z. B. Berlin)"
      bind:value={city}
      on:keydown={(e) => { if (e.key === 'Enter') searchWeather(); }}
    />
    <button on:click={searchWeather}>Suchen</button>
  </div>

  {#if loading}
    <p>Lade Wetterdaten...</p>
  {/if}

  {#if error}
    <p class="error">{error}</p>
  {/if}

  {#if weatherData}
    <WeatherCard {weatherData} />
  {/if}
</div>
