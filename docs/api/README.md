# Clockwork API Documentation

Clockwork is a freelance time-tracking and invoicing application. The API consists of **Next.js Server Actions** (called directly from React components) and **API Routes** (standard HTTP endpoints).

All endpoints require authentication unless otherwise noted.

## Endpoints

| Resource | Type | Endpoint / Action | Description |
|----------|------|-------------------|-------------|
| [Auth](./auth.md) | API Route | `POST /api/auth/[...nextauth]` | Credentials login |
| [Auth](./auth.md) | API Route | `GET /api/auth/[...nextauth]` | Session, CSRF, sign-out |
| [Clients](./clients.md) | Server Action | `getClients()` | List all clients |
| [Clients](./clients.md) | Server Action | `getClient(id)` | Get a single client |
| [Clients](./clients.md) | Server Action | `createClient(formData)` | Create a client |
| [Clients](./clients.md) | Server Action | `updateClient(id, formData)` | Update a client |
| [Clients](./clients.md) | Server Action | `deleteClient(id)` | Delete a client |
| [Entries](./entries.md) | Server Action | `getEntries(options?)` | List entries with filters |
| [Entries](./entries.md) | Server Action | `getEntry(id)` | Get a single entry |
| [Entries](./entries.md) | Server Action | `createEntry(formData)` | Create a time entry |
| [Entries](./entries.md) | Server Action | `updateEntry(id, formData)` | Update a time entry |
| [Entries](./entries.md) | Server Action | `deleteEntry(id)` | Delete a time entry |
| [Invoices](./invoices.md) | Server Action | `createInvoice(data)` | Create invoice from entries |
| [Invoices](./invoices.md) | Server Action | `getInvoices(taxYear?)` | List invoices |
| [Invoices](./invoices.md) | Server Action | `getInvoice(id)` | Get invoice with entries |
| [Invoices](./invoices.md) | Server Action | `updateInvoiceStatus(id, status)` | Change invoice status |
| [Invoices](./invoices.md) | API Route | `GET /api/invoices/[id]/pdf` | Download invoice PDF |
| [Dashboard](./dashboard.md) | Server Action | `getDashboardStats()` | Current tax year stats |
