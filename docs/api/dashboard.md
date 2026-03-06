[&larr; Back to API index](./README.md)

# Dashboard

Dashboard statistics for the current tax year.

**Source:** `src/actions/dashboard.ts`

---

## `getDashboardStats()`

**Server Action** **Auth Required**

Returns aggregated time and earnings statistics for the authenticated user's current tax year. Calculates totals across all entries and separately for unbilled (uninvoiced) entries.

### Parameters

None.

### Response

```typescript
{
  totalMinutes: number;      // Total tracked minutes in current tax year
  totalEarned: number;       // Total earnings (minutes * ratePerHour / 60)
  unbilledMinutes: number;   // Minutes not yet linked to an invoice
  unbilledAmount: number;    // Unbilled earnings
}
```

<details>
<summary>Response example</summary>

```json
{
  "totalMinutes": 4800,
  "totalEarned": 12000.00,
  "unbilledMinutes": 1200,
  "unbilledAmount": 3000.00
}
```

</details>

### Calculation

- **totalMinutes** — `SUM(minutes)` for all entries in the tax year
- **totalEarned** — `SUM(minutes * ratePerHour / 60)` for all entries
- **unbilledMinutes** — same as above but only where `invoiceId IS NULL`
- **unbilledAmount** — same as above but only where `invoiceId IS NULL`
- All values default to `0` when no entries exist
