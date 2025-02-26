/**
 * @description 사용자 프로필 메인 페이지
 * @route /users/:username
 */

import type { Route } from "./+types/profile-page";

export const loader = ({ request, params }: Route.LoaderArgs) => {
  return {
    user: {
      username: params.username,
      bio: "안녕하세요!",
      avatarUrl: "https://github.com/shadcn.png",
    },
  };
};

export const meta: Route.MetaFunction = ({ params }) => {
  return [
    { title: `${params.username}의 프로필 | Inf` },
    { name: "description", content: "사용자의 프로필을 확인하세요." },
  ];
};

export default function ProfilePage({ loaderData }: Route.ComponentProps) {
  return (
    <div className="flex max-w-screen-md flex-col space-y-10">
      <div className="space-y-2">
        <h4 className="text-lg font-semibold">Headline</h4>
        <p className="text-muted-foreground">
          I&apos;m a product designer on the Korea, I like to design simple and intuitive products.
        </p>
      </div>

      <div className="space-y-2">
        <h4 className="text-lg font-semibold">Headline</h4>
        <p className="text-muted-foreground">
          I&apos;m a product designer on the Korea, I like to design simple and intuitive products.
        </p>
      </div>
    </div>
  );
}
