// Vercel function for the hosted demo: serves the JSON mock API under /api on the same
// origin as the client. vercel.json rewrites every /api/* request here; Express routes it.
export { default } from "../server/demo/mockServer.js";
