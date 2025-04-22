import mongoose, { Document, Schema } from "mongoose";
import {
    Roles,
    RoleStatusEnum,
    RoleStatusEnumType,
    RoleType,
} from "../common/enums/role.enum";

export interface RoleDocument extends Document {
    name: RoleType;
    description?: string;
    status?: RoleStatusEnumType;
    permissions: mongoose.Types.ObjectId[];
}

const roleSchema = new Schema<RoleDocument>(
    {
        name: {
            type: String,
            enum: Object.values(Roles),
            required: true,
            unique: true,
        },
        permissions: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Permission",
                },
            ],
            required: false,
            index: true,
            default: [],
        },
        description: {
            type: String,
            required: false,
            trim: true,
        },
        status: {
            type: String,
            enum: Object.values(RoleStatusEnum),
            default: RoleStatusEnum.ACTIVE,
            index: true,
        },
    },
    { timestamps: true }
);

const RoleModel = mongoose.model<RoleDocument>("Role", roleSchema);

export default RoleModel;
