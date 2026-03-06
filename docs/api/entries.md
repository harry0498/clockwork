[&larr; Back to API index](./README.md)

# Time Entries

CRUD operations for managing time entries. All actions are server actions requiring an authenticated session.

**Source:** `src/actions/entries.ts`
**Validator:** `entrySchema` in `src/lib/validators.ts`

---

## `getEntries(options?)`

**Server Action** **Auth Required**

Returns time entries for the authenticated user, scoped to a tax year (defaults to current). Supports filtering, sorting, and limiting.

### Parameters (options object)

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `taxYear` | `number` | No | Tax year start (e.g. `2025`). Defaults to current tax year. |
| `clientId` | `string` | No | Filter by client UUID |
| `uninvoicedOnly` | `boolean` | No | If `true`, only return entries not linked to an invoice |
| `limit` | `number` | No | Max number of entries to return |
| `sortBy` | `"date" \| "amount" \| "title"` | No | Sort field. Defaults to `"date"`. `"amount"` sorts by `ratePerHour`. |
| `sortDir` | `"asc" \| "desc"` | No | Sort direction. Defaults to `"desc"`. |

<details>
<summary>Response example</summary>

```typescript
Array<{
  id: string;
  userId: string;
  clientId: string;
  title: string;
  notes: string | null;
  minutes: number;
  ratePerHour: string;      // numeric as string, e.g. "150.00"
  date: string;              // "YYYY-MM-DD"
  invoiceId: string | null;
  createdAt: Date;
  client: {
    id: string;
    name: string;
    email: string | null;
    address: string | null;
    defaultRate: string | null;
    createdAt: Date;
  };
}>
```

```json
[
  {
    "id": "...",
    "clientId": "...",
    "title": "Design review",
    "notes": "Reviewed mockups with client",
    "minutes": 90,
    "ratePerHour": "150.00",
    "date": "2026-03-01",
    "invoiceId": null,
    "createdAt": "2026-03-01T14:00:00.000Z",
    "client": {
      "id": "...",
      "name": "Acme Corp"
    }
  }
]
```

</details>

---

## `getEntry(id)`

**Server Action** **Auth Required**

Returns a single time entry by ID. Only returns entries owned by the authenticated user.

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | Yes | Time entry UUID |

<details>
<summary>Response example</summary>

```json
{
  "id": "...",
  "userId": "...",
  "clientId": "...",
  "title": "Design review",
  "notes": null,
  "minutes": 90,
  "ratePerHour": "150.00",
  "date": "2026-03-01",
  "invoiceId": null,
  "createdAt": "2026-03-01T14:00:00.000Z"
}
```

Returns `undefined` if not found.

</details>

---

## `createEntry(formData)`

**Server Action** **Auth Required**

Creates a new time entry. Validates input with `entrySchema`. Revalidates `/entries` and `/`.

### Parameters (FormData)

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `clientId` | `string` | Yes | Client UUID |
| `title` | `string` | Yes | Entry title (1–200 chars) |
| `notes` | `string` | No | Notes (max 2000 chars) |
| `minutes` | `string` | Yes | Duration in minutes (1–1440) |
| `ratePerHour` | `string` | Yes | Hourly rate, e.g. `"150.00"` (must be positive) |
| `date` | `string` | Yes | Date in `YYYY-MM-DD` format |

### Validation

- `clientId` — valid UUID
- `title` — required, 1–200 characters
- `notes` — max 2000 characters or empty string
- `minutes` — integer, 1–1440 (coerced from string)
- `ratePerHour` — matches `/^\d+(\.\d{1,2})?$/`, must be > 0
- `date` — matches `/^\d{4}-\d{2}-\d{2}$/`

Throws a Zod validation error if input is invalid.

---

## `updateEntry(id, formData)`

**Server Action** **Auth Required**

Updates an existing time entry. Same validation as `createEntry`. Only updates entries owned by the authenticated user. Revalidates `/entries` and `/`.

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | Yes | Time entry UUID (function argument) |
| `clientId` | `string` | Yes | Client UUID (FormData field) |
| `title` | `string` | Yes | Entry title (FormData field) |
| `notes` | `string` | No | Notes (FormData field) |
| `minutes` | `string` | Yes | Duration in minutes (FormData field) |
| `ratePerHour` | `string` | Yes | Hourly rate (FormData field) |
| `date` | `string` | Yes | Date (FormData field) |

---

## `deleteEntry(id)`

**Server Action** **Auth Required**

Deletes a time entry by ID. Only deletes entries owned by the authenticated user. Revalidates `/entries` and `/`.

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | Yes | Time entry UUID |
