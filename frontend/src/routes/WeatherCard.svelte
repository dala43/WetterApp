<!-- WeatherCard.svelte -->
<script>
  export let weatherData;

  function getTempColor(temp) {
    if (temp < 5) return '#00f';
    if (temp < 15) return '#1e90ff';
    if (temp < 25) return '#ff9800';
    return '#f44336';
  }

  const backgroundImages = {
    Clear: '/images/clear.jpg',
    Clouds: '/images/clouds.jpg',
    Rain: '/images/rain.jpg',
    Snow: '/images/snow.jpg',
    Thunderstorm: '/images/thunderstorm.jpg',
    Mist: '/images/mist.jpg',
  };

  $: bgImage = backgroundImages[weatherData.wetter_haupt] || '/images/default.jpg';
</script>

<style>
  :global(body) {
    margin: 0;
    background-color: #e3f2fd;
    font-family: 'Segoe UI', sans-serif;
  }

  .weather-container {
    background: linear-gradient(to top, rgba(255,255,255,0.2), rgba(255,255,255,0.2)), url('{bgImage}') no-repeat center center/cover;
    min-height: 100vh;
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #fff;
    box-sizing: border-box;
  }

  header {
    width: 100%;
    padding: 1.5rem 2rem;
    background: #0d47a1;
    color: white;
    font-size: 2.5rem;
    font-weight: 700;
    text-align: center;
    box-shadow: 0 2px 12px rgba(0,0,0,0.3);
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }

  .headline {
    font-size: 3rem;
    text-shadow: 0 3px 10px rgba(0,0,0,0.4);
    margin: 1.5rem 0 0.5rem;
    text-transform: capitalize;
    color: #2196f3;
    font-weight: 800;
  }

  .icon {
    width: 100px;
    height: 100px;
    margin: 0;
  }

  .grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1.5rem;
    width: 100%;
    max-width: 1600px;
    margin-top: 1.5rem;
    padding: 0 2rem 4rem;
  }

  .card {
    background-color: rgba(255,255,255,0.95);
    padding: 1.5rem;
    border-radius: 12px;
    color: #333;
    box-shadow: 0 4px 20px rgba(0,0,0,0.12);
    flex: 1 1 300px;
    min-width: 280px;
  }

  .card-title {
    font-size: 1.3rem;
    color: #0d47a1;
    border-bottom: 2px solid #64b5f6;
    padding-bottom: 0.4rem;
    margin-bottom: 1rem;
    font-weight: 700;
  }

  .row {
    display: flex;
    justify-content: space-between;
    margin: 0.4rem 0;
    font-size: 1rem;
    border-bottom: 1px dashed #ccc;
    padding-bottom: 0.3rem;
  }

  .label {
    color: #333;
  }

  .value {
    font-weight: 600;
  }
</style>

<div class="weather-container">
  <header>Live Wetterübersicht</header>

  <div class="headline">{weatherData.ort}</div>

  <div class="grid">
    <div class="card">
      <div class="card-title">Basisdaten</div>
      <div class="row"><span class="label">Temperatur</span><span class="value" style="color: {getTempColor(weatherData.temperatur)}">{weatherData.temperatur} °C</span></div>
      <div class="row"><span class="label">Gefühlt</span><span class="value">{weatherData.fuehlbare_temperatur} °C</span></div>
      <div class="row"><span class="label">Luftfeuchtigkeit</span><span class="value">{weatherData.luftfeuchtigkeit} %</span></div>
      <div class="row"><span class="label">Luftdruck</span><span class="value">{weatherData.luftdruck} hPa</span></div>
    </div>

    <div class="card">
      <div class="card-title">Wetter</div>
      <div class="row"><span class="label">Status</span><span class="value">{weatherData.wetter_haupt} ({weatherData.wetter_beschreibung})</span></div>
      {#if weatherData.bewölkung !== undefined && weatherData.bewölkung !== null}
        <div class="row"><span class="label">Bewölkung</span><span class="value">{weatherData.bewölkung}</span></div>
      {/if}
      <div class="row"><span class="label">Sichtweite</span><span class="value">{weatherData.sichtweite} m</span></div>
    </div>

    <div class="card">
      <div class="card-title">Wind</div>
      <div class="row"><span class="label">Geschwindigkeit</span><span class="value">{weatherData.wind_geschwindigkeit} m/s</span></div>
      <div class="row"><span class="label">Richtung</span><span class="value">{weatherData.wind_richtung}°</span></div>
      {#if weatherData.wind_böen !== undefined && weatherData.wind_böen !== null}
        <div class="row"><span class="label">Böen</span><span class="value">{weatherData.wind_böen} m/s</span></div>
      {/if}
    </div>

    <div class="card">
      <div class="card-title">Sonnenzeiten</div>
      <div class="row"><span class="label">Aufgang</span><span class="value">{new Date(weatherData.sonnenaufgang).toLocaleTimeString('de-DE')}</span></div>
      <div class="row"><span class="label">Untergang</span><span class="value">{new Date(weatherData.sonnenuntergang).toLocaleTimeString('de-DE')}</span></div>
    </div>

    {#if (weatherData.niederschlag_1h || weatherData.niederschlag_3h || weatherData.schneefall_1h || weatherData.schneefall_3h)}
    <div class="card">
      <div class="card-title">Niederschlag / Schnee</div>
      {#if weatherData.niederschlag_1h}
        <div class="row"><span class="label">Regen in der letzten Stunde</span><span class="value">{weatherData.niederschlag_1h} mm</span></div>
      {/if}
      {#if weatherData.niederschlag_3h}
        <div class="row"><span class="label">Regen in den letzten 3 Stunden</span><span class="value">{weatherData.niederschlag_3h} mm</span></div>
      {/if}
      {#if weatherData.schneefall_1h}
        <div class="row"><span class="label">Schnee in der letzten Stunde</span><span class="value">{weatherData.schneefall_1h} mm</span></div>
      {/if}
      {#if weatherData.schneefall_3h}
        <div class="row"><span class="label">Schnee in den letzten 3 Stunden</span><span class="value">{weatherData.schneefall_3h} mm</span></div>
      {/if}
    </div>
    {/if}

    <div class="card">
      <div class="card-title">Messzeitpunkt</div>
      <div class="row"><span class="label">Erfasst am</span><span class="value">{new Date(weatherData.messzeitpunkt).toLocaleString('de-DE')}</span></div>
    </div>
  </div>
</div>
