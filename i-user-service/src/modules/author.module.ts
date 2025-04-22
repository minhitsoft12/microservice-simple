import {AuthorService} from "../services/author.service";
import {PermissionController, RoleController} from "../controllers/authorize.controller";

const authorService = new AuthorService();

const roleController = new RoleController(authorService);
const permissionController = new PermissionController(authorService);

export {roleController, permissionController, authorService};
