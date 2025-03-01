import type { Database } from "database-generated.types";

export type Campaign = Database["public"]["Tables"]["campaigns"]["Row"] & {
    advertiser?: {
        name: string;
        username: string;
    };
}; 