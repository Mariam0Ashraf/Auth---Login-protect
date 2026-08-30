# The prompt (draft — edit this, then I regenerate)

Build a small REST API using Node.js and Express that handles user authentication
with Supabase Auth. Do not store passwords and do not hash anything yourself —
Supabase manages the accounts and issues the tokens. Read SUPABASE_URL,
SUPABASE_KEY and PORT from a .env file and initialise the Supabase client from
them. Run on port 3001.

The API needs these endpoints:

POST /auth/signup takes { "email": "...", "password": "..." } and creates a user
with Supabase. Returns 201 with the user object.

POST /auth/login takes the same body, signs the user in with Supabase, and
returns 200 with the access token and the refresh token.

POST /auth/logout ends the user's session with Supabase and returns 204 with an
empty body. It is a protected route.

GET /protected/profile returns 200 with the logged-in user's id, email and the
date the account was created. It is a protected route.

GET /public/info returns 200 with
{ "message": "Welcome stranger! This info is public." } and needs no token.

Protected routes need the access token in the Authorization header as
"Authorization: Bearer <token>". Verify the token with Supabase, do not decode it
yourself.

Validation rules: on signup and login, if the email or the password is missing,
return 400 with a JSON error. If Supabase rejects the login credentials, return
401 with { "error": "Invalid login credentials" }. If the Authorization header is
missing, malformed, or has no token, return 401 with
{ "error": "Access token required" }. If the token is invalid, tampered with or
expired, return 401 with { "error": "Invalid or expired token" }. Every error
response must be JSON in the shape { "error": "..." }.

Put the token check in one reusable middleware function instead of repeating it
in every protected route, and use it on more than one route so the reuse is
visible.

Serve Swagger UI at /docs from an openapi.json file, with a securitySchemes block
of type http and scheme bearer, so the protected routes show a padlock and a
token can be pasted once with the Authorize button.

Split the code into routes, services and middleware folders instead of putting
everything in one file, and write it as clean production quality code.
