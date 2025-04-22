import {seedAdmin} from "./admin.seeder";
import {seedPermissions} from "./permission.seeder";

import {seedRoles} from "./role.seeder";
import mongoose from "mongoose";
import connectDatabase from "../config/database.config";

export type TransactionCheckResult = { replicaSet: boolean } | boolean

async function checkTransactionSupport(): Promise<TransactionCheckResult> {
    console.log("Checking transaction support...");
    let session;

    try {
        await connectDatabase();

        session = await mongoose.startSession();
        session.startTransaction();

        await session.commitTransaction();
        console.log("✅ Transactions are supported on this MongoDB deployment");

        if (!session.clientOptions.readPreference.secondaryOk()) {
            console.log("❌ Transaction numbers are only allowed on a replica set member or mongos");
            console.log("Skipping without transactions");
            return {replicaSet: false};
        }

        return true;
    } catch (error: any) {
        if (error.name === "MongoServerError" &&
          error.message.includes("Transaction numbers are only allowed on a replica set member or mongos")) {
            console.log("❌ Transactions are NOT supported on this MongoDB deployment");
            console.log("This error occurs because you're using a standalone MongoDB instance.");
            console.log("For transaction support, you need:");
            console.log("1. MongoDB 4.0+ with a replica set configuration, or");
            console.log("2. MongoDB 4.2+ with a sharded cluster");
            return false;
        } else {
            console.error("Error checking transaction support:", error);
            throw error;
        }
    } finally {
        if (session) {
            session.endSession();
        }
    }
}

export async function withTransactionMode(callback: (session?: mongoose.mongo.ClientSession) => Promise<void>): Promise<void> {
    try {
        const session = await mongoose.startSession();
        session.startTransaction();

        await callback(session);

        await session.commitTransaction();
        console.log("Transaction committed.");
        session.endSession();

        console.log("Session ended.");
        console.log("Session completed successfully.");
    } catch (error) {
        console.error("Error transaction support:", error);
        throw error;
    }
}

const seeder = async () => {
    const transactionSupported = await checkTransactionSupport()

    await seedPermissions(transactionSupported).catch((error) =>
        console.error("Error running seed script: ", error)
    );
    await seedRoles(transactionSupported).catch((error) =>
        console.error("Error running seed script: ", error)
    );
    await seedAdmin(transactionSupported).catch((error) =>
        console.error("Error running seed script: ", error)
    );

    process.exit();
};

void seeder();
