import mongoose from "mongoose";
import { env } from "../../env.mjs";
import { buildDsn } from "@/utils/build-dsn";

declare global {
	var mongoose: any;
}

let cached = global.mongoose;

if (!cached) {
	cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
	const dsn = buildDsn({
		method: env.DB_METHOD,
		username: env.DB_USERNAME,
		password: env.DB_PASSWORD,
		serverUri: env.DB_SERVER_URI,
		databaseName: env.DB_NAME,
		params: env.DB_PARAMS,
	});

	if (!dsn) {
		throw new Error("Please define the dsn environment variable inside .env");
	}

	if (cached.conn) {
		return cached.conn;
	}

	if (!cached.promise) {
		const opts = {
			bufferCommands: false,
		};

		cached.promise = mongoose.connect(dsn, opts).then((mongoose) => {
			return mongoose;
		});
	}

	try {
		cached.conn = await cached.promise;
	} catch (e) {
		cached.promise = null;
		throw e;
	}

	return cached.conn;
}

export default dbConnect;
