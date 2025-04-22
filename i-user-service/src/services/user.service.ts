import {ProviderEnum} from "../common/enums/account-provider.enum";
import {ErrorCode} from "../common/enums/error-code.enum";
import {UserStatusEnum} from "../common/enums/user.enum";
import {FilterQuery} from "../common/interface/filter.interface";
import {BadRequestException} from "../common/utils/catch-errors";
import AccountModel from "../models/account.model";
// import MemberModel from "../models/member.model";
import RoleModel, {RoleDocument} from "../models/role.model";
// import { TeamDocument } from "../models/team.model";
import UserModel, {UserDocument} from "../models/user.model";
import {BaseService} from "./base.service";

export class UserService extends BaseService {
    // public getAllTeamsOfUser = async (
    //     userId: string
    // ): Promise<{ teams: Array<any> }> => {
    //     const teams = await MemberModel.find({ userId })
    //         .populate("teamId", "_id name isActive")
    //         .select("teamId");

    //     return {
    //         teams,
    //     };
    // };
    public getCurrentUser = async (userId: string): Promise<any> => {
            const user = await UserModel.findById(userId)
            // .populate("currentTeam", "_id name")
            .populate("roleId", "_id name")
            .select("-password -deletedAt -deletedBy");

        if (!user) {
            throw new BadRequestException("User not found");
        }

        return {
            user,
        };
    };
    public updateCurrentUser = async (
        userId: string,
        body: {
            name?: string;
            bio?: string;
            nickName?: string;
            profilePicture?: string;
        }
    ): Promise<{ user: UserDocument }> => {
        const user = await UserModel.findOneAndUpdate(
            { _id: userId, deletedAt: null },
            {
                ...body,
                onBoardingCompleted: true,
                updatedBy: userId,
                updatedAt: new Date(),
            },
            { new: true }
        )
            .populate("roleId", "_id name")
            // .populate("currentTeam", "_id name")
            .select("-password");

        if (!user) {
            throw new BadRequestException("User not found");
        }
        return {
            user,
        };
    };
    public getAllUsers = async (
        query: FilterQuery
    ): Promise<{
        users: Array<UserDocument>;
        totalCount: number;
        totalPage: number;
        page: number;
        skip: number;
        limit: number;
    }> => {
        const { limit, skip, page } = query.pagination;
        const { field, order } = query.sort;
        const { search, filters } = query;

        const searchFilter = search
            ? { $or: [{ name: search }, { email: search }] }
            : {};

        const filter = { ...searchFilter, ...filters, deletedAt: null };

        const [usersData, totalCount] = await Promise.all([
            UserModel.find(filter)
                .skip(skip)
                .limit(limit)
                .sort({ [field]: order })
                .populate({ path: "roleId", select: "_id name" })
                .select("-password -deletedBy")
                .lean(),

            UserModel.countDocuments(filter),
        ]);

        const totalPage = Math.ceil(totalCount / limit);

        return {
            users: usersData,
            totalCount,
            totalPage,
            page,
            skip,
            limit,
        };
    };
    public getUserById = async (
        userId: string
    ): Promise<{ user: UserDocument }> => {
        const user = await UserModel.findById(userId)
            .populate("roleId", "_id name")
            .populate("currentTeam", "_id name")
            .select("-password -deletedAt -deletedBy");

        if (!user) {
            throw new BadRequestException("User not found");
        }

        return {
            user,
        };
    };
    public updateUser = async (
        userId: string,
        updatedByUser: string,
        body: {
            name?: string;
            bio?: string;
            nickName?: string;
            profilePicture?: string;
            isActive?: boolean;
            status?: string;
            roleId?: string;
            teams?: string[];
            lastLogin?: Date;
            onBoardingCompleted?: boolean;
        }
    ): Promise<{ user: UserDocument }> => {
        const { teams, ...userBody } = body;
        const user = await UserModel.findOneAndUpdate(
          {_id: userId, deletedAt: null},
            {
                ...userBody,
                updatedBy: updatedByUser,
                updatedAt: new Date(),
            },
            { new: true }
        )
            .populate("roleId", "_id name")
            // .populate("currentTeam", "_id name")
            .select("-password");

        if (!user) {
            throw new BadRequestException("User not found");
        }
        return {
            user,
        };
    };
    public createUser = async (
        userId: string,
        body: {
            name: string;
            email: string;
            roleId: string;
        }
    ): Promise<{ user: UserDocument }> => {
        let user = await UserModel.findOne({ email: body.email });
        if (user) {
            throw new BadRequestException(
                "User already exists with this email",
                ErrorCode.AUTH_EMAIL_ALREADY_EXISTS
            );
        }
        const role = await RoleModel.findOne({
            _id: body.roleId,
        });
        if (!role) {
            throw new BadRequestException("Role not found");
        }
        user = new UserModel({
            email: body.email,
            name: body.name,
            roleId: role._id,
            status: UserStatusEnum.ONBOARDING,
            createdBy: userId,
            updatedBy: userId,
        });
        await user.save();

        const account = new AccountModel({
            userId: user._id,
            provider: ProviderEnum.EMAIL,
            providerId: body.email,
        });
        await account.save();

        return {
            user,
        };
    };

    public getAllRoles = async (): Promise<{ roles: RoleDocument[] }> => {
        const roles = await RoleModel.find().select("_id name");
        return {
            roles,
        };
    };
}
