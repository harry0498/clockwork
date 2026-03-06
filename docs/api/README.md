# Clockwork API Documentation

Clockwork is a freelance time-tracking and invoicing application. The API consists of **Next.js Server Actions** (called directly from React components) and **API Routes** (standard HTTP endpoints).

All endpoints require authentication unless otherwise noted.

## [Auth](./auth.md)

| Type | Endpoint | Description |
|------|----------|-------------|
| API Route | `POST /api/auth/[...nextauth]` | Credentials login |
| API Route | `GET /api/auth/[...nextauth]` | Session, CSRF, sign-out |

## [Clients](./clients.md)

| Type | Action | Description |
|------|--------|-------------|
| Server Action | `getClients()` | List all clients |
| Server Action | `getClient(id)` | Get a single client |
| Server Action | `createClient(formData)` | Create a client |
| Server Action | `updateClient(id, formData)` | Update a client |
| Server Action | `deleteClient(id)` | Delete a client |

## [Entries](./entries.md)

| Type | Action | Description |
|------|--------|-------------|
| Server Action | `getEntries(options?)` | List entries with filters |
| Server Action | `getEntry(id)` | Get a single entry |
| Server Action | `createEntry(formData)` | Create a time entry |
| Server Action | `updateEntry(id, formData)` | Update a time entry |
| Server Action | `deleteEntry(id)` | Delete a time entry |

## [Invoices](./invoices.md)

| Type | Endpoint / Action | Description |
|------|-------------------|-------------|
| Server Action | `createInvoice(data)` | Create invoice from entries |
| Server Action | `getInvoices(taxYear?)` | List invoices |
| Server Action | `getInvoice(id)` | Get invoice with entries |
| Server Action | `updateInvoiceStatus(id, status)` | Change invoice status |
| API Route | `GET /api/invoices/[id]/pdf` | Download invoice PDF |

## [Dashboard](./dashboard.md)

| Type | Action | Description |
|------|--------|-------------|
| Server Action | `getDashboardStats()` | Current tax year stats |
