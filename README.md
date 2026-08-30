# Auth API — Login & Protect

A small REST API that handles user authentication with **Supabase Auth**: sign up,
log in, log out, and routes that answer only for logged-in users.

The rule this project is built on: **it never stores a password and never hashes
anything itself.** Supabase stores the accounts, hashes the passwords and signs the
tokens. This server does the part that belongs to a backend — it receives a token,
verifies it with Supabase, and opens or refuses the door.

Interactive docs (Swagger UI): <http://localhost:3000/docs/>

## Quick start

```bash
git clone https://github.com/Mariam0Ashraf/Auth---Login-protect.git
cd Auth---Login-protect
npm install
cp .env.example .env     # then fill in your own Supabase values
npm start
```

The server prints:

```
Server running and connected to Supabase on http://localhost:3000
```

That line is not decoration — the server asks Supabase Auth for its health before
it starts listening, so a wrong URL or key gives you an error instead of a server
that looks fine and fails on the first request.

### Environment variables

`.env` is git-ignored because it holds your project keys. `.env.example` is
committed with placeholder values so you know what to set:

```
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_KEY=YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY
PORT=3000
```

Both values come from your Supabase dashboard under **Project Settings → API**.

- `SUPABASE_URL` is the **Project URL** — `https://<ref>.supabase.co`, with no path
  after it. The SDK appends `/auth/v1` and `/rest/v1` itself, so pasting the REST
  URL here produces 404s that look like broken routes.
- `SUPABASE_KEY` is the **anon / publishable** key, the public one. The
  `service_role` key bypasses every security rule and must never appear in this
  project.

`npm start` runs `node --env-file-if-exists=.env index.js`, so Node reads `.env`
itself and no `dotenv` package is needed.

### One dashboard setting you must change

In **Authentication → Sign In / Providers → Email**, turn **"Confirm email" off**
and save. With it on, a new signup cannot log in until it clicks a link in an
email, so `POST /auth/login` fails immediately after `POST /auth/signup` — and it
fails in a way that looks exactly like a bug in the code. In production you would
leave it on, because it is what stops someone signing up as an address they do not
own.

## API reference

| Method | Endpoint | Auth required | Purpose | Success | Errors |
|---|---|---|---|---|---|
| POST | `/auth/signup` | No | Create a user account | `201` user object | `400` missing input |
| POST | `/auth/login` | No | Authenticate, return a JWT | `200` access + refresh token | `400` missing input · `401` bad credentials |
| POST | `/auth/logout` | **Bearer** | End the session | `204` no content | `401` missing/invalid token |
| GET | `/protected/profile` | **Bearer** | Read private profile data | `200` id, email, created_at | `401` missing/invalid token |
| GET | `/protected/dashboard` | **Bearer** | Second protected route | `200` greeting | `401` missing/invalid token |
| GET | `/public/info` | No | Read public data | `200` message | — |

Every error is JSON with an `error` key:

```json
{ "error": "Access token required" }
{ "error": "Invalid or expired token" }
{ "error": "Invalid login credentials" }
{ "error": "Email and password are required" }
```

Protected routes expect the token in the standard header:

```
Authorization: Bearer <access_token>
```

## Trying it

```bash
# 1. create an account
curl -i -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"you@flyrank.dev","password":"password123"}'      # 201

# 2. log in and copy the access_token out of the response
curl -i -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@flyrank.dev","password":"password123"}'      # 200

# 3. open the locked door
curl -i http://localhost:3000/protected/profile \
  -H "Authorization: Bearer <PASTE_TOKEN>"                       # 200

# 4. the same door, no key
curl -i http://localhost:3000/protected/profile                  # 401
```

Note: use a real-looking domain. Supabase **rejects `@example.com`** outright with
`Email address "…" is invalid`, so the address used in most tutorials will not work.

## Swagger UI

`/docs/` renders the API as an interactive page. The three protected routes show a
**padlock**; click **Authorize**, paste an `access_token` from `/auth/login`, and
**Try it out** calls the locked routes from the browser with no curl at all.

![Swagger UI showing the padlock on the protected routes](docs/swagger.png)

The padlock comes from a `securitySchemes` block in `openapi.json`:

```json
"securitySchemes": {
  "bearerAuth": { "type": "http", "scheme": "bearer", "bearerFormat": "JWT" }
}
```

and each locked route opting into it with `"security": [{ "bearerAuth": [] }]`.
Routes without that key stay open, which is why `/public/info` has no padlock.

## How the auth works

Three parties, and no password ever sits on this server:

1. The client sends email + password to **this API**, which forwards them to Supabase.
2. Supabase checks them and returns a **JWT access token** (valid one hour) plus a
   refresh token.
3. The client calls a protected route with `Authorization: Bearer <token>`.
4. The middleware asks Supabase `getUser(token)` — a real network call to the service
   that holds the signing key. That is why the answer can be trusted; decoding the
   JWT locally would prove nothing, since anyone can write a payload.

### One guard, not a check per door

`middleware/requireAuth.js` holds the entire auth check. It extracts the token,
verifies it, attaches `req.user`, and answers `401` itself — so a protected route
never repeats an auth check:

```js
router.use(requireAuth);

router.get("/profile", (req, res) => {
  res.json({ user: authService.toSafeUser(req.user) });
});
```

`/protected/dashboard` was added with **no new auth code** — that reuse is the point.
Pasting the check into every route is how one door eventually gets missed.

### Project layout

```
index.js                     Express app, mounts routers and Swagger
supabase.js                  Supabase client + startup connectivity check
middleware/requireAuth.js    the one guard, used by every locked route
routes/authRoutes.js         /auth/signup, /auth/login, /auth/logout
routes/protectedRoutes.js    /protected/profile, /protected/dashboard
routes/publicRoutes.js       /public/info
services/authService.js      every call that talks to Supabase Auth
openapi.json                 the spec Swagger UI renders
```

Routes handle HTTP and status codes; the service holds the Supabase calls. Nothing
in `routes/` imports the Supabase client directly.

## Three things that were not obvious

**`signOut(token)` does not take a token.** The assignment says to call
`supabase.auth.signOut(token)`, but in supabase-js v2 the signature is
`signOut(options = { scope: 'global' })` — the argument is not a token. Worse, it
reported success and revoked nothing:

```
signOut() error: none
access_token still valid after signOut?   true
refresh_token still usable after signOut? true
```

It reads the session from client-side storage, and this server stores none
(`persistSession: false`), so it signed out nobody. Returning `204` on top of that
would have been a lie. `authService.logOut()` instead calls the endpoint `signOut()`
calls internally — `POST /auth/v1/logout?scope=global` with the caller's own token —
which actually revokes the session.

**Logout really does kill the token.** After `POST /auth/logout`, the same token that
worked a second earlier returns `401`. That is worth noticing, because a purely
stateless JWT check would keep honouring it until it expired. Supabase tracks
sessions server-side, so `getUser` rejects it at once.

**"Change one character of the token" can produce a false pass.** Changing the token's
*last* character from `A` to `B` still returned `200`. The guard was not broken — the
signature is 86 base64url characters encoding 64 bytes, so `86 × 6 = 516` bits carry
only 512 bits of signature. The final character has 4 bits nothing reads, and `A` and
`B` differ only in those, so the token was never actually altered. Changing any
character in the middle — header, payload or signature — returns `401`, and so does
changing the last character to one that does move the decoded bytes.

## Status codes

`200` OK · `201` Created · `204` No Content · `400` Bad Request ·
`401` Unauthorized — *"I don't know who you are"*: a missing, malformed, expired or
forged token.

`401` is the only auth failure this API returns. `403` Forbidden would mean something
different — *"I know exactly who you are, and you still may not"* — which is
authorization, a question about permissions rather than identity.
