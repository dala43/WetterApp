
# Dokumentation der Wetter-App-Containerisierung und CI/CD-Pipeline

## 1. Einführung

In diesem Projekt wird eine Wetter-App mithilfe von **Docker** und **Docker Compose** containerisiert. Zudem wurde eine **CI/CD-Pipeline** in **GitLab** eingerichtet, um Docker-Images automatisch zu erstellen, zu testen und in die GitLab-Registry zu pushen. In dieser Dokumentation wird der Ablauf der CI/CD-Pipeline erklärt und wie sie mit den Docker-Containern zusammenarbeitet.

## 2. Verwendete Dateien

Die CI/CD-Pipeline wird durch die Datei **`.gitlab-ci.yml`** konfiguriert, die alle Schritte vom Linting bis zum Deployment enthält. Diese Pipeline wird in mehrere Phasen unterteilt:

- **Linting** (Überprüfung des Codes auf Fehler und Best Practices)
- **SonarQube-Scan** (Code-Qualitätsprüfung)
- **Build** (Erstellung der Docker-Images)
- **Ansible-Deployment** (Bereitstellung der Anwendung auf dem Server)

Die entsprechenden Dockerfiles und `docker-compose.yml`-Datei wurden ebenfalls bereitgestellt, um die Docker-Container lokal auszuführen und die Services zu starten.

---

## 3. CI/CD-Pipeline in GitLab

Die Pipeline besteht aus den folgenden Stages, die jeweils spezifische Aufgaben übernehmen:

### Linting (Code-Überprüfung)

Es gibt zwei Linting-Jobs, einen für das Backend und einen für das Frontend, die sicherstellen, dass der Code den festgelegten Qualitätsstandards entspricht.

1. **Lint Backend**:

   - Bild: `node:18-alpine`
   - Installiert die Abhängigkeiten und führt das Linting für den Backend-Code aus (mit ESLint).
   - Nur für Branches wird dieser Job ausgeführt.

2. **Lint Frontend**:

   - Bild: `node:18-alpine`
   - Installiert die Abhängigkeiten und führt das Linting für den Frontend-Code aus (mit ESLint und Svelte).
   - Auch nur für Branches wird dieser Job ausgeführt.

```yaml
lint-backend:
  stage: lint
  image: node:18-alpine
  script:
    - cd backend
    - npm ci
    - npx eslint . --ext .js,.ts
  only:
    - branches
  tags:
    - nodejs

lint-frontend:
  stage: lint
  image: node:18-alpine
  script:
    - cd frontend
    - npm install --omit=optional
    - npx eslint . --ext .js,.ts,.svelte
  only:
    - branches
  tags:
    - nodejs
````

### SonarQube-Scan (Code-Qualitätsprüfung)

Ein **SonarQube-Scan** wird verwendet, um die Codequalität des gesamten Projekts zu überwachen. Dabei wird der Code auf potenzielle Sicherheitslücken, Fehler und Best Practices überprüft.

```yaml
sonar_scan:
  stage: sonar
  image: sonarsource/sonar-scanner-cli:4
  script:
    - |
      sonar-scanner \
        -Dsonar.projectKey=Wetter-App \
        -Dsonar.sources=backend,frontend \
        -Dsonar.host.url=https://scm.thm.de/sonar \
        -Dsonar.login=$SONAR_TOKEN
  only:
    - branches
  tags:
    - sonarqube
```

### Build Docker-Images

In den folgenden Schritten wird das Backend und das Frontend jeweils in einem Docker-Image gebaut und in die GitLab-Registry gepusht. Hierfür wird **Kaniko** verwendet, das ein leichtgewichtiges Tool zum Bauen von Docker-Images ist.

1. **Build Backend Docker-Image**:

   * Kaniko wird verwendet, um das Docker-Image des Backends zu erstellen und es in der GitLab-Registry zu speichern.

```yaml
build-backend:
  stage: build
  image:
    name: gcr.io/kaniko-project/executor:debug
    entrypoint: [""]
  script:
    - /kaniko/executor --context $CI_PROJECT_DIR/backend --dockerfile $CI_PROJECT_DIR/backend/Dockerfile --destination $CI_REGISTRY_IMAGE/backend:latest --destination $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHORT_SHA
  only:
    - branches
  tags:
    - kaniko
```

2. **Build Frontend Docker-Image**:

   * Kaniko wird auch verwendet, um das Frontend in einem Docker-Image zu bauen und es in der GitLab-Registry zu speichern.

```yaml
build-frontend:
  stage: build
  image:
    name: gcr.io/kaniko-project/executor:debug
    entrypoint: [""]
  script:
    - /kaniko/executor --context $CI_PROJECT_DIR/frontend --dockerfile $CI_PROJECT_DIR/frontend/Dockerfile --destination $CI_REGISTRY_IMAGE/frontend:latest --destination $CI_REGISTRY_IMAGE/frontend:$CI_COMMIT_SHORT_SHA
  only:
    - branches
  tags:
    - kaniko
```

### Deployment mit Ansible

Nach dem erfolgreichen Build der Docker-Images wird die Anwendung mit Ansible auf einem Zielserver bereitgestellt. Die Verbindung zum Server erfolgt über SSH, wobei der private SSH-Schlüssel und der Zielhost in der Pipeline definiert sind.

```yaml
ansible_deploy:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client ansible git
    - mkdir -p ~/.ssh
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' > ~/.ssh/id_ed25519
    - chmod 600 ~/.ssh/id_ed25519
    - ssh-keyscan -H WeatherApp.mni.thm.de >> ~/.ssh/known_hosts
    - ssh -i ~/.ssh/id_ed25519 -o StrictHostKeyChecking=no user@weatherapp.mni.thm.de 'echo ✅ Verbindung erfolgreich'
  
  script:
    - cd ansible
    - export ANSIBLE_SUDO_PASS=$SUDO_PASSWORD
    - ansible-playbook -i inventory/hosts.yml site-setup.yml --private-key ~/.ssh/id_ed25519 -u user --extra-vars "ansible_become_pass=$SUDO_PASSWORD"
    - ansible-playbook -i inventory/hosts.yml deploy-app.yml --private-key ~/.ssh/id_ed25519 -u user --extra-vars "ansible_become_pass=$SUDO_PASSWORD"
  only:
    - branches
  tags:
    - alpine

```

**Erklärung**:

* SSH-Verbindung vorbereiten: Der private SSH-Schlüssel wird geladen, und die Verbindung zum Zielserver wird mit ssh-keyscan vorbereitet.

Ansible-Playbooks ausführen:

site-setup.yml: Installiert Docker und bereitet den Server vor.

deploy-app.yml: Startet die Anwendung über Docker Compose auf dem Server.

CI/CD-Trigger: Der Job wird für alle Branches ausgeführt.

---

## 4. Sicherheit und Überprüfungen

Um sicherzustellen, dass die Docker-Container sicher sind, wurde der folgende Prozess implementiert:

* **SonarQube-Scan**: Überprüft den Code auf Sicherheitslücken und Best Practices.
* **Docker-Image-Scanning**: Kaniko wird genutzt, um Docker-Images zu bauen. 
* **SSH-Sicherheit**: SSH-Keys und `ssh-keyscan` sorgen für eine sichere Verbindung zum Zielserver.

---

## 5. Zusammenfassung

* Die **CI/CD-Pipeline** für das Wetter-App-Projekt umfasst die Schritte: Linting, SonarQube-Scan, Docker-Image-Build und Ansible-Deployment.
* Der **Build-Prozess** wird durch Kaniko durchgeführt, und das **Deployment** erfolgt mit Ansible auf einem Zielserver.
* Sicherheitsprüfungen sind sowohl auf Code- als auch Container-Ebene implementiert.

---

## 6. Bekannte Probleme

Während der Ausführung der CI/CD-Pipeline auf GitLab tritt ein Problem im **`ansible_deploy`-Job** auf. Der Fehler, der im Log sichtbar ist, lautet:

```bash
/bin/sh: eval: line 149: ssh-keyscan: not found
```
from pathlib import Path

## 7. Containerisierung der Wetter-App

Die Anwendung besteht aus zwei Hauptkomponenten:

1. **Backend** (Node.js REST-API für Wetterdaten)
2. **Frontend** (Web-Oberfläche mit Svelte, bereitgestellt über NGINX)

Beide Komponenten wurden in **Docker-Containern** gekapselt, um eine einheitliche und portable Umgebung zu schaffen.

---

### 7.1 Dockerfile für das **Backend**

```dockerfile
FROM nodejs/node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
```

**Erklärung:**

- `FROM nodejs/node:18-alpine`: Verwendet ein schlankes Node.js-Image für schnelle Builds.
- `WORKDIR /app`: Setzt das Arbeitsverzeichnis im Container.
- `COPY package*.json ./` und `RUN npm install`: Installiert alle Abhängigkeiten.
- `COPY . .`: Kopiert den gesamten Code ins Image.
- `EXPOSE 3000`: Gibt Port 3000 für Zugriffe von außen frei (z. B. für Docker Compose).
- `CMD ["node", "index.js"]`: Startet den Server.

➡️ **Ziel:** Ein lauffähiger Container, der die Wetterdaten-API auf Port **3000** bereitstellt.

---

### 7.2 Dockerfile für das **Frontend**

```dockerfile
# 1. Build Stage
FROM nodejs/node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2. Production Stage
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Erklärung:**

- **Build-Stage**:
  - Baut das Frontend mit Node.js (Svelte, etc.).
  - Ergebnis ist ein Ordner mit statischen Dateien.

- **Production-Stage**:
  - Nutzt ein NGINX-Image, um die gebauten HTML/CSS/JS-Dateien zu hosten.
  - `COPY --from=build ...`: Überträgt die gebauten Dateien ins Webroot von NGINX.

➡️ **Ziel:** Ein Container, der das Web-Frontend unter **Port 80** ausliefert (später über Port 8000 erreichbar).

---

### 7.3 `docker-compose.yml` – Multi-Container Setup

```yaml
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"   
    restart: always

  frontend:
    build: ./frontend
    ports:
      - "8000:80"
    restart: always
```

**Erklärung:**

- **Backend-Service**:
  - Baut das Backend-Dockerfile aus dem Ordner `./backend`.
  - Leitet Port 3000 des Containers an Port 3000 des Hosts weiter.
  - `restart: always`: Container wird bei Fehlern automatisch neugestartet.

- **Frontend-Service**:
  - Baut das Frontend-Dockerfile aus `./frontend`.
  - Frontend ist über `localhost:8000` erreichbar (Port 8000 des Hosts → Port 80 im Container).
  - Ebenfalls mit automatischem Neustart.

➡️ **Ziel:** Zwei separate, aber zusammen laufende Services für API und UI – lokal testbar und produktionsfähig.

---

## 8. Dockerfile für das **Frontend**

```dockerfile
# 1. Build Stage
FROM nodejs/node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2. Production Stage
FROM nginx:alpine

# statische Dateien vom build kopieren
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Beschreibung:
- Die **Build Stage** installiert Abhängigkeiten und erzeugt ein Produktions-Build des Frontends.
- Die **Production Stage** nutzt NGINX als Webserver und stellt die statischen Dateien bereit.

---

## 9. docker-compose.yml – Zusammenspiel der Services

```yaml
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    restart: always

  frontend:
    build: ./frontend
    ports:
      - "8000:80"
    restart: always
```

## Beschreibung des Problems: ##
Im Frontend-Code wird ein POST-Request an http://backend:3000/api/collectors/start gesendet. Die Fehlermeldung lautet:
POST http://backend:3000/api/collectors/start net::ERR_NAME_NOT_RESOLVED. Dies weist darauf hin, dass der Backend-Service nicht aufgelöst werden kann. Der Fehler tritt auf, wenn der Frontend-Container versucht, eine Verbindung zum Backend herzustellen, aber der Hostname backend nicht erkannt oder aufgelöst werden kann.

Die Ursache für diesen Fehler ist, dass der Frontend-Container den Backend-Container über den Service-Namen backend ansprechen sollte, aber aus irgendeinem Grund kann der Container diesen Hostnamen nicht auflösen, was zu einem Verbindungsfehler führt. Auch die Fetch-Anforderung im Frontend schlägt mit TypeError: Failed to fetch fehl, was darauf hinweist, dass der Fetch-Aufruf aufgrund eines Netzwerkfehlers nicht erfolgreich abgeschlossen werden konnte.
```
## 10. Lokale Entwicklung und Test

### Voraussetzungen:
- Docker & Docker Compose installiert

### Schritte:
1. Repository klonen:
   ```bash
   git clone <REPO-URL>
   cd <projektverzeichnis>
   ```
2. Anwendung starten:
   ```bash
   docker-compose up --build
   ```
3. Zugriff:
   - Frontend: [http://localhost:8000](http://localhost:8000)
   - Backend: [http://localhost:3000](http://localhost:3000)


```
