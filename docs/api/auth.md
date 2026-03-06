[&larr; Back to API index](./README.md)

# Auth

Authentication is handled by [NextAuth.js](https://next-auth.js.org/) with a credentials provider (email + password). Sessions use JWT strategy with a 30-day expiry.

**Source:** `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`

---

## POST `/api/auth/[...nextauth]`

**POST** **Public**

Sign in with email and password. This is the standard NextAuth credentials endpoint.

### Request Body

```json
{
  "email": "user@example.com",
  "password": "your-password",
  "csrfToken": "<csrf-token>"
}
```

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `email` | `string` | Yes | User email address |
| `password` | `string` | Yes | User password |
| `csrfToken` | `string` | Yes | CSRF token from `/api/auth/csrf` |

### Behavior

- Rate-limited per email address. Exceeding the limit returns an error.
- On success, sets a JWT session cookie and redirects to `/`.
- On failure, redirects back to `/login` with an error query param.

<details>
<summary>Response (redirect)</summary>

On success, NextAuth redirects (HTTP 302) to the callback URL. The session cookie is set automatically.

On failure:

```
302 /login?error=CredentialsSignin
```

</details>

---

## GET `/api/auth/[...nextauth]`

**GET** **Public**

Standard NextAuth GET routes for session management.

### Sub-routes

| Path | Description |
|------|-------------|
| `/api/auth/csrf` | Returns a CSRF token for form submissions |
| `/api/auth/session` | Returns the current session object |
| `/api/auth/signout` | Signs out the current user |
| `/api/auth/providers` | Lists available auth providers |

<details>
<summary>Session response example</summary>

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Jane Doe",
    "email": "jane@example.com"
  },
  "expires": "2026-04-05T00:00:00.000Z"
}
```

</details>
