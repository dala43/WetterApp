<script>
  import { onMount } from 'svelte';

  let city = '';
  let weatherDataList = [];
  let activeIndex = 0;
  let loading = false;
  let error = '';
  let currentVideo = 'Hintergrund.mp4';

  // Menü-Steuerung
  let menuOpen = false;
  let searchInMenu = '';
  let addMode = false;
  let newCity = '';

  async function searchWeather(cityToSearch = city) {
    if (!cityToSearch.trim()) return;

    loading = true;
    error = '';

    try {
      await fetch('http://localhost:3001/collectors/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: cityToSearch.trim() })
      });

      await new Promise(res => setTimeout(res, 3000));

      const res = await fetch(`http://localhost:3001/weather?city=${encodeURIComponent(cityToSearch.trim())}`);
      if (!res.ok) throw new Error('Serverfehler');

      const data = await res.json();
      const weather = data[0];

      if (weather) {
        const beschreibung = weather.wetter_beschreibung?.toLowerCase() || '';
        let video = 'wolken.mp4';

        if (beschreibung.includes('klar') || beschreibung.includes('sonnig')) video = 'sonne.mp4';
        else if (beschreibung.includes('regen')) video = 'regen.mp4';
        else if (beschreibung.includes('schnee')) video = 'schnee.mp4';

        // Verhindere Duplikate
        if (!weatherDataList.find(w => w.ort.toLowerCase() === weather.ort.toLowerCase())) {
          weatherDataList = [...weatherDataList, { ...weather, video }];
          activeIndex = weatherDataList.length - 1;
          currentVideo = video;
        } else {
          // Wenn schon vorhanden, einfach zu dem Ort wechseln
          const idx = weatherDataList.findIndex(w => w.ort.toLowerCase() === weather.ort.toLowerCase());
          switchTo(idx);
        }

        city = '';
        newCity = '';
        addMode = false;
        menuOpen = false;
      } else {
        error = 'Keine Wetterdaten gefunden.';
      }
    } catch (err) {
      error = 'Fehler beim Laden.';
      console.error(err);
    } finally {
      loading = false;
    }
  }

  function formatTime(str) {
    return new Date(str).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function switchTo(index) {
    activeIndex = index;
    currentVideo = weatherDataList[index].video;
  }

  // Swipe gesture
  let startX = 0;

  function handleTouchStart(e) {
    startX = e.touches[0].clientX;
  }

  function handleTouchEnd(e) {
    const deltaX = e.changedTouches[0].clientX - startX;
    if (deltaX > 50 && activeIndex > 0) switchTo(activeIndex - 1);
    else if (deltaX < -50 && activeIndex < weatherDataList.length - 1) switchTo(activeIndex + 1);
  }

  // Filter für Orte im Menü
  $: filteredLocations = weatherDataList.filter(w => w.ort.toLowerCase().includes(searchInMenu.toLowerCase()));

  function deleteLocation(index) {
    weatherDataList = weatherDataList.filter((_, i) => i !== index);
    if (activeIndex >= weatherDataList.length) {
      activeIndex = weatherDataList.length - 1;
    }
    if (weatherDataList.length > 0) {
      currentVideo = weatherDataList[activeIndex]?.video || 'Hintergrund.mp4';
    } else {
      currentVideo = 'Hintergrund.mp4';
    }
  }
</script>

<style>
  body {
    margin: 0;
    overflow: hidden;
    font-family: sans-serif;
  }

  .video-bg {
    position: fixed;
    top: 0; left: 0;
    width: 100vw;
    height: 100vh;
    object-fit: cover;
    z-index: -1;
  }

  .center {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    flex-direction: column;
    align-items: center;
    color: white;
    display: flex;
    gap: 1rem;
    z-index: 10;
  }

  .menu-button {
    position: fixed;
    top: 1rem;
    right: 1rem;
    background: #007aff;
    border: none;
    border-radius: 6px;
    color: white;
    padding: 0.5rem 1rem;
    cursor: pointer;
    z-index: 20;
  }

  .menu {
    position: fixed;
    top: 0; right: 0;
    width: 280px;
    height: 100vh;
    background: rgba(0,0,0,0.7);
    color: white;
    backdrop-filter: blur(10px);
    padding: 1rem;
    box-sizing: border-box;
    overflow-y: auto;
    z-index: 15;
    display: flex;
    flex-direction: column;
  }

  .menu input[type="text"] {
    width: 100%;
    padding: 0.5rem;
    border-radius: 6px;
    border: none;
    margin-bottom: 1rem;
    font-size: 1rem;
  }

  .menu ul {
    list-style: none;
    padding: 0;
    margin: 0;
    flex-grow: 1;
    overflow-y: auto;
  }

  .menu li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.4rem 0.2rem;
    border-bottom: 1px solid rgba(255,255,255,0.2);
    cursor: pointer;
  }

  .menu li:hover {
    background: rgba(255,255,255,0.1);
  }

  .delete-button {
    background: transparent;
    border: none;
    color: #ff4d4d;
    font-weight: bold;
    cursor: pointer;
    font-size: 1.1rem;
  }

  .add-location-container {
    margin-top: 1rem;
  }

  .add-location-container button {
    width: 100%;
    padding: 0.5rem;
    background: #007aff;
    border: none;
    color: white;
    border-radius: 6px;
    cursor: pointer;
  }

  .slide-container {
    display: flex;
    transition: transform 0.5s ease;
    height: 100vh;
    width: 100vw;
  }

  .slide {
    min-width: 100vw;
    padding: 2rem;
    box-sizing: border-box;
    color: white;
    overflow-y: auto;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .weather-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 1rem;
    max-width: 600px;
    width: 100%;
  }

  .weather-widget {
    background: rgba(255, 255, 255, 0.50);
    border-radius: 12px;
    padding: 1rem;
    text-align: center;
    backdrop-filter: blur(8px);
    color: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    font-size: 0.95rem;
    user-select: none;
  }

  .weather-widget span {
    display: block;
    opacity: 0.7;
    margin-top: 0.3rem;
    font-size: 0.85rem;
  }

  .weather-widget.big {
    grid-column: span 2;
    font-size: 1.2rem;
  }

  .dots {
    position: fixed;
    bottom: 1rem;
    width: 100%;
    display: flex;
    justify-content: center;
    z-index: 10;
  }

  .dot {
    width: 12px;
    height: 12px;
    background: white;
    margin: 0 5px;
    border-radius: 50%;
    opacity: 0.5;
    cursor: pointer;
  }

  .dot.active {
    opacity: 1;
  }
</style>

<video class="video-bg" src={currentVideo} autoplay muted loop playsinline></video>

{#if weatherDataList.length === 0}
  <div class="center">
    <h1>Wetter App</h1>
    <div>
      <input
        type="text"
        placeholder="Stadt eingeben"
        bind:value={city}
        on:keydown={(e) => e.key === 'Enter' && searchWeather()}
      />
      <button on:click={searchWeather}>Suchen</button>
    </div>
    {#if loading}<p>Wird geladen...</p>{/if}
    {#if error}<p>{error}</p>{/if}
  </div>
{:else}
  <button class="menu-button" on:click={() => menuOpen = !menuOpen}>
    {menuOpen ? '✖' : '☰'}
  </button>

  {#if menuOpen}
    <div class="menu" on:click|stopPropagation>
      {#if addMode}
        <input
          type="text"
          placeholder="Neuen Ort eingeben"
          bind:value={newCity}
          on:keydown={(e) => e.key === 'Enter' && searchWeather(newCity)}
          autofocus
        />
        <div class="add-location-container">
          <button
            on:click={() => {
              if(newCity.trim()) searchWeather(newCity);
            }}
            disabled={loading || !newCity.trim()}
          >Hinzufügen</button>
          <button style="margin-top:0.5rem; background: #555;" on:click={() => {
            addMode = false;
            newCity = '';
          }}>Abbrechen</button>
        </div>
      {:else}
        <input
          type="text"
          placeholder="Orte durchsuchen"
          bind:value={searchInMenu}
          autofocus
        />
        <ul>
          {#each filteredLocations as loc, i}
            <li on:click={() => {
              switchTo(weatherDataList.indexOf(loc));
              menuOpen = false;
              searchInMenu = '';
            }}>
              {loc.ort}
              <button class="delete-button" on:click={(e) => {
                e.stopPropagation();
                const idx = weatherDataList.indexOf(loc);
                deleteLocation(idx);
              }}>×</button>
            </li>
          {/each}
          {#if filteredLocations.length === 0}
            <li>Keine Orte gefunden.</li>
          {/if}
        </ul>
        <div class="add-location-container">
          <button on:click={() => {
            addMode = true;
            searchInMenu = '';
            newCity = '';
          }}>+ Neuer Ort</button>
        </div>
      {/if}
    </div>
  {/if}

  <div
    class="slide-container"
    style="transform: translateX(-{activeIndex * 100}vw);"
    on:touchstart={handleTouchStart}
    on:touchend={handleTouchEnd}
  >
    {#each weatherDataList as data, i}
      <div class="slide" aria-hidden={i !== activeIndex}>
        <div class="weather-grid">
          <div class="weather-widget big">
            <h2>📍 {data.ort}</h2>
            <p>{data.wetter_beschreibung}</p>
          </div>

          <div class="weather-widget"><p>🌡️ {data.temperatur}°C<br><span>Temperatur</span></p></div>
          <div class="weather-widget"><p>🤗 {data.fuehlbare_temperatur}°C<br><span>Gefühlt</span></p></div>
          <div class="weather-widget"><p>💧 {data.luftfeuchtigkeit}%<br><span>Feuchtigkeit</span></p></div>
          <div class="weather-widget"><p>📊 {data.luftdruck} hPa<br><span>Druck</span></p></div>
          <div class="weather-widget"><p>💨 {data.wind_geschwindigkeit} m/s<br><span>Wind</span></p></div>
          <div class="weather-widget"><p>🧭 {data.wind_richtung}°<br><span>Richtung</span></p></div>
          <div class="weather-widget"><p>☁️ {data.bewölkung}%<br><span>Bewölkung</span></p></div>
          <div class="weather-widget"><p>🌅 {formatTime(data.sonnenaufgang)}<br><span>Aufgang</span></p></div>
          <div class="weather-widget"><p>🌇 {formatTime(data.sonnenuntergang)}<br><span>Untergang</span></p></div>
          <div class="weather-widget"><p>👁️ {data.sichtweite} m<br><span>Sicht</span></p></div>
          <div class="weather-widget"><p>☔ {data.niederschlag_1h ?? 0} mm<br><span>Regen 1h</span></p></div>
          <div class="weather-widget"><p>☔ {data.niederschlag_3h ?? 0} mm<br><span>Regen 3h</span></p></div>
          <div class="weather-widget"><p>❄️ {data.schneefall_1h ?? 0} mm<br><span>Schnee 1h</span></p></div>
          <div class="weather-widget"><p>❄️ {data.schneefall_3h ?? 0} mm<br><span>Schnee 3h</span></p></div>
          <div class="weather-widget"><p>⏰ {new Date(data.messzeitpunkt).toLocaleString()}<br><span>Messzeit</span></p></div>
        </div>
      </div>
    {/each}
  </div>

  <div class="dots">
    {#each weatherDataList as _, i}
      <div
        class="dot {i === activeIndex ? 'active' : ''}"
        on:click={() => switchTo(i)}
      ></div>
    {/each}
  </div>
{/if}
