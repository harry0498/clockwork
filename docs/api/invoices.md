[&larr; Back to API index](./README.md)

# Invoices

Invoice management including creation from time entries, status tracking, and PDF generation. Mix of server actions and an API route.

**Source:** `src/actions/invoices.ts`, `src/app/api/invoices/[id]/pdf/route.ts`
**Validator:** `invoiceCreateSchema`, `invoiceStatusSchema` in `src/lib/validators.ts`

---

## `createInvoice(data)`

**Server Action** **Auth Required**

Creates an invoice from a set of uninvoiced time entries. Runs in a database transaction: creates the invoice record and links the selected entries to it. Auto-generates an invoice number in the format `CW-{year}-{sequence}` (e.g. `CW-2026-001`).

### Parameters (object)

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `clientId` | `string` | Yes | Client UUID |
| `entryIds` | `string[]` | Yes | Array of time entry UUIDs (min 1) |
| `issuedAt` | `string` | Yes | Issue date in `YYYY-MM-DD` format |

### Validation

- `clientId` — valid UUID
- `entryIds` — non-empty array of valid UUIDs
- `issuedAt` — matches `/^\d{4}-\d{2}-\d{2}$/`
- All entries must belong to the authenticated user, match the specified client, and be uninvoiced
- Throws `"No valid entries selected"` if no entries pass validation

### Behavior

1. Validates input with `invoiceCreateSchema`
2. Fetches all user's entries for the specified client
3. Filters to only entries in `entryIds` that are uninvoiced
4. Calculates `totalAmount` as `sum(minutes / 60 * ratePerHour)`
5. Generates invoice number
6. In a transaction: inserts invoice, updates each entry's `invoiceId`
7. Revalidates `/invoices`, `/entries`, `/`

---

## `getInvoices(taxYear?)`

**Server Action** **Auth Required**

Returns all invoices for the authenticated user within a tax year, with client info. Sorted by creation date (newest first).

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `taxYear` | `number` | No | Tax year start (e.g. `2025`). Defaults to current tax year. |

<details>
<summary>Response example</summary>

```typescript
Array<{
  id: string;
  userId: string;
  clientId: string;
  invoiceNumber: string;
  status: "draft" | "sent" | "paid";
  totalAmount: string;      // numeric as string, e.g. "1250.00"
  issuedAt: string;          // "YYYY-MM-DD"
  paidAt: string | null;     // "YYYY-MM-DD"
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
    "invoiceNumber": "CW-2026-001",
    "status": "sent",
    "totalAmount": "1250.00",
    "issuedAt": "2026-03-01",
    "paidAt": null,
    "createdAt": "2026-03-01T12:00:00.000Z",
    "client": {
      "id": "...",
      "name": "Acme Corp"
    }
  }
]
```

</details>

---

## `getInvoice(id)`

**Server Action** **Auth Required**

Returns a single invoice with its client and linked time entries.

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | Yes | Invoice UUID |

<details>
<summary>Response example</summary>

```json
{
  "id": "...",
  "invoiceNumber": "CW-2026-001",
  "status": "draft",
  "totalAmount": "1250.00",
  "issuedAt": "2026-03-01",
  "paidAt": null,
  "createdAt": "2026-03-01T12:00:00.000Z",
  "client": {
    "id": "...",
    "name": "Acme Corp",
    "email": "billing@acme.com",
    "address": "123 Main St"
  },
  "timeEntries": [
    {
      "id": "...",
      "title": "Design review",
      "minutes": 90,
      "ratePerHour": "150.00",
      "date": "2026-02-28"
    }
  ]
}
```

Returns `undefined` if not found.

</details>

---

## `updateInvoiceStatus(id, status)`

**Server Action** **Auth Required**

Updates the status of an invoice. When status is set to `"paid"`, automatically sets `paidAt` to today's date.

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | Yes | Invoice UUID |
| `status` | `"draft" \| "sent" \| "paid"` | Yes | New status |

### Validation

- `status` — must be one of `"draft"`, `"sent"`, `"paid"` (validated by `invoiceStatusSchema`)

### Behavior

- Sets `paidAt` to current date (ISO format, date only) when status is `"paid"`
- Revalidates `/invoices/{id}` and `/invoices`

---

## GET `/api/invoices/[id]/pdf`

**GET** **Auth Required**

Downloads a PDF for the specified invoice. Returns the PDF as a binary attachment.

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | Yes | Invoice UUID (URL path parameter) |

### Response

- **200** — PDF binary with `Content-Type: application/pdf` and `Content-Disposition: attachment; filename="CW-2026-001.pdf"`
- **401** — `{ "error": "Unauthorized" }` if not authenticated
- **404** — `{ "error": "Not found" }` if invoice doesn't exist or isn't owned by user

<details>
<summary>Error response examples</summary>

```json
{ "error": "Unauthorized" }
```

```json
{ "error": "Not found" }
```

</details>
