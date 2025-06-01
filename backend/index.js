const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

const Collector = require('./collector'); // Dein Collector-Modul, das Wetterdaten holt
const supabase = require('./supabaseClient'); // Supabase-Client importieren

app.use(cors());
app.use(express.json());

const collectors = new Map(); // laufende Collector-Instanzen

// Collector starten
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

    // data ist bereits das flache wetterdaten-Objekt aus dem Collector
    const { error } = await supabase.from('wetterdaten').insert([data]);

    if (error) {
      console.error('Fehler beim Speichern in Supabase:', error);
    }
  });

  collector.start();
  collectors.set(location, collector);

  res.json({ message: `Collector für ${location} gestartet` });
});

// Collector stoppen
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

// Alle Wetterdaten abrufen (optional nach Stadt filtern)
app.get('/weather', async (req, res) => {
  const { city } = req.query;

  let query = supabase.from('wetterdaten').select('*').order('messzeitpunkt', { ascending: false });

  if (city) {
    query = query.ilike('ort', `%${city}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Fehler beim Abrufen von Wetterdaten:', error);
    return res.status(500).json({ error: 'Fehler beim Abrufen der Daten' });
  }

  res.json(data);
});

// Liste der laufenden Collector-Instanzen
app.get('/collectors', (req, res) => {
  const runningCollectors = Array.from(collectors.keys());
  res.json({ running: runningCollectors });
});

// Server starten
app.listen(port, () => {
  console.log(`Backend läuft unter http://localhost:${port}`);
});
