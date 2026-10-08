/**
 * One command to run the whole demo with no MongoDB:
 *
 *   npm run demo
 *
 * Starts the JSON mock API (server/demo/mockServer.js) and the Vite client
 * together, prefixes their output, and shuts both down on Ctrl-C.
 *
 * Deliberately dependency-free — there is no root node_modules and adding
 * `concurrently` would mean an install step before the demo could run.
 */

import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const isWindows = process.platform === "win32";

const tasks = [
	{ name: "api   ", colour: "\x1b[36m", cwd: "server", command: "node", args: ["demo/mockServer.js"] },
	{ name: "client", colour: "\x1b[35m", cwd: "client", command: "npm", args: ["run", "dev"] },
];

const children = [];
let shuttingDown = false;

function prefix(task, chunk) {
	const reset = "\x1b[0m";
	for (const line of chunk.toString().split("\n")) {
		if (line.trim()) console.log(`${task.colour}[${task.name}]${reset} ${line}`);
	}
}

for (const task of tasks) {
	const child = spawn(task.command, task.args, {
		cwd: path.join(root, task.cwd),
		// npm on Windows is a .cmd shim, which spawn can only launch through a shell.
		shell: isWindows,
		env: process.env,
	});

	child.stdout.on("data", (chunk) => prefix(task, chunk));
	child.stderr.on("data", (chunk) => prefix(task, chunk));

	child.on("error", (error) => {
		console.error(`[${task.name}] failed to start: ${error.message}`);
		shutdown(1);
	});

	child.on("exit", (code) => {
		if (shuttingDown) return;
		console.error(`\n[${task.name}] exited with code ${code}. Stopping the demo.`);
		shutdown(code ?? 1);
	});

	children.push(child);
}

function shutdown(code = 0) {
	if (shuttingDown) return;
	shuttingDown = true;
	for (const child of children) {
		if (child.exitCode === null) {
			// taskkill is the only reliable way to take down npm's child processes
			// on Windows; a plain kill leaves the Vite process orphaned.
			if (isWindows) spawn("taskkill", ["/pid", child.pid, "/f", "/t"], { shell: true });
			else child.kill("SIGTERM");
		}
	}
	setTimeout(() => process.exit(code), 300);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

console.log("\n  Starting the Npathways demo — mock API + client, no MongoDB required.");
console.log("  Press Ctrl-C to stop both.\n");
