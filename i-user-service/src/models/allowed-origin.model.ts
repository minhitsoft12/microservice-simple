import mongoose from "mongoose";

export interface AllowedOriginDocument extends Document {
    origin: string;
    isActive: boolean;
    description?: string;
    createdBy?: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    deletedBy: mongoose.Types.ObjectId | null;
}
const allowedOriginSchema = new mongoose.Schema<AllowedOriginDocument>(
    {
        origin: { type: String, required: true, unique: true },
        isActive: { type: Boolean, default: true },
        description: { type: String, required: false, trim: true },
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
const AllowedOriginModel = mongoose.model<AllowedOriginDocument>(
    "AllowedOrigin",
    allowedOriginSchema
);
export default AllowedOriginModel;
