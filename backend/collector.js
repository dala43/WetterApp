const axios = require('axios');

class Collector {
  constructor(location, attribute, onData) {
    this.location = location;
    this.attribute = attribute;
    this.onData = onData;
    this.interval = null;
    this.apiKey = '3875a9e6f9339448ac33a9533ea3fc44';
  }

  async fetchData() {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${this.location}&units=metric&appid=${this.apiKey}`;
      const response = await axios.get(url);
      const value = response.data.main[this.attribute];

      const data = {
        location: this.location,
        attribute: this.attribute,
        value,
        timestamp: new Date().toISOString()
      };

      this.onData(data);
    } catch (error) {
      console.error(`Fehler beim Abrufen von Wetterdaten: ${error.message}`);
    }
  }

  start() {
    this.fetchData();
    this.interval = setInterval(() => this.fetchData(), 10 * 1000); 
  }

  stop() {
    clearInterval(this.interval);
  }
}

module.exports = Collector;
