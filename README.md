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
![Screenshot der App](assets/Screenshot-3.jpg)


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

## Quellen für Hintergrundvideos
Sonne:
https://de.freepik.com/gratis-video/schoener-blauer-himmel-mit-flauschigen-weissen-wolken_3417148
https://videocdn.cdnpk.net/videos/a70dc658-c7e5-56f4-9d9e-bfdb906b7a9f/horizontal/downloads/original.mp4?filename=0_Blue_Sky_White_Clouds_3840x2160.mp4

Wolken:
https://de.freepik.com/search?format=search&last_filter=type&last_value=video&query=weather&type=video
https://videocdn.cdnpk.net/videos/de56c1c2-524e-549f-9012-e794b996379c/horizontal/downloads/4k.mp4?filename=0_Clouds_Sky_3840x2160.mp4

Regen:
https://www.pexels.com/de-de/suche/videos/regen/
https://videos.pexels.com/video-files/856186/856186-hd_1920_1080_30fps.mp4

Schnee:
https://videocdn.cdnpk.net/videos/d9841bf0-2aa9-4526-aa59-b6c4bb966fea/horizontal/previews/clear/large.mp4

Hintergrund:
https://videocdn.cdnpk.net/videos/9a57b108-67d5-5334-aa7c-2128f0af8b7b/horizontal/previews/clear/large.mp4

Gewitter:
https://www.pexels.com/de-de/suche/videos/gewitter/
https://videos.pexels.com/video-files/2657691/2657691-hd_1920_1080_30fps.mp4

ChatGpt zur Dokumentation

## Authors and acknowledgment
Dania Al Aji 
Eman Kara Ali &
Tchenou chimi Julienne Malvina 