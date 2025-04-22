import mongoose, { Schema, Document } from "mongoose";
import { compareValue, hashValue } from "../common/utils/bcrypt";
import {
    GenderEnum,
    GenderEnumType,
    MaritalStatusEnum,
    MaritalStatusEnumType,
    UserStatusEnum,
    UserStatusEnumType,
} from "../common/enums/user.enum";

export interface UserDocument extends Document {
    name: string;
    nickName?: string;
    bio?: string;
    email: string;
    password?: string;
    profilePicture?: string | null;
    status: UserStatusEnumType;
    onBoardingCompleted: boolean;
    roleId: mongoose.Types.ObjectId;
    lastLogin: Date | null;
    gender?: GenderEnumType;
    address?: string;
    phone?: string;
    maritalStatus?: MaritalStatusEnumType;
    birthday?: Date;
    createdBy?: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    currentTeam?: mongoose.Types.ObjectId | null;
    comparePassword(value: string): Promise<boolean>;
    omitPassword(): Omit<UserDocument, "password">;
}

const userSchema = new Schema<UserDocument>(
    {
        name: { type: String, required: true, trim: true },
        nickName: { type: String, required: false, trim: true },
        bio: { type: String, required: false, trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        status: {
            type: String,
            enum: Object.values(UserStatusEnum),
            default: UserStatusEnum.ONBOARDING,
            index: true,
        },
        password: { type: String, select: true },
        profilePicture: {
            type: String,
            default: null,
        },
        currentTeam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            default: null,
        },
        roleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role",
            required: true,
        },
        onBoardingCompleted: {
            type: Boolean,
            default: false,
        },

        lastLogin: {
            type: Date,
            default: null,
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },
        address: {
            type: String,
            required: false,
            trim: true,
        },
        phone: {
            type: String,
            required: false,
            trim: true,
            unique: true,
            sparse: true,
        },
        gender: {
            type: String,
            enum: Object.values(GenderEnum),
            required: false,
            default: null,
        },
        maritalStatus: {
            type: String,
            enum: Object.values(MaritalStatusEnum),
            required: false,
            default: null,
        },
        birthday: {
            type: Date,
            required: false,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        if (this.password) {
            this.password = await hashValue(this.password);
        }
    }

    next();
});

userSchema.methods.omitPassword = function (): Omit<UserDocument, "password"> {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

userSchema.methods.comparePassword = async function (value: string) {
    return await compareValue(value, this.password);
};

const UserModel = mongoose.model<UserDocument>("User", userSchema);

export default UserModel;
