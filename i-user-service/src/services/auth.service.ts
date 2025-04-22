import mongoose from "mongoose";
import UserModel from "../models/user.model";
import AccountModel from "../models/account.model";
import RoleModel from "../models/role.model";
import { Roles } from "../common/enums/role.enum";
import {
    BadRequestException,
    NotFoundException,
    UnauthorizedException,
} from "../common/utils/catch-errors";
import { registerDto } from "../common/interface/auth.interface";
import { ErrorCode } from "../common/enums/error-code.enum";
import { ProviderEnum } from "../common/enums/account-provider.enum";

export class AuthService {
    public async loginOrCreateAccount(data: {
        provider: string;
        displayName: string;
        providerId: string;
        picture?: string;
        email?: string;
    }) {
        const { providerId, provider, displayName, email, picture } = data;

        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            console.log("Started Session...");

            let user = await UserModel.findOne({ email }).session(session);

            if (!user) {
                const memberRole = await RoleModel.findOne({
                    name: Roles.MEMBER,
                }).session(session);

                if (!memberRole) {
                    throw new NotFoundException("Member role not found");
                }
                user = new UserModel({
                    email,
                    name: displayName,
                    roleId: memberRole._id,
                    profilePicture: picture || null,
                });
                await user.save({ session });

                const account = new AccountModel({
                    userId: user._id,
                    provider: provider,
                    providerId: providerId,
                });
                await account.save({ session });
            }

            await session.commitTransaction();
            session.endSession();
            console.log("End Session...");

            return { user };
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        } finally {
            session.endSession();
        }
    }
    public async verifyUser({
        email,
        password,
        provider = ProviderEnum.EMAIL,
    }: {
        email: string;
        password: string;
        provider?: string;
    }) {
        const account = await AccountModel.findOne({
            provider,
            providerId: email,
        });
        if (!account) {
            throw new NotFoundException("Invalid email or password");
        }
        const user = await UserModel.findById(account.userId).select(
            "-deletedAt -deletedBy"
        );

        if (!user) {
            throw new NotFoundException("User not found for given account");
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            throw new UnauthorizedException("Invalid email or password");
        }
        return user.omitPassword();
    }
    public async register(registerData: registerDto) {
        const { email, name, password } = registerData;
        const session = await mongoose.startSession();

        try {
            session.startTransaction();

            const existingUser = await UserModel.findOne({ email }).session(
                session
            );
            if (existingUser) {
                throw new BadRequestException(
                    "User already exists with this email",
                    ErrorCode.AUTH_EMAIL_ALREADY_EXISTS
                );
            }
            const memberRole = await RoleModel.findOne({
                name: Roles.MEMBER,
            }).session(session);

            if (!memberRole) {
                throw new NotFoundException("Member role not found");
            }
            const user = new UserModel({
                email,
                name,
                password,
                roleId: memberRole._id,
            });

            await user.save({ session });

            const account = new AccountModel({
                userId: user._id,
                provider: ProviderEnum.EMAIL,
                providerId: email,
            });
            await account.save({ session });

            await session.commitTransaction();
            session.endSession();

            return {
                userId: user._id,
            };
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        } finally {
            session.endSession();
        }
    }
}
