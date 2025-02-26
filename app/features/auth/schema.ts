import { pgTable, uuid } from "drizzle-orm/pg-core";

// Supabase auth 테이블 참조를 위한 스키마 정의
export const auth = pgTable("auth.users", {
  id: uuid("id").primaryKey(),
  // 다른 필드들은 실제로 사용하지 않으므로 정의하지 않아도 됨
});
