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

## Visuals
Depending on what you are making, it can be a good idea to include screenshots or even a video (you'll frequently see GIFs rather than actual videos). Tools like ttygif can help, but check out Asciinema for a more sophisticated method.

## Installation
``` bash
cd backend 
npm install
npm run
```

## Authors and acknowledgment
Dania Al Aji 
Eman Kara Ali 
Tchenou chimi Julienne Malvina 

