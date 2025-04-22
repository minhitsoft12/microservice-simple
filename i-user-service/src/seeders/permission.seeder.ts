import "dotenv/config";

import mongoose from "mongoose";
import connectDatabase from "../config/database.config";
import {Permissions} from "../common/enums/role.enum";
import PermissionModel from "../models/permission.model";
import {TransactionCheckResult, withTransactionMode} from "./index.seeder";

export const seedPermissions = async (transactionSupported: TransactionCheckResult) => {
    console.log("Seeding Permissions started...");
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

    console.log("Clear existing Permissions...");
    await PermissionModel.deleteMany({}, session && {session});

    for (const permissionName in Permissions) {
        let existingPermission;

        if (session) {
            existingPermission = await PermissionModel.findOne({
                name: permissionName,
            }).session(session)
        } else {
            existingPermission = await PermissionModel.findOne({
                name: permissionName,
            })
        }

        if (!existingPermission) {
            const newPermission = new PermissionModel({
                name: permissionName,
            });

            await newPermission.save(session && {session});
            console.log(`Permission ${permissionName} created is successfully.`);
        } else {
            console.log(`Permission ${permissionName} already exists.`);
        }
    }
}