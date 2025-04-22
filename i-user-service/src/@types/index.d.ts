import { UserDocument } from "../models/user.model";

declare global {
    namespace Express {
        interface User extends UserDocument {
            _id?: any;
        }
        export interface Session {
            regenerate: (callback: () => void) => void;
            save: (callback: () => void) => void;
        }
    }
}
