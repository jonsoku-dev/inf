/**
 * @description 사용자 게시물 목록 페이지
 * @route /users/:username/posts
 */

import type { Route } from "./+types/profile-posts-page";

export const loader = ({ request, params }: Route.LoaderArgs) => {
  return {
    posts: [],
  };
};

export const meta: Route.MetaFunction = ({ params }) => {
  return [
    { title: `${params.username}의 게시물 | Inf` },
    { name: "description", content: "사용자가 작성한 게시물을 확인하세요." },
  ];
};

export default function ProfilePostsPage({ loaderData }: Route.ComponentProps) {
  return (
    <div className="flex flex-col gap-5">

    </div>
  );
}
