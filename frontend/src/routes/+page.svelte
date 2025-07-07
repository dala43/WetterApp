<script>
  import { onMount } from "svelte";
  import "./wetterDaten.css";

  let city = "";
  let weatherDataList = [];
  let activeIndex = 0;
  let loading = false;
  let error = "";
  let currentVideo = "Hintergrund.mp4";

  // Menü-Steuerung
  let menuOpen = false;
  let searchInMenu = "";
  let addMode = false;
  let newCity = "";

  async function searchWeather(cityToSearch = city) {
    if (!cityToSearch.trim()) return;

    loading = true;
    error = "";

const isDocker = window.location.hostname !== 'localhost';
const API_URL = 'http://localhost:3000';


    try {
       await fetch(`${API_URL}/api/collectors/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: cityToSearch.trim() }),
      });

      await new Promise((res) => setTimeout(res, 3000));

         const res = await fetch(`${API_URL}/api/weather?city=${encodeURIComponent(cityToSearch.trim())}`);
      if (!res.ok) throw new Error("Serverfehler");

      const data = await res.json();
      const weather = data[0];

      if (weather) {
        const beschreibung = weather.wetter_beschreibung?.toLowerCase() || "";
        let video = "wolken.mp4";

        if (beschreibung.includes("klar") || beschreibung.includes("sonnig"))
          video = "sonne.mp4";
        else if (beschreibung.includes("regen")) video = "regen.mp4";
        else if (beschreibung.includes("schnee")) video = "schnee.mp4";
        else if (beschreibung.includes("gewitter")) video = "gewitter.mp4";

        // Verhindere Duplikate
        if (
          !weatherDataList.find(
            (w) => w.ort.toLowerCase() === weather.ort.toLowerCase(),
          )
        ) {
          weatherDataList = [...weatherDataList, { ...weather, video }];
          activeIndex = weatherDataList.length - 1;
          currentVideo = video;
        } else {
          // Wenn schon vorhanden, einfach zu dem Ort wechseln
          const idx = weatherDataList.findIndex(
            (w) => w.ort.toLowerCase() === weather.ort.toLowerCase(),
          );
          switchTo(idx);
        }

        city = "";
        newCity = "";
        addMode = false;
        menuOpen = false;
      } else {
        error = "Keine Wetterdaten gefunden.";
      }
    } catch (err) {
      error = "Fehler beim Laden.";
      console.error(err);
    } finally {
      loading = false;
    }
  }

  function formatTime(str) {
    return new Date(str).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
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
    else if (deltaX < -50 && activeIndex < weatherDataList.length - 1)
      switchTo(activeIndex + 1);
  }

  // Filter für Orte im Menü
  $: filteredLocations = weatherDataList.filter((w) =>
    w.ort.toLowerCase().includes(searchInMenu.toLowerCase()),
  );

  async function deleteLocation(index) {
    const cityToDelete = weatherDataList[index].ort;

    try {
          const res = await fetch(`${API_URL}/api/collectors/${encodeURIComponent(location)}`, {

          method: "DELETE",
        },
      );

      if (!res.ok) throw new Error("Fehler beim Löschen im Backend");

      // Stadt lokal entfernen
      weatherDataList = weatherDataList.filter((_, i) => i !== index);

      // aktiven Index anpassen
      if (activeIndex >= weatherDataList.length) {
        activeIndex = weatherDataList.length - 1;
      }

      // Video anpassen
       currentVideo = weatherDataList.length > 0
      ? weatherDataList[activeIndex]?.video || 'Hintergrund.mp4'
      : 'Hintergrund.mp4';

  } catch (err) {
    console.error('Fehler beim Löschen:', err);
  }
}

</script>

<video class="video-bg" src={currentVideo} autoplay muted loop playsinline
></video>

{#if weatherDataList.length === 0}
  <div class="center">
    <h1>Willkommen zur Wetter App</h1>
    <div>
      <input
        type="text"
        placeholder=" Ort eingeben"
        bind:value={city}
        on:keydown={(e) => e.key === "Enter" && searchWeather()}
        style="width: 300px; height: 2rem; font-size: 1.2rem;"
      />
      <button
        on:click={() => searchWeather()}
        style="height: 2.4rem; font-size: 1.2rem;">Suchen</button
      >
    </div>
    {#if loading}<p>Wird geladen...</p>{/if}
    {#if error}<p>{error}</p>{/if}
  </div>
{:else}
  <button class="menu-button" on:click={() => (menuOpen = !menuOpen)}>
    {menuOpen ? "✖" : "☰"}
  </button>

  {#if menuOpen}
    <div class="menu" on:click|stopPropagation>
      {#if addMode}
        <input
          type="text"
          placeholder="Neuen Ort eingeben"
          bind:value={newCity}
          on:keydown={(e) => e.key === "Enter" && searchWeather(newCity)}
          autofocus
        />
        <div class="add-location-container">
          <button
            on:click={() => {
              if (newCity.trim()) searchWeather(newCity);
            }}
            disabled={loading || !newCity.trim()}>Hinzufügen</button
          >
          <button
            style="margin-top:0.5rem; background: #555;"
            on:click={() => {
              addMode = false;
              newCity = "";
            }}>Abbrechen</button
          >
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
            <li
              on:click={() => {
                switchTo(weatherDataList.indexOf(loc));
                menuOpen = false;
                searchInMenu = "";
              }}
            >
              {loc.ort}
              <button
                class="delete-button"
                on:click={(e) => {
                  e.stopPropagation();
                  const idx = weatherDataList.indexOf(loc);
                  deleteLocation(idx);
                }}>×</button
              >
            </li>
          {/each}
          {#if filteredLocations.length === 0}
            <li>Keine Orte gefunden.</li>
          {/if}
        </ul>
        <div class="add-location-container">
          <button
            on:click={() => {
              addMode = true;
              searchInMenu = "";
              newCity = "";
            }}>+ Neuer Ort</button
          >
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
            <h2>{data.ort}</h2>
            <p>{data.wetter_beschreibung}</p>
          </div>

          <div class="weather-widget">
            <p>
              ⏰ <br /><span>Messzeit</span>{new Date(
                data.messzeitpunkt,
              ).toLocaleString()}
            </p>
          </div>
          <div class="weather-widget">
            <p>🌡️ {data.temperatur}°C<br /><span>Temperatur</span></p>
          </div>
          <div class="weather-widget">
            <p>{data.fuehlbare_temperatur}°C<br /><span>Gefühlt</span></p>
          </div>
          <div class="weather-widget">
            <p>💧 {data.luftfeuchtigkeit}%<br /><span>Feuchtigkeit</span></p>
          </div>
          <div class="weather-widget">
            <p>📊 {data.luftdruck} hPa<br /><span>Druck</span></p>
          </div>
          <div class="weather-widget">
            <p>💨 {data.wind_geschwindigkeit} m/s<br /><span>Wind</span></p>
          </div>
          <div class="weather-widget">
            <p>🧭 {data.wind_richtung}°<br /><span>Richtung</span></p>
          </div>
          <div class="weather-widget">
            <p>☁️ {data.bewölkung ?? 0}%<br /><span>Bewölkung</span></p>
          </div>
          <div class="weather-widget">
            <p>🌅 {formatTime(data.sonnenaufgang)}<br /><span>Aufgang</span></p>
          </div>
          <div class="weather-widget">
            <p>
              🌇 {formatTime(data.sonnenuntergang)}<br /><span>Untergang</span>
            </p>
          </div>
          <div class="weather-widget">
            <p>👁️ {data.sichtweite} m<br /><span>Sicht</span></p>
          </div>
          <div class="weather-widget">
            <p>☔ {data.niederschlag_1h ?? 0} mm<br /><span>Regen 1h</span></p>
          </div>
          <div class="weather-widget">
            <p>❄️ {data.schneefall_1h ?? 0} mm<br /><span>Schnee 1h</span></p>
          </div>
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
