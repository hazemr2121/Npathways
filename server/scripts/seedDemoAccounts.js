/**
 * Creates (or resets) the demo accounts used to show the project off.
 *
 *   node scripts/seedDemoAccounts.js
 *
 * Run from the `server` directory with the same .env the API uses — it reads
 * MONGO_URI through the existing config/db.js.
 *
 * The passwords below are the only interesting part. Every layer of this stack
 * validates password strength independently and they do not agree with each
 * other, so a demo password has to satisfy the intersection of all of them:
 *
 *   server (Joi)        ^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])
 *                       [a-zA-Z0-9!@#$%^&*]{8,30}$     <- whitelist, 8-30 chars
 *   client login/reg    >=8, digit, lower, upper, any non-word character
 *   client reset        >=8, digit, lower, upper, one of @$!%*?&
 *   admin (Angular)     >=8, digit, lower, upper, one of @$!%*?&
 *
 * Only ! @ $ % & * are accepted everywhere. Note that "?" passes both Angular
 * forms and is then rejected by the server, so avoid it here.
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Admin from "../models/admin.model.js";
import User from "../models/user.model.js";

// Reads server/.env, so run this from the server directory.
dotenv.config();

export const DEMO_USER = {
	firstName: "Demo",
	lastName: "User",
	email: "demo@npathways.test",
	password: "Demo@1234",
	verify: true,
};

export const DEMO_ADMIN = {
	firstName: "Demo",
	lastName: "Admin",
	email: "admin@npathways.test",
	password: "Admin@1234",
	role: "admin",
};

// Both models hash in a pre("save") hook, so every write here goes through
// document.save() — findOneAndUpdate would store the password in clear text.
async function upsert(Model, { email, password, ...fields }, label) {
	let doc = await Model.findOne({ email });

	if (doc) {
		Object.assign(doc, fields);
		doc.password = password;
		await doc.save();
		console.log(`  updated ${label}: ${email}`);
	} else {
		doc = new Model({ email, password, ...fields });
		await doc.save();
		console.log(`  created ${label}: ${email}`);
	}

	return doc;
}

async function main() {
	await connectDB();

	console.log("Seeding demo accounts...");
	await upsert(User, DEMO_USER, "user");
	await upsert(Admin, DEMO_ADMIN, "admin");

	console.log("\nDemo credentials");
	console.log(`  client:  ${DEMO_USER.email} / ${DEMO_USER.password}`);
	console.log(`  admin:   ${DEMO_ADMIN.email} / ${DEMO_ADMIN.password}`);

	await mongoose.connection.close();
}

main().catch(async (error) => {
	console.error("Failed to seed demo accounts:", error.message);
	await mongoose.connection.close().catch(() => {});
	process.exit(1);
});
