import {
  pgEnum,
  pgSchema,
  pgTable,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core";
import { ROLES } from "~/features/users/constants";
import { auth } from "~/features/auth/schema";

// supabase에서 이미 만들어져있지만 drizzle orm 때문에 다시 만들어줘야함. 즉 코드레벨에서만관리되는것.
// export 를 풀면 drizzle migration이 자동으로 생성되지 않음.
const users = pgSchema("auth").table("users", {
  id: uuid().primaryKey(),
});
export const roles = pgEnum("role", ROLES.map((role) => role.value) as [string, ...string[]]);

export const profiles = pgTable("profiles", {
  profile_id: uuid("profile_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text().notNull(),
  username: text().notNull(),
  role: roles("role").default(ROLES[0].value),
  line_user_id: text(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});