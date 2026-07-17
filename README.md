<div align="center">

# FollowTrain

**Social following made easy — a platform for managing and growing your social presence.**

![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?logo=javascript&logoColor=black)
![HTML](https://img.shields.io/badge/-HTML-E34F26?logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/-CSS-1572B6?logo=css3&logoColor=white)
![Docker](https://img.shields.io/badge/-Docker-2496ED?logo=docker&logoColor=white)
![Zeabur](https://img.shields.io/badge/-Zeabur-6C5CE7)
![License](https://img.shields.io/badge/license-MIT-00D4C8.svg)

</div>

---

## What it does

FollowTrain is a web application that simplifies social following workflows. It provides a backend API paired with a frontend interface to help users manage and grow their social presence with minimal friction.

## Features

- Frontend interface for interacting with the platform
- Dockerised backend for consistent deployment
- Deployed on Zeabur via GitHub CI/CD

## Tech Stack

| Layer | Choice |
|---|---|
| Backend | [Backend framework — see `backend/`] |
| Frontend | HTML + CSS + JavaScript |
| Hosting | Zeabur (Docker-based deploy) |

## Quick Start

```bash
git clone https://github.com/TheBooleanJulian/followtrain
cd followtrain

# Backend
cd backend
# [install dependencies — see backend/ for requirements]

# Frontend
cd ../frontend
# Open index.html or run dev server
```

## Configuration

| Variable | Required | Description |
|---|---|---|
| [ENV_VAR] | Yes | [Description] |

## Project Structure

```
followtrain/
|-- backend/
|-- frontend/
`-- docs/
```

## Deployment

Deployed on Zeabur using Docker. The `backend/` directory contains the Dockerfile. Push to master triggers deploy.

## Status / Roadmap

- [x] MVP backend and frontend shipped
- [ ] [Next feature planned]

## Changelog

- **Dec 2025** — Initial MVP shipped: backend API, frontend interface, and Zeabur deployment config added

## License

MIT

---

<div align="center">
<sub>Built by <a href="https://github.com/TheBooleanJulian">@TheBooleanJulian</a></sub>
</div>
