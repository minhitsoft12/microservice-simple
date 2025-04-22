import mongoose, { Document } from "mongoose";
import {
    PermissionStatusEnum,
    PermissionStatusEnumType,
} from "../common/enums/role.enum";

export interface PermissionDocument extends Document {
    name: string;
    description?: string;
    status: PermissionStatusEnumType;
    createdBy?: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    deletedBy: mongoose.Types.ObjectId | null;
}

const permissionSchema = new mongoose.Schema<PermissionDocument>(
    {
        name: { type: String, required: true, trim: true, unique: true },
        description: { type: String, required: false, trim: true },
        status: {
            type: String,
            enum: Object.values(PermissionStatusEnum),
            default: PermissionStatusEnum.ACTIVE,
            index: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },
        deletedAt: { type: Date, default: null },
        deletedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    { timestamps: true }
);

const PermissionModel = mongoose.model<PermissionDocument>(
    "Permission",
    permissionSchema
);
export default PermissionModel;
