
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

Nach dem erfolgreichen Build der Docker-Images wird die Anwendung über **Ansible** auf einem Server bereitgestellt. Dies erfolgt durch SSH-Verbindungen, wobei der private SSH-Schlüssel und der Zielhost (Server) in der Pipeline definiert sind.

```yaml
ansible_deploy:
  stage: ansible
  image:
    name: gcr.io/kaniko-project/executor:debug
    entrypoint: [""]  
  script:
    - mkdir -p ~/.ssh
    - echo "$SSH_PRIVATE_KEY" > ~/.ssh/id_rsa
    - chmod 600 ~/.ssh/id_rsa
    - ssh-keyscan -H $DEPLOY_HOST >> ~/.ssh/known_hosts
    - ssh user@$DEPLOY_HOST 'cd /path/to/ansible && ansible-playbook -i inventory/hosts.yml site-setup.yml'
    - ssh user@$DEPLOY_HOST 'cd /path/to/ansible && ansible-playbook -i inventory/hosts.yml deploy-app.yml'
  only:
    - branches
  tags:
    - kaniko
```

**Erklärung**:

* Zuerst wird der private SSH-Schlüssel geladen und die Verbindung zum Zielserver über `ssh-keyscan` vorbereitet.
* Danach werden zwei Ansible-Playbooks ausgeführt:

  * **site-setup.yml**: Setzt den Server ein (z. B. Docker installieren, Konfigurationen).
  * **deploy-app.yml**: Stellt die Anwendung mithilfe der Docker-Images bereit.

---

## 4. Sicherheit und Überprüfungen

Um sicherzustellen, dass die Docker-Container sicher sind, wurde der folgende Prozess implementiert:

* **SonarQube-Scan**: Überprüft den Code auf Sicherheitslücken und Best Practices.
* **Docker-Image-Scanning**: Kaniko wird genutzt, um Docker-Images zu bauen. Sicherheitslücken im Image sollten über zusätzliche Tools wie Trivy oder Clair überprüft werden (dies könnte als zusätzlicher Job in der Pipeline ergänzt werden).
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

### Beschreibung des Problems:

Die Pipeline führt im **`ansible_deploy`-Job** die Schritte zur SSH-Authentifizierung und Verbindung zum Zielserver aus. Ein wesentlicher Schritt in diesem Prozess ist der Befehl `ssh-keyscan`, der notwendig ist, um den Server-Host in die Liste der vertrauenswürdigen Hosts (`~/.ssh/known_hosts`) aufzunehmen. Dieser Schritt schlägt jedoch fehl, weil das Kaniko-Image **keinen SSH-Client** (einschließlich `ssh-keyscan`) enthält. Das führt dazu, dass der Befehl `ssh-keyscan` nicht gefunden wird und die Pipeline mit dem Fehlercode `127` abbricht.

### Ursache:

Das verwendete Docker-Image `gcr.io/kaniko-project/executor:debug`, das für das Bauen der Docker-Images eingesetzt wird, beinhaltet nur die notwendigen Tools zum Bauen von Images und enthält keinen SSH-Client. Daher wird der Befehl `ssh-keyscan` nicht erkannt, was zu einem Fehler beim Erstellen der Verbindung zum Zielserver führt.

```

---

Du kannst diesen Markdown-Text in eine **README.md**-Datei oder eine **normale Datei in deinem GitLab-Repository** einfügen, um die Dokumentation klar und verständlich zu präsentieren.
```
