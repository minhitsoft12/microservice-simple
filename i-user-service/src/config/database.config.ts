import mongoose from "mongoose";
import { config } from "./app.config";

const connectDatabase = async () => {
    try {
        await mongoose
            .connect(config.MONGO_URI, {})
            .then(() => {
                console.log(`Connected to Mongo database`);
            })
            .catch((error) => {
                console.error(`Error connecting to database: ${error}`);
                process.exit(1);
            });
    } catch (error) {}
};

export default connectDatabase;
