import "dotenv/config";

import mongoose from "mongoose";
import connectDatabase from "../config/database.config";
import RoleModel from "../models/role.model";
import {Roles} from "../common/enums/role.enum";
import {TransactionCheckResult, withTransactionMode} from "./index.seeder";

export const seedRoles = async (transactionSupported: TransactionCheckResult) => {
    console.log("Seeding roles started...");

    try {
        await connectDatabase();
        if (typeof transactionSupported !== "boolean" && transactionSupported?.replicaSet) {
            await withTransactionMode(insertData)
            return;
        }
        await insertData()
    } catch (error) {
        console.error("Error during seeding: ", error);
    }
};

async function insertData(session?: mongoose.mongo.ClientSession) {
    console.log("Clear existing roles...");
    await RoleModel.deleteMany({}, session && {session});

    for (const roleName in Roles) {
        let existingRole;

        if (session) {
            existingRole = await RoleModel.findOne({
                name: roleName,
            }).session(session)
        } else {
            existingRole = await RoleModel.findOne({
                name: roleName,
            })
        }

        if (!existingRole) {
            const newRole = new RoleModel({
                name: roleName,
            });

            await newRole.save(session && {session});
            console.log(`Role ${roleName} created is successfully.`);
        } else {
            console.log(`Role ${roleName} already exists.`);
        }
    }
}