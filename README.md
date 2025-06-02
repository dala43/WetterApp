# WetterApp
Cloud-native Microservice-Anwendung zur Erfassung, Speicherung und Visualisierung von Wetterdaten für verschiedene Standorte. Die App besteht aus einer Svelte-Weboberfläche, einem Express.js-Backend und nutzt Supabase für Datenhaltung.

## Funktionen
- Standorte hinzufügen und verwalten
- Wetterdaten automatisch per API abrufen (OpenWeatherMap)
- Daten tabellarisch und grafisch anzeigen
- Supabase als zentrale Datenbank mit REST-Zugriff
- Collector-Dienste manuell steuerbar (Start/Stop/Status)
- Integration mit GitLab CI/CD zur Qualitätssicherung


## Technologien

| Bereich        | Technologie                |
|----------------|----------------------------|
| Frontend       | Svelte                     |
| Backend        | Express.js (Node.js)       |
| Datenhaltung   | Supabase (PostgreSQL BaaS) |
| Datenquelle    | OpenWeatherMap API         |
| CI/CD          | GitLab CI/CD, SonarQube    |


## ProjektStruktur 
wetterapp/
├── frontend/ # Svelte Web-App
├── backend/ # Express API + Collector Services
├── .gitlab-ci.yml # CI/CD-Konfiguration
├── Dokumentation
└── README.md

## Visuelle Darstellung 
![Screenshot der App](assets/screenshot-4.jpg)
![Screenshot der App](assets/screenshot.jpg)
![Screnshot der App]( assets/screenshot-2.jpg)
![Screenshot der App](assets/screenshot-3.jpg)


## Code formatierung und prüfen
npm run lint
npm run format

## Installation
``` bash
zum Ausführen der Frontend: 
cd frontend
npm install
npm run

Zum Ausführen der Backend
cd backend
node index.js 
```


## Ausführen der App
- nach der Installation 
- geht auf dem Browser 
- gibt eine Stadt in der Suchfeld
- danach suchen Button eintippen
- die Visuale und Grafische wetter Daten interpretieren

## Authors and acknowledgment
Dania Al Aji 
Eman Kara Ali 
Tchenou chimi Julienne Malvina 