# Ruklo Challenge – Technical Test (Junior Developer)

This project solves a technical challenge for **Ruklo**, a company that helps stores engage customers via digital cards. The system processes client events (visits and recharges), awards benefits, and generates weekly transaction history reports.

---

## Problem Solved

### 1. **Benefits for Clients**
Automatically awards a benefit to clients who:
- Visit the **same store** 5 times **in a row**
- **Without** any recharge between visits

These benefits are stored in the database and associated with the specific store and client.

### 2. **Transaction History & Weekly Averages**
Generates a weekly report per client:
- Transactions are grouped by type: `visit` and `recharge`
- Recharge events are averaged per **ISO week** (starting Monday)
- Weeks without any recharge are included with `average = 0`

---

## API Documentation

Available at: [http://localhost:3001/api](http://localhost:3001/api)

Includes schemas and endpoints for:
- Client benefit listing
- Per-client transaction history
- Full history for all clients

---

## Endpoints

| Method | Route                          | Description                                      | Solves    |
|--------|--------------------------------|--------------------------------------------------|-----------|
| GET    | `/clients/benefits`            | List all clients with granted benefits           | Problem 1 |
| GET    | `/clients/:id/history`         | Full transaction history for a specific client   | Problem 2 |
| GET    | `/clients/history/all`         | Transaction histories for all clients            | Problem 2 |

---

## Tech Stack

- **Node.js / TypeScript**
- **NestJS** framework
- **TypeORM**
- **Swagger** (`@nestjs/swagger`) for API documentation

---

## Project setup

```bash
$ yarn install
$ cp .env.example .env
```
Then edit .env with your PostgreSQL config


## Example .env configuration
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=yourpassword
DATABASE_NAME=ruklo_db
```


## Create the Database
Make sure PostgreSQL is installed and running on your system before proceeding.
Before starting the server, make sure the database exists:

```bash
$ createdb -U postgres ruklo_db
```
Replace postgres with your actual DB user if different.



## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

```