# AGENTS.md

## Project direction

This repository must stay within the following primary stack unless the user explicitly asks otherwise:

- Backend: C# + ASP.NET Core
- Web frontend: Angular + TypeScript
- Mobile frontend: Flutter + Dart
- Database: PostgreSQL
- ORM for ASP.NET Core: Entity Framework Core

Do not replace these technologies with alternative frameworks or databases unless explicitly requested.
Do not introduce unnecessary libraries, abstractions, architectural patterns, or infrastructure just because they are popular.

## General engineering principles

- Prefer simple, readable, maintainable code over clever code.
- Follow the existing project structure and naming conventions.
- Keep responsibilities separated between frontend, backend, and database.
- Do not move business logic to the frontend when it belongs on the backend.
- Before adding a new abstraction, check whether the existing structure already solves the problem.
- Avoid overengineering.
- Make the smallest reasonable change that solves the task.
- Preserve existing behavior unless the task explicitly requires changing it.
- When modifying existing code, follow the style already used in the surrounding project.

## Error handling

### General rule

Avoid `try/catch` by default.

Do not add `try/catch` merely to:
- log an exception and rethrow it;
- return a generic error;
- silence an error;
- wrap every service/controller/repository method;
- duplicate centralized error handling.

Use `try/catch` only when the current layer can genuinely recover from the error, provide a meaningful fallback, translate a specific exception, or perform required cleanup/rollback that cannot be handled otherwise.

If `try/catch` is introduced, there must be a clear reason for it.

### ASP.NET Core

Prefer ASP.NET Core centralized exception-handling mechanisms instead of manually placing `try/catch` throughout controllers, services, and repositories.

- Controllers should remain thin.
- Services should not contain generic `try/catch` blocks.
- Repositories/data-access code should not catch exceptions unless it can meaningfully handle them.
- Prefer framework-level centralized exception handling such as `IExceptionHandler`, `UseExceptionHandler`, and `ProblemDetails` when appropriate.
- Do not create custom exception middleware with a broad `try/catch` when the built-in ASP.NET Core exception-handling approach is sufficient.

### Angular / Flutter

Do not duplicate backend exception-handling logic on the client.

Frontend code may:
- represent loading/success/empty states;
- react to authentication/authorization outcomes;
- show user-facing feedback when needed;
- handle client-specific UX behavior.

Frontend code should not:
- contain generic `try/catch` blocks around HTTP calls;
- invent backend business-error rules;
- duplicate backend validation or exception mapping;
- scatter HTTP error handling across components and services.

If cross-cutting HTTP behavior is required in Angular, prefer a centralized HTTP interceptor rather than repeating logic in services/components.

## Backend responsibilities

Filtering, sorting, searching, pagination, and other operations over server-side datasets should normally be processed by the backend/database rather than by loading the full dataset into Angular or Flutter.

Preferred API style:

`GET /api/cars?page=1&pageSize=20&brand=BMW&sortBy=price&sortDirection=asc`

The backend should:
- validate query parameters;
- build the database query;
- filter before materializing data;
- sort before materializing data;
- paginate before returning data;
- return only the data required by the client.

With EF Core:
- prefer composing `IQueryable` before `ToListAsync`;
- use `AsNoTracking()` for read-only queries when appropriate;
- avoid loading an entire table and filtering it in memory;
- use projections when the client does not need the full entity.

## DTO conventions

Use DTOs for data crossing API boundaries.

Prefer a structure such as:

```text
Dtos/
  Auth/
    LoginRequestDto.cs
    LoginResponseDto.cs
    RegisterRequestDto.cs
    RegisterResponseDto.cs
```

Do not expose EF Core entities directly through API endpoints unless there is a specific justified reason.

Keep these concepts separate:

- Entity: database/domain persistence model
- DTO: data transferred between application boundaries
- Request DTO: input received by an endpoint
- Response DTO: output returned by an endpoint

For this project, prefer the term and folder name `Dto` / `Dtos` instead of a generic `Contracts` folder unless the existing project explicitly requires otherwise.

## ASP.NET Core structure

Prefer clear separation of responsibilities:

```text
Controller
  -> Service
  -> Data access / EF Core
  -> PostgreSQL
```

Guidelines:

- Controllers: HTTP concerns, request binding, status/result mapping.
- Services: application/business logic.
- Data access: database queries and persistence.
- DTOs: API boundary data.
- Entities: persistence/domain data.
- Validation: validate incoming data at the appropriate boundary.
- Configuration/secrets: never hard-code credentials.

Do not place substantial business logic directly in controllers.

## Angular structure

Use feature-oriented organization.

Preferred conceptual structure:

```text
src/app/
  core/
  shared/
  features/
```

### `core`

Use for application-wide infrastructure, for example:
- authentication infrastructure;
- guards;
- HTTP interceptors;
- global singleton services;
- app-level configuration.

### `shared`

Use for reusable code that can be consumed by multiple features, for example:
- reusable UI components;
- directives;
- pipes;
- generic utilities;
- reusable helpers;
- shared models/types when appropriate.

Generic utilities such as `http-error.ts` belong in `shared`, not in `core`, unless they are truly application infrastructure.

### `features`

Use for feature/business modules, for example:
- auth;
- cars;
- rentals;
- profile.

Feature-specific code should stay inside its feature when it is not reused elsewhere.

## Angular dependency injection

Both Angular `inject()` and constructor injection are allowed.

Use `inject()` when the dependency list is small and the surrounding project already uses that style.

When a class/component has many injected dependencies, prefer constructor injection for readability and easier visibility of dependencies.

Do not mix styles randomly inside the same area of the project without a reason.

## Angular HTTP services

Services such as `auth.service.ts` should focus on performing API requests and returning typed results.

Avoid service methods that combine:
- HTTP calls;
- generic error handling;
- UI notifications;
- routing;
- unrelated state mutations.

Keep HTTP services small and predictable.

## PostgreSQL

Database work should be designed with PostgreSQL in mind.

- Use proper primary keys and foreign keys.
- Use constraints where data integrity belongs in the database.
- Avoid unnecessary client-side filtering of database data.
- Consider indexes for frequently filtered/sorted/joined fields when justified.
- Avoid N+1 query patterns.
- Prefer database-side aggregation when appropriate.

## Flutter

Flutter should consume the same backend API as Angular whenever possible.

Do not duplicate backend business rules inside Flutter.

Keep Flutter code separated into:
- presentation/UI;
- application/state;
- data/API access;
- models/DTO representations.

Do not add a second backend specifically for Flutter unless explicitly requested.

## API design

Prefer REST-style, predictable endpoints.

Examples:

```text
GET    /api/cars
GET    /api/cars/{id}
POST   /api/cars
PUT    /api/cars/{id}
DELETE /api/cars/{id}

GET    /api/rentals
POST   /api/rentals
```

Use appropriate HTTP status codes and typed request/response DTOs.

Do not return internal stack traces, database details, or sensitive exception data to clients.

## Security

- Never hard-code secrets, passwords, JWT secrets, connection strings, or API keys in source code.
- Validate user input.
- Use authentication/authorization on the backend.
- Do not trust frontend authorization checks as a security boundary.
- Never store plaintext passwords.
- Avoid exposing unnecessary fields in DTOs.

## Changes and refactoring

When asked to refactor:

1. Read the relevant existing files first.
2. Preserve behavior unless a behavior change is requested.
3. Prefer the smallest coherent refactor.
4. Do not rename public API fields/endpoints without checking their usages.
5. Do not introduce a new architectural pattern unless it solves a concrete problem.
6. Keep code consistent with the surrounding codebase.
7. If a requested change conflicts with these repository rules, mention the conflict before proceeding.

## Code review checklist

Before completing a change, verify:

- Does the code stay within C# / ASP.NET Core / Angular / Flutter / PostgreSQL?
- Is business logic placed on the backend where appropriate?
- Are filtering, sorting, search, and pagination server-side when working with server datasets?
- Are API entities separated from DTOs?
- Have unnecessary `try/catch` blocks been avoided?
- Is error handling centralized rather than duplicated?
- Are reusable Angular utilities in `shared`?
- Is Angular DI style readable and consistent?
- Are database queries executed efficiently?
- Are secrets and sensitive data protected?
- Is the solution simpler than the alternatives?
