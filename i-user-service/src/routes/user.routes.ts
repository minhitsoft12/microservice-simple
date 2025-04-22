import {Router} from "express";
import {userController} from "../modules/user.module";

const userRoutes = Router();

userRoutes.get("/", userController.getAllUsers.DEFAULT);
userRoutes.post("/", userController.createUser.DEFAULT);
userRoutes.get("/current", userController.getProfile.DEFAULT);
userRoutes.put("/current", userController.updateProfile.DEFAULT);
userRoutes.get("/:id", userController.getUser.DEFAULT);
userRoutes.put("/:id", userController.updateUser.DEFAULT);
userRoutes.delete("/:id", userController.deleteUser.DEFAULT);

export default userRoutes;
