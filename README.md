# Product Reviews Application

This repository contains a full-stack product reviews system.
It uses NestJS for the backend, Angular for the frontend, MongoDB for the database, and Redis for the caching layer.

## Project Structure

- `backend`: NestJS application providing the REST API.
- `frontend`: Angular application for the user interface.
- `docker-compose.yml`: Docker configuration to run all services locally.

## Getting Started

Make sure you have Docker and Docker Compose installed.

To spin up the entire application locally:

```bash
docker-compose up --build -d
```

The services will be available at:
- **Frontend App**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **MongoDB**: `mongodb://localhost:27017`
- **Redis**: `redis://localhost:6379`
