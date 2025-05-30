const axios = require('axios');
require('dotenv').config();

class Collector {
  constructor(location, onData) {
    this.location = location;
    this.onData = onData;
    this.interval = null;
    this.apiKey = process.env.OPENWEATHER_API_KEY;

  }

  async fetchData() {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${this.location}&units=metric&appid=${this.apiKey}&lang=de`;
      const response = await axios.get(url);
      const data = response.data;

      // Datenobjekt passend zur DB-Tabelle bauen
      const wetterdaten = {
        ort: this.location,
        temperatur: data.main.temp,
        fuehlbare_temperatur: data.main.feels_like,
        luftfeuchtigkeit: data.main.humidity,
        luftdruck: data.main.pressure,

        wetter_haupt: data.weather[0]?.main || null,
        wetter_beschreibung: data.weather[0]?.description || null,
        wetter_icon: data.weather[0]?.icon || null,

        sichtweite: data.visibility || null,
        bewölkung: data.clouds.all || null,

        wind_geschwindigkeit: data.wind.speed || null,
        wind_richtung: data.wind.deg || null,
        wind_böen: data.wind.gust || null,

        sonnenaufgang: data.sys.sunrise ? new Date(data.sys.sunrise * 1000).toISOString() : null,
        sonnenuntergang: data.sys.sunset ? new Date(data.sys.sunset * 1000).toISOString() : null,
        messzeitpunkt: data.dt ? new Date(data.dt * 1000).toISOString() : new Date().toISOString(),

        niederschlag_1h: data.rain?.['1h'] || 0,
        niederschlag_3h: data.rain?.['3h'] || 0,
        schneefall_1h: data.snow?.['1h'] || 0,
        schneefall_3h: data.snow?.['3h'] || 0,
      };

      await this.onData(wetterdaten);

    } catch (error) {
      console.error(`Fehler beim Abrufen von Wetterdaten für ${this.location}: ${error.message}`);
    }
  }

  start() {
    if (this.interval) {
      console.warn(`Collector für ${this.location} läuft bereits.`);
      return;
    }
    this.fetchData(); // sofort starten
    this.interval = setInterval(() => this.fetchData(), 10 * 60 * 1000); // alle 10 Minuten
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log(`Collector für ${this.location} gestoppt.`);
    }
  }
}

module.exports = Collector;
