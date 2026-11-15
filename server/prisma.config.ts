import "dotenv/config"; // משיכת הנתונים בצורה מאובטחת
import { defineConfig } from "prisma/config";

export default defineConfig({
    datasource: {
        url: process.env.DATABASE_URL,
    },
});