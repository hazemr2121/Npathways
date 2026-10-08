# NPathways

NPathways is a digital construction courses platform designed to guide learners through a
structured learning path based on their skills, knowledge, and experience. Unlike traditional
course websites, NPathways provides a tailored learning experience determined by an
enrollment test, motivation letter, and expectations assessment.

## Quick demo — no database needed

```shell
npm run demo
```

Starts a JSON-backed mock API and the client together. Ctrl-C stops both. No MongoDB,
no install step, no `.env`.

Sign in with either account:

| Account | Email | Password |
| --- | --- | --- |
| Has a pathway in progress | `demo@npathways.test` | `Demo@1234` |
| Empty, for the enrolment flow | `applicant@npathways.test` | `Apply@1234` |

### What the demo covers

Sign in, browse courses and course details, view pathways and their courses, complete the
enrolment form, and take an exam. Enrolling really does move the account onto a pathway and
grant its courses, and exam submissions are scored, so the walkthrough hangs together.

### What it does not cover

The mock implements only the endpoints above — roughly a third of the real API. Chat,
payments, certificates, the instructor dashboard and everything in the admin app are not
included; those routes return **404 with a message saying so**, and the mock logs the
unhandled path to the console. For those, run the real server against MongoDB.

State lives in memory and resets every restart, so a demo always begins from the same place.
The fixtures are in `server/demo/data.json` and the mock itself in `server/demo/mockServer.js`.

> The mock's "authentication" is a cookie holding a user id. It verifies nothing. It exists so
> the client's cookie flows behave normally, and must never be pointed at real data.

## Running the real stack

Requires MongoDB on `localhost:27017` (or `MONGO_URI` set) and a `.env` in `server/` with
`SECRET_KEY`, `MONGO_URI`, `JWT_EXPIRES_IN`, `HOST` and `PORT`.

```shell
cd server && npm install && npm start     # API on :5024
cd client && npm install && npm run dev   # client
cd admin  && npm install && npm start     # admin dashboard
```

To create the demo accounts in a real database:

```shell
cd server && npm run seed:demo
```

### A note on passwords

Four independent password rules exist in this codebase and they disagree with each other:

| Layer | Rule |
| --- | --- |
| server (Joi) | `[a-zA-Z0-9!@#$%^&*]{8,30}`, a whitelist — anything else is rejected |
| client login + register (Yup) | any non-word character counts as the special character |
| client reset password (Yup) | special must be one of `@$!%*?&` |
| admin (Angular) | special must be one of `@$!%*?&` |

Only `! @ $ % & *` satisfy every layer. Note that `?` passes both Angular forms and is then
rejected by the server, so a password containing it can be set in the admin UI and fail on save.

The strength rules are also applied on **login**, not just registration, which will lock out any
account whose password predates the policy.
