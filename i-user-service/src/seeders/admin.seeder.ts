import "dotenv/config";
import connectDatabase from "../config/database.config";
import mongoose from "mongoose";
import UserModel from "../models/user.model";
import RoleModel from "../models/role.model";
import {
    Permissions,
    PermissionStatusEnum,
    Roles,
} from "../common/enums/role.enum";

import { defaultAdminAccount } from "../config/app.config";
import { NotFoundException } from "../common/utils/catch-errors";
import AccountModel from "../models/account.model";
import { ProviderEnum } from "../common/enums/account-provider.enum";
import PermissionModel from "../models/permission.model";
import {TransactionCheckResult} from "./index.seeder";

export const seedAdmin = async (_transactionSupported: TransactionCheckResult) => {
    console.log("Seeding users started...");
    try {
        await connectDatabase();

        const role = await RoleModel.findOne({
            name: Roles.ADMIN,
        }).select("_id name");

        if (!role) {
            throw new NotFoundException("Admin role not found");
        }

        const permission = await PermissionModel.find();
        if (permission.length > 0) {
            console.log("Updating permissions for role: ", role.name);

            await RoleModel.updateOne(
                { _id: role._id },
                {
                    $set: {
                        permissions: permission.map((perm) => perm._id),
                    },
                }
            );
        }

        const existingAdmin = await UserModel.findOne({
            email: defaultAdminAccount.email,
        });

        if (existingAdmin) {
            console.log("Admin account already exists.");
            await UserModel.findOneAndUpdate(
                { email: defaultAdminAccount.email },
                {
                    roleId: role._id,
                }
            ).lean();

            return;
        }

        const admin = new UserModel({
            ...defaultAdminAccount,
            roleId: role._id,
        });
        await admin.save();

        const account = new AccountModel({
            userId: admin._id,
            provider: ProviderEnum.EMAIL,
            providerId: admin.email,
        });
        await account.save();
    } catch (error) {
        console.error("Error during seeding: ", error);
    }
};
