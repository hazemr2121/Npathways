// Base URL of the API. Defaults to the local server. The Vercel demo build sets it to an
// empty string so requests go to the same origin, where the mock API is served under /api.
export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5024";

// The mock API has no socket.io server, so the demo build switches chat sockets off.
export const SOCKETS_ENABLED = import.meta.env.VITE_DISABLE_SOCKETS !== "true";

// Accounts seeded in the mock API (server/demo/data.json). Shown on the login page of the
// hosted demo only, so visitors can sign in without registering.
export const DEMO_ACCOUNTS =
  import.meta.env.VITE_SHOW_DEMO_ACCOUNTS === "true"
    ? [
        { label: "Student with a pathway", email: "demo@npathways.test", password: "Demo@1234" },
        { label: "New applicant (try enrolling)", email: "applicant@npathways.test", password: "Apply@1234" },
      ]
    : [];
