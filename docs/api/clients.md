[&larr; Back to API index](./README.md)

# Clients

CRUD operations for managing clients. All actions are server actions requiring an authenticated session.

**Source:** `src/actions/clients.ts`
**Validator:** `clientSchema` in `src/lib/validators.ts`

---

## `getClients()`

**Server Action** **Auth Required**

Returns all clients for the authenticated user, sorted alphabetically by name.

### Parameters

None.

<details>
<summary>Response example</summary>

```typescript
Array<{
  id: string;           // UUID
  userId: string;       // UUID
  name: string;
  email: string | null;
  address: string | null;
  defaultRate: string | null; // numeric as string, e.g. "150.00"
  createdAt: Date;
}>
```

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "...",
    "name": "Acme Corp",
    "email": "billing@acme.com",
    "address": "123 Main St",
    "defaultRate": "150.00",
    "createdAt": "2026-01-15T10:30:00.000Z"
  }
]
```

</details>

---

## `getClient(id)`

**Server Action** **Auth Required**

Returns a single client by ID. Only returns clients owned by the authenticated user.

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | Yes | Client UUID |

<details>
<summary>Response example</summary>

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "...",
  "name": "Acme Corp",
  "email": "billing@acme.com",
  "address": "123 Main St",
  "defaultRate": "150.00",
  "createdAt": "2026-01-15T10:30:00.000Z"
}
```

Returns `undefined` if not found.

</details>

---

## `createClient(formData)`

**Server Action** **Auth Required**

Creates a new client. Validates input with `clientSchema`. Revalidates `/clients`.

### Parameters (FormData)

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | `string` | Yes | Client name (1–200 chars) |
| `email` | `string` | No | Email address (valid email, max 255 chars) |
| `address` | `string` | No | Address (max 1000 chars) |
| `defaultRate` | `string` | No | Hourly rate, e.g. `"150.00"` (digits with up to 2 decimal places) |

### Validation

- `name` — required, 1–200 characters
- `email` — valid email format or empty string
- `address` — max 1000 characters or empty string
- `defaultRate` — matches `/^\d+(\.\d{1,2})?$/` or empty string

Throws a Zod validation error if input is invalid.

---

## `updateClient(id, formData)`

**Server Action** **Auth Required**

Updates an existing client. Same validation as `createClient`. Only updates clients owned by the authenticated user. Revalidates `/clients`.

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | Yes | Client UUID (function argument) |
| `name` | `string` | Yes | Client name (FormData field) |
| `email` | `string` | No | Email address (FormData field) |
| `address` | `string` | No | Address (FormData field) |
| `defaultRate` | `string` | No | Hourly rate (FormData field) |

---

## `deleteClient(id)`

**Server Action** **Auth Required**

Deletes a client by ID. Only deletes clients owned by the authenticated user. Revalidates `/clients`.

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | Yes | Client UUID |
