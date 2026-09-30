# Database setup

FitFreak uses MongoDB through Mongoose for accounts, goals, generated plans,
progress, community posts, and chat history. Data belongs to the signed-in user.

## Run locally

From the repository root:

```sh
npm ci --prefix server
npm run dev:local --prefix server
```

The launcher creates any missing local connection setting and a random JWT secret
in the ignored `server/.env`. Existing credentials are preserved. It downloads a
real MongoDB 7.0.24 server on first use and reuses the cached binary thereafter;
the first launch requires internet access. No Docker installation is required.

MongoDB listens on `127.0.0.1:27017`, and the API on `127.0.0.1:8000`. The default
database is `fitfreak-ai`. Start the frontend separately with `npm run dev` from
the repository root. Keep the API terminal open while using the application.

Although the development launcher uses the `mongodb-memory-server-core` package,
it explicitly enables **WiredTiger disk storage** at `server/.data/mongodb` and
disables cleanup when stopping. Accounts and other records remain after restart.
Do not delete this directory if you want to keep local data. This directory and
secrets are ignored by Git. Stop the launcher before copying the entire data
directory for a local backup.

The launcher is for local development only, binds MongoDB to loopback, and refuses
to run with `NODE_ENV=production` or in Netlify. Use a managed database for a
deployed application. A separately running database can be used via `MONGODB_URI`;
the launcher preserves it and does not launch another database for hosted URIs.

Useful commands, run from the root:

```sh
npm run db:local --prefix server   # Database only
npm run db:check --prefix server   # Connect and ping without printing credentials
npm test --prefix server          # Configuration and coach tests
npm run test:database --prefix server # Prove records survive a MongoDB restart
```

The persistence test uses a separate temporary database and directory, then removes
only its own temporary files. It never resets the application's database.

## Hosted MongoDB / Netlify

Create a MongoDB Atlas database, allow your deployment's network access, and set
these **server-side** environment variables in your deployment provider:

```dotenv
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/fitfreak-ai
JWT_SECRET=YOUR_LONG_RANDOM_SECRET
```

Use a database user with read/write access to the application database. URL-encode
special characters in the username and password. Do not put database credentials
or the JWT secret in a `VITE_` variable or commit `.env` files. `URL` remains
supported as a legacy alias, but `MONGODB_URI` takes precedence. MongoDB collections
are created automatically as users register and save records; no SQL migration is
needed. For a standalone production API, use `npm start --prefix server`.

`/api/health` checks service configuration. `/api/ready` also pings the database,
returning 503 if a usable connection cannot be established. A standalone API
verifies its database and authentication configuration before accepting requests.

If you cannot connect, check that the local launcher is running, the configured
port is free, or that the Atlas credentials and network access list are correct.
For a local port other than 27017, update `MONGODB_URI` in `server/.env` before
starting the launcher; it always uses that exact port.
