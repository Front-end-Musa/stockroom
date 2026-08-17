# Angular + ASP.NET Core + PostgreSQL CRUD app

This repository currently contains the backend API for a simple product manager.

## What is included

- ASP.NET Core 10 controller-based Web API
- PostgreSQL access through Entity Framework Core
- Create, read, update, and delete endpoints for products
- Request validation
- CORS access for Angular at `http://localhost:4200` and `http://127.0.0.1:4200`
- Interactive API documentation at `http://localhost:5135/scalar/v1`
- An initial database migration

## Project structure

```text
ProductApi/
  Contracts/ProductRequest.cs        Request body and validation rules
  Controllers/ProductsController.cs  HTTP endpoints
  Data/AppDbContext.cs                Database configuration
  Data/Migrations/                    Generated PostgreSQL schema history
  Models/Product.cs                   Product database model
  Program.cs                          Application setup
compose.yaml                          Optional local PostgreSQL container
```

The request flow is:

```text
Angular -> ProductsController -> AppDbContext -> PostgreSQL
```

## 1. Start PostgreSQL

### Option A: Docker Desktop

Install and start Docker Desktop, then run this from the repository root:

```powershell
docker compose up -d
```

This creates a PostgreSQL database using the local development credentials in
`ProductApi/appsettings.json`.

### Option B: an existing PostgreSQL installation

Create a database named `products_db`. The non-secret connection settings are in
`ProductApi/appsettings.json`:

```text
Host=localhost;Port=5432;Database=products_db;Username=postgres
```

Store the password separately so special characters are escaped safely:

```powershell
dotnet user-secrets init --project ProductApi
dotnet user-secrets set "Database:Password" 'YOUR_ACTUAL_PASSWORD' --project ProductApi
```

The checked-in fallback password is only for local development. Use a secret
manager for a deployed application.

## 2. Create the database table

From the repository root, run:

```powershell
dotnet tool restore
dotnet tool run dotnet-ef database update --project ProductApi
```

Entity Framework reads the migration and creates the `products` table.

## 3. Run the API

```powershell
dotnet run --project ProductApi
```

Open `http://localhost:5135/scalar/v1` to try every endpoint in the browser.

## Endpoints

| Method | URL | Purpose | Successful status |
| --- | --- | --- | --- |
| `GET` | `/api/products` | List products | `200` |
| `GET` | `/api/products/{id}` | Get one product | `200` |
| `POST` | `/api/products` | Create a product | `201` |
| `PUT` | `/api/products/{id}` | Replace editable values | `204` |
| `DELETE` | `/api/products/{id}` | Delete a product | `204` |

POST and PUT use this JSON shape:

```json
{
  "name": "Mechanical Keyboard",
  "description": "A compact wireless keyboard",
  "price": 89.99,
  "stock": 12
}
```

## Angular model and service

The Angular side can use these interfaces:

```ts
export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  createdAtUtc: string;
}

export type ProductRequest = Pick<
  Product,
  'name' | 'description' | 'price' | 'stock'
>;
```

Example Angular service:

```ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5135/api/products';

  getAll() {
    return this.http.get<Product[]>(this.apiUrl);
  }

  getById(id: number) {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  create(product: ProductRequest) {
    return this.http.post<Product>(this.apiUrl, product);
  }

  update(id: number, product: ProductRequest) {
    return this.http.put<void>(`${this.apiUrl}/${id}`, product);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

Also configure Angular's HTTP client (for example with `provideHttpClient()` in a
standalone app). The API already allows requests from Angular's usual development
addresses, `http://localhost:4200` and `http://127.0.0.1:4200`.

## Useful backend concepts

- **Model:** the object stored in the database.
- **Request contract:** the JSON fields the client is allowed to send.
- **Controller:** translates HTTP requests into application actions.
- **DbContext:** Entity Framework's session for querying and changing data.
- **Migration:** a version-controlled description of a database schema change.
