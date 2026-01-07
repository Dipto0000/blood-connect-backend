import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";

async function main() {
    try {
        // Connect to MongoDB
        await mongoose.connect(envVars.DB_URL);
        console.log("✅ Connected to MongoDB");

        // Start the server
        app.listen(Number(envVars.PORT), () => {
            console.log(`🚀 Server is running on port ${envVars.PORT}`);
        });
    } catch (error) {
        console.error("❌ Failed to connect to database:", error);
        process.exit(1);
    }
}

main();
