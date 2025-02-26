/**
 * @description 사용자 아이디어 대시보드 페이지
 * @route /my/dashboard/ideas
 */

import type { Route } from "./+types/dashboard-ideas-page";
import { Hero } from "~/common/components/hero";

export const loader = ({ request }: Route.LoaderArgs) => {
  return {
    ideas: [],
  };
};

export const meta: Route.MetaFunction = () => {
  return [
    { title: "내 아이디어 | Inf" },
    { name: "description", content: "내가 작성한 아이디어를 관리하세요." },
  ];
};

export default function DashboardIdeasPage({ loaderData }: Route.ComponentProps) {
  return (
    <div className="h-full w-full space-y-5 pl-20">
      <h1 className="mb-6 text-2xl font-semibold">Claimed Ideas</h1>
      <div className="grid grid-cols-4 gap-4">
      </div>
    </div>
  );
}
