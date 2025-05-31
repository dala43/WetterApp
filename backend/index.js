const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

const Collector = require('./collector');

app.use(cors({
  origin: ['http://localhost:3000'], // nur mein Frontend erlauben
  methods: ['GET', 'POST'],          // nur nötige Methoden erlauben
}));
app.use(express.json());

const collectors = new Map();
const collectedData = [];

app.post('/collectors/start', (req, res) => {
  const { location, attribute } = req.body;

  if (!location || !attribute) {
    return res.status(400).json({ error: 'location und attribute erforderlich' });
  }

  if (collectors.has(location)) {
    return res.status(400).json({ error: 'Collector läuft bereits für diesen Ort' });
  }

  const collector = new Collector(location, attribute, (data) => {
    console.log('Neue Wetterdaten:', data);
    collectedData.push(data);
  });

  collector.start();
  collectors.set(location, collector);

  res.json({ message: `Collector für ${location} gestartet` });
});

app.post('/collectors/stop', (req, res) => {
  const { location } = req.body;

  if (!location) return res.status(400).json({ error: 'location erforderlich' });

  if (!collectors.has(location)) {
    return res.status(404).json({ error: 'Collector für diesen Ort läuft nicht' });
  }

  const collector = collectors.get(location);
  collector.stop();
  collectors.delete(location);

  res.json({ message: `Collector für ${location} gestoppt` });
});

app.get('/weather', (req, res) => {
  const { city } = req.query;

  if (city) {
    const filtered = collectedData.filter(
      (item) => item.location.toLowerCase() === city.toLowerCase()
    );
    return res.json(filtered);
  }

  res.json(collectedData);
});

app.listen(port, () => {
  console.log(`Backend läuft unter http://localhost:${port}`);
});
