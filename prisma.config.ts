import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // نستخدم الرابط المباشر (المنفذ 5432) حصراً لكي تنجح أوامر إنشاء وتعديل الجداول
    url: env("DIRECT_URL"),
  },
});