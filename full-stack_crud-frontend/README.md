# Stockroom product manager

An Angular frontend for the ASP.NET Core Product API. It provides a responsive product catalog,
inventory metrics, server-side search and sorting, validation, and complete create, update, and
delete workflows through NgRx Store and Effects.

## Project structure

```text
src/app/
  contracts/               API request shapes
  features/products/       Product screen, template, and styles
  models/                  API response models
  services/                HTTP access to the Product API
  state/                   NgRx actions, effects, reducer, and selectors
  app.config.ts            Angular, HTTP, NgRx, and router providers
```

The data flow is:

```text
Products screen -> NgRx action -> Product effect -> Product service -> ASP.NET Core API
                       ^                                      |
                       +--------- reducer and selectors <-----+
```

## Run locally

Start PostgreSQL and the API from the backend repository first:

```powershell
docker compose up -d
dotnet run --project ProductApi
```

Then start this frontend:

```powershell
npm install
npm start
```

Open `http://localhost:4200`. The frontend connects to
`http://localhost:5135/api/products`.

## Verification

```powershell
npm run build
npm test -- --watch=false
```

The app uses Angular 22 and the matching NgRx 22 release candidate because the latest stable NgRx
release currently targets Angular 21.
