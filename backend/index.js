require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const supabase = require('./supabaseClient');
const Collector = require('./collector');

const app = express();
const port = 3001;

app.disable('x-powered-by'); // Express-Version verstecken
app.use(helmet());           // Sicherheitsheader setzen

app.use(cors({
  origin: ['http://localhost:3000','http://localhost:5173'], // nur mein Frontend erlauben
  methods: ['GET', 'POST'],           // nur nötige Methoden erlauben
}));
app.use(express.json());

const collectors = new Map();

app.post('/collectors/start', (req, res) => {
  const { location } = req.body;

  if (!location) {
    return res.status(400).json({ error: 'location erforderlich' });
  }

  if (collectors.has(location)) {
    return res.status(400).json({ error: 'Collector läuft bereits für diesen Ort' });
  }

  const collector = new Collector(location, async (data) => {
    console.log('Neue Wetterdaten:', data);

    const { error } = await supabase
      .from('wetterdaten')
      .insert([{
        ort: data.ort,
        temperatur: data.temperatur,
        fuehlbare_temperatur: data.fuehlbare_temperatur,
        luftfeuchtigkeit: data.luftfeuchtigkeit,
        luftdruck: data.luftdruck,
        wetter_haupt: data.wetter_haupt,
        wetter_beschreibung: data.wetter_beschreibung,
        wetter_icon: data.wetter_icon,
        sichtweite: data.sichtweite,
        bewölkung: data.bewölkung,
        wind_geschwindigkeit: data.wind_geschwindigkeit,
        wind_richtung: data.wind_richtung,
        wind_böen: data.wind_böen,
        sonnenaufgang: data.sonnenaufgang,
        sonnenuntergang: data.sonnenuntergang,
        messzeitpunkt: data.messzeitpunkt,
        niederschlag_1h: data.niederschlag_1h,
        niederschlag_3h: data.niederschlag_3h,
        schneefall_1h: data.schneefall_1h,
        schneefall_3h: data.schneefall_3h,
      }]);

    if (error) {
      console.error('Fehler beim Speichern in Supabase:', error);
    }
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

app.get('/weather', async (req, res) => {
  const { city } = req.query;

  let query = supabase.from('wetterdaten').select('*');

  if (city) {
    query = query.eq('ort', city);
  }

  const { data, error } = await query.order('messzeitpunkt', { ascending: false });

  if (error) {
    return res.status(500).json({ error: 'Fehler beim Abrufen der Wetterdaten' });
  }

  res.json(data);
});


app.listen(port, () => {
  console.log(`Backend läuft unter http://localhost:${port}`);
});
