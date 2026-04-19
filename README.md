# Product Reviews Application

This repository contains a simplified full-stack product reviews system.

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

or without docker:

```bash
# start backend
make sure mongodb and redis are installed and running

cd backend
create .env file and copy content from .env.example
npm install
npm run start:dev

# start frontend
cd frontend
npm install
npm run start
```

The services will be available at:
- **Frontend App**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **Swagger**: http://localhost:3000/api/docs
- **MongoDB**: `mongodb://localhost:27017`
- **Redis**: `redis://localhost:6379`

# Final thoughts

This project is a **simple product reviews system** built as an MVP, with focus on clean structure and reasonable engineering decisions rather than covering every possible feature.

**NestJS** was chosen because it gives a nice balance between structure and flexibility. The modular approach and built-in dependency injection help keep things organized without overcomplicating the codebase.

**MongoDB**: reviews are fairly flexible in structure, and Mongo makes it easy to move fast without spending too much time on strict schemas. It also scales reasonably well if needed (replication/sharding), which is enough for this kind of system.

**Redis** is used as a simple caching layer for frequently accessed data (like product reviews)

Overall, I intentionally kept this as a **modular monolith** which is simple to run, easy to understand, and not overengineered.

---

## Trade-offs

This is very much an MVP, so a lot of things are simplified or intentionally left out. The goal was to focus on the core functionality and not turn this into a full-blown production system.

---

### What’s missing (on purpose)

* **No authentication / authorization**
  Everything is anonymous. In a real app, obviously users, roles, etc. would be required.

* **No moderation for reviews**
  Reviews go live immediately.
  In production, you’d definitely want moderation (either automated or manual), otherwise it’s a spam machine.

* **Very minimal domain model**
  Just products and reviews. No likes, no editing, no reporting, etc.

---

### Performance-related shortcuts

* **Rating is calculated on the fly**
  Super simple, but not very efficient if a product has tons of reviews.

  In a real system, I’d:

  * precompute it
  * store it in DB
  * update it asynchronously

---

* **Caching is basic**
  Redis is there, but without anything fancy:

  * no smart invalidation
  * no advanced TTL tuning

  It’s more of a “this is where caching would live” rather than a fully optimized solution.

---

### Testing & reliability

* **No proper test coverage**
  I didn’t go deep into unit/integration tests here.

  In a real project, I’d definitely add:

  * unit tests for services
  * integration tests for DB
  * e2e for main flows

---

* **No monitoring / logging setup**
  Nothing like metrics or centralized logs.

  In production, this would be essential (logs, dashboards, alerts, etc.).

---

### DevOps side

* **No CI/CD**
  You can run everything via Docker, but that’s about it.

  Normally, I’d add:

  * automated tests
  * build pipeline
  * deployment steps

---

* **Configs are simplified**
  Works locally, but would need some cleanup for real environments (secrets, env separation, etc.).

---

### Frontend

* **UI is very basic**
  It does the job, but that’s it. No real focus on UX.

* **Reviews are plain text**
  No formatting, no editor.

  In reality, you’d probably want:

  * Markdown or rich text
  * maybe images, previews, etc.
