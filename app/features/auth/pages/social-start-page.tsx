/**
 * @description 소셜 로그인 시작 페이지 컴포넌트
 * @route /auth/social/:provider/start
 */

import type { Route } from "./+types/social-start-page";

export const loader = ({ request, params }: Route.LoaderArgs) => {
  return {
    provider: params.provider,
  };
};

export const action = async ({ request }: Route.ActionArgs) => {
  return {};
};

export const meta: Route.MetaFunction = () => {
  return [
    { title: "소셜 로그인 | Inf" },
    { name: "description", content: "Inf 서비스 소셜 로그인" },
  ];
};

export default function SocialStartPage({ loaderData, actionData }: Route.ComponentProps) {
  const { provider } = loaderData;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">소셜 로그인</h1>
        <p className="text-muted-foreground text-sm">{provider} 계정으로 로그인을 진행합니다</p>
      </div>
    </div>
  );
}
