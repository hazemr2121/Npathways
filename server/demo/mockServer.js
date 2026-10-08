/**
 * JSON-backed mock of the Npathways API, for demos without MongoDB.
 *
 *   npm run demo:api          (from the server directory)
 *
 * This is NOT the real API. It reimplements only the endpoints the demo walks
 * through — sign in, browse courses, pathways, enrolment and exams — reproducing
 * the response envelopes the client destructures. Anything outside that set
 * returns 404 with a message saying so, rather than failing silently.
 *
 * Data comes from demo/data.json and is held in memory. Writes (enrolling,
 * submitting an exam) mutate the in-memory copy only, so a restart resets the
 * demo to a known state. Nothing is written back to disk.
 *
 * Authentication is a signed-nothing cookie holding a user id. It exists so the
 * client's cookie-based flows behave normally; it verifies nothing and must
 * never be pointed at real data.
 */

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const seed = JSON.parse(fs.readFileSync(path.join(here, "data.json"), "utf8"));

const PORT = process.env.PORT || 5024;
const COOKIE = "access_token";

// Fresh deep copy so restarts always start from the same fixture.
const db = structuredClone(seed);

const app = express();
app.use(express.json());
app.use(cookieParser());
// The client sends cookies on every request, so the origin must be reflected
// rather than "*" — credentialed requests reject a wildcard.
app.use(cors({ credentials: true, origin: true }));

// ---------------------------------------------------------------- helpers

const byId = (list, id) => list.find((item) => String(item._id) === String(id));
const oid = (id) => /^[0-9a-fA-F]{24}$/.test(String(id ?? ""));

function newId() {
	// 24 hex chars, because the client and several handlers validate the shape.
	return Date.now().toString(16).padStart(16, "0").slice(-16) +
		Math.floor(Math.random() * 0xffffff).toString(16).padStart(8, "0");
}

/** Expands instructor ids into the subset the real controller populates. */
function withInstructors(course) {
	return {
		...course,
		instructors: course.instructors
			.map((id) => byId(db.instructors, id))
			.filter(Boolean)
			.map(({ _id, firstName, lastName, email, image }) => ({
				_id,
				firstName,
				lastName,
				email,
				image,
			})),
	};
}

/** Course as the pathway endpoints return it: exams expanded, instructors too. */
function courseForPathway(course) {
	return {
		...withInstructors(course),
		requiredExams: course.requiredExams
			.map((id) => byId(db.exams, id))
			.filter(Boolean)
			.map(({ _id, name, questions, timeLimit }) => ({
				_id,
				name,
				questions,
				totalTime: timeLimit,
			})),
	};
}

function pathwayWithCourses(pathway) {
	return {
		...pathway,
		courses: pathway.courses
			.map((id) => byId(db.courses, id))
			.filter(Boolean)
			.map(courseForPathway),
	};
}

/** Strips the password and expands the refs the client reads off the user. */
function publicUser(user) {
	const { password, ...rest } = user;
	return {
		...rest,
		pathways: user.pathways.map((id) => byId(db.pathways, id)).filter(Boolean).map(pathwayWithCourses),
		courses: user.courses.map((id) => byId(db.courses, id)).filter(Boolean).map(withInstructors),
	};
}

/** Reads the demo cookie. Real auth this is not. */
function currentUser(req) {
	const raw = req.cookies?.[COOKIE];
	if (!raw) return null;
	return byId(db.users, String(raw).replace(/^Bearer\s+/, "")) ?? null;
}

function requireAuth(req, res, next) {
	const user = currentUser(req);
	if (!user) return res.status(401).json({ message: "Not authenticated" });
	req.user = user;
	next();
}

// ---------------------------------------------------------------- auth

app.post("/api/login", (req, res) => {
	const email = String(req.body?.email ?? "").toLowerCase();
	const password = String(req.body?.password ?? "");

	if (!email || !password) {
		return res.status(400).json({ message: "Email and password are required" });
	}

	const user = db.users.find((u) => u.email.toLowerCase() === email);
	if (!user || user.password !== password) {
		return res.status(404).json({ message: "Invalid Email Or Password" });
	}

	res.cookie(COOKIE, user._id, { httpOnly: true, maxAge: 2 * 24 * 60 * 60 * 1000 });

	const full = publicUser(user);
	return res.status(200).json({
		message: "Login successfully",
		token: `demo-token-${user._id}`,
		userId: user._id,
		firstName: user.firstName,
		lastName: user.lastName,
		email: user.email,
		pathways: full.pathways,
		courses: full.courses,
	});
});

app.post("/api/availableEmail", (req, res) => {
	const email = String(req.body?.email ?? "").toLowerCase();
	const taken = db.users.some((u) => u.email.toLowerCase() === email);
	return taken
		? res.status(409).json({ message: "Email Already Taken" })
		: res.status(200).json({ message: "Email Available" });
});

app.post("/api/user/signup", (req, res) => {
	const { firstName, lastName, email, password, phone } = req.body ?? {};
	if (!firstName || !lastName || !email || !password) {
		return res.status(400).json({ message: "Missing required fields" });
	}
	if (db.users.some((u) => u.email.toLowerCase() === String(email).toLowerCase())) {
		return res.status(409).json({ message: "Email Already Taken" });
	}

	const user = {
		_id: newId(),
		firstName,
		lastName,
		email,
		password,
		phone: phone ?? "",
		image: "",
		level: 1,
		status: "active",
		// The real app emails a verification link; the demo skips straight past it.
		verify: true,
		pathways: [],
		courses: [],
		certificates: [],
	};
	db.users.push(user);
	return res.status(201).json({ message: "User created successfully", userId: user._id });
});

app.get("/api/auth/verify", requireAuth, (req, res) => res.status(200).json(publicUser(req.user)));
app.get("/api/user/verify", requireAuth, (req, res) => res.status(200).json(publicUser(req.user)));

const logout = (_req, res) => {
	res.clearCookie(COOKIE);
	return res.status(200).json({ message: "Logged out successfully" });
};
app.delete("/api/auth/logout", logout);
app.delete("/api/user/logout", logout);

app.get("/api/user/all", requireAuth, (_req, res) =>
	res.status(200).json(db.users.map(publicUser))
);

app.get("/api/user/:id", requireAuth, (req, res) => {
	if (!oid(req.params.id)) return res.status(400).json({ error: "Invalid User ID" });
	const user = byId(db.users, req.params.id);
	if (!user) return res.status(404).json({ error: "User not found" });
	return res.status(200).json(publicUser(user));
});

// ---------------------------------------------------------------- courses

app.get("/api/course/search", (req, res) => {
	const q = String(req.query.name ?? req.query.q ?? "").toLowerCase();
	const found = db.courses.filter(
		(c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
	);
	return res.status(200).json(found.map(withInstructors));
});

app.get("/api/course/enrolledCourses", requireAuth, (req, res) =>
	res.status(200).json(
		req.user.courses.map((id) => byId(db.courses, id)).filter(Boolean).map(withInstructors)
	)
);

app.get("/api/course/getStudentsCountInCourse/:id", (req, res) =>
	// The client reads response.data.StudentCount — capital S.
	res.status(200).json({ StudentCount: db.studentCounts[req.params.id] ?? 0 })
);

app.get("/api/course/getcoursesByInstructorId/:id", (req, res) =>
	res.status(200).json(
		db.courses.filter((c) => c.instructors.includes(req.params.id)).map(withInstructors)
	)
);

app.get("/api/course/", (_req, res) => res.status(200).json(db.courses.map(withInstructors)));

app.get("/api/course/:id", (req, res) => {
	if (!oid(req.params.id)) return res.status(400).json({ error: "Invalid course ID" });
	const course = byId(db.courses, req.params.id);
	if (!course) return res.status(404).json({ error: "Course not found" });

	return res.status(200).json({
		...withInstructors(course),
		requiredExams: course.requiredExams
			.map((id) => byId(db.exams, id))
			.filter(Boolean)
			.map(({ _id, name }) => ({ _id, name })),
	});
});

// ---------------------------------------------------------------- pathways

// Registered before "/student/:id" so the literal path wins the match.
app.get("/api/pathway/student/userPathway", requireAuth, (req, res) => {
	const pathways = req.user.pathways.map((id) => byId(db.pathways, id)).filter(Boolean);
	if (pathways.length === 0) {
		return res.status(200).json({ message: "User is not enrolled in any pathways" });
	}
	return res.status(200).json({
		message: "User pathways retrieved successfully",
		data: pathways.map(pathwayWithCourses),
	});
});

app.get("/api/pathway/student/:userId/pathways", (req, res) => {
	const user = byId(db.users, req.params.userId);
	if (!user) return res.status(404).json({ error: "User not found" });
	const pathways = user.pathways.map((id) => byId(db.pathways, id)).filter(Boolean);
	if (pathways.length === 0) {
		return res.status(200).json({ message: "User is not enrolled in any pathways" });
	}
	return res.status(200).json({
		message: "User pathways retrieved successfully",
		data: pathways.map(pathwayWithCourses),
	});
});

app.get("/api/pathway/student", (_req, res) =>
	res.status(201).json({ message: "All PathWays !", data: db.pathways.map(pathwayWithCourses) })
);

app.get("/api/pathway/student/:id", (req, res) => {
	if (!oid(req.params.id)) return res.status(400).json({ error: "Invalid Pathway ID" });
	const pathway = byId(db.pathways, req.params.id);
	if (!pathway) return res.status(404).json({ error: "PathWay not found" });
	return res.status(200).json({ message: "this is pathway ", data: pathwayWithCourses(pathway) });
});

// ---------------------------------------------------------------- enrolment

app.get("/api/enrollment/userEnrollments", requireAuth, (req, res) =>
	res.status(200).json(db.enrollments.filter((e) => String(e.userId) === String(req.user._id)))
);

app.get("/api/enrollment/user/:userId", (req, res) =>
	res.status(200).json(db.enrollments.filter((e) => String(e.userId) === String(req.params.userId)))
);

app.post("/api/enrollment/createEnrollment", requireAuth, (req, res) => {
	const body = req.body ?? {};
	const missing = ["firstName", "lastName", "email", "phone", "pathway", "motivationLetter"].filter(
		(field) => !body[field]
	);
	if (missing.length) {
		return res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
	}

	const enrollment = {
		...body,
		_id: newId(),
		userId: req.user._id,
		createdAt: new Date().toISOString(),
	};
	db.enrollments.push(enrollment);

	// Enrolling is what moves a user onto a pathway, so mirror that here or the
	// dashboard stays empty after the form succeeds.
	if (oid(body.pathway) && !req.user.pathways.includes(body.pathway)) {
		req.user.pathways.push(body.pathway);
		const pathway = byId(db.pathways, body.pathway);
		for (const courseId of pathway?.courses ?? []) {
			if (!req.user.courses.includes(courseId)) req.user.courses.push(courseId);
		}
	}

	return res.status(201).json(enrollment);
});

app.put("/api/enrollment/updateEnrollment/:id", requireAuth, (req, res) => {
	const enrollment = byId(db.enrollments, req.params.id);
	if (!enrollment) return res.status(404).json({ error: "Enrollment not found" });
	Object.assign(enrollment, req.body ?? {}, { _id: enrollment._id });
	return res.status(200).json(enrollment);
});

// ---------------------------------------------------------------- exams

app.get("/api/exam/submittedExams", requireAuth, (req, res) =>
	res.status(200).json(db.submittedExams.filter((s) => String(s.userId) === String(req.user._id)))
);

app.get("/api/exam/submittedExams/:id", requireAuth, (req, res) => {
	if (!oid(req.params.id)) return res.status(400).json({ error: "Invalid exam ID" });
	// The client passes both a submission id and an exam id to this route.
	const found =
		byId(db.submittedExams, req.params.id) ??
		db.submittedExams.find(
			(s) => String(s.examId) === String(req.params.id) && String(s.userId) === String(req.user._id)
		);
	if (!found) return res.status(404).json({ error: "Submitted exam not found" });
	return res.status(200).json(found);
});

const sendExam = (req, res) => {
	if (!oid(req.params.id)) return res.status(400).json({ error: "Invalid exam ID" });
	const exam = byId(db.exams, req.params.id);
	if (!exam) return res.status(404).json({ error: "Exam not found" });
	return res.status(200).json(exam);
};
app.get("/api/exam/getStudent/:id", requireAuth, sendExam);

app.post("/api/exam/submitExam", requireAuth, (req, res) => {
	const { examId, responses = [] } = req.body ?? {};
	if (!oid(examId)) return res.status(400).json({ error: "Invalid exam ID" });

	const exam = byId(db.exams, examId);
	if (!exam) return res.status(404).json({ error: "Exam not found" });

	let unknownQuestions = 0;
	const evaluated = responses
		.map((response) => {
			const question = exam.questions.find((q) => q.question === response.question);
			if (!question) {
				unknownQuestions++;
				return undefined;
			}
			const selected = response.selectedAnswers?.length ? response.selectedAnswers : [];
			const correct = question.answers.filter((a) => a.isCorrect).map((a) => a.answer);
			// Marked right only when the selection matches the correct set exactly,
			// which is how the real controller scores multi-answer questions.
			const isCorrect =
				correct.length === selected.length && correct.every((a) => selected.includes(a));
			return { question: response.question, selectedAnswers: selected, isCorrect };
		})
		.filter((r, i, self) => r && i === self.findIndex((x) => x?.question === r.question));

	const score = Math.round(
		(evaluated.filter((r) => r.isCorrect).length / exam.questions.length) * 100
	);

	const submission = {
		_id: newId(),
		examId,
		userId: req.user._id,
		score,
		passed: score >= 75,
		submittedAt: new Date().toISOString(),
		responses: evaluated,
	};
	db.submittedExams.push(submission);

	return res.status(200).json({
		message: "Exam submitted successfully",
		_id: submission._id,
		score,
		responses: evaluated,
		unknownQuestions: unknownQuestions > 0 ? unknownQuestions : undefined,
	});
});

app.get("/api/exam/:id", requireAuth, sendExam);

// ---------------------------------------------------------------- fallback

app.use("/api", (req, res) => {
	console.warn(`  [mock] unhandled ${req.method} ${req.originalUrl}`);
	res.status(404).json({
		error: "Not implemented by the demo mock API",
		detail:
			"This endpoint exists in the real server but is outside the demo path " +
			"(sign in, courses, pathways, enrolment, exams). Run the real API against " +
			"MongoDB to use it.",
		method: req.method,
		path: req.originalUrl,
	});
});

// Only listen when run directly. On Vercel, api/index.js imports the app and the
// platform handles requests, so binding a port there would be wrong.
const runDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (runDirectly) {
	app.listen(PORT, () => {
		const demo = db.users[0];
		console.log(`\n  Demo mock API (no MongoDB) listening on http://localhost:${PORT}`);
		console.log(`  Data: demo/data.json — in memory, resets on restart\n`);
		console.log(`  Sign in with  ${demo.email}  /  ${demo.password}`);
		console.log(`  Empty account ${db.users[1].email}  /  ${db.users[1].password}  (to walk the enrolment flow)\n`);
	});
}

export default app;
