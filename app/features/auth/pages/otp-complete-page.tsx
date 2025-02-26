/**
 * @description OTP 인증 완료 페이지 컴포넌트
 * @route /auth/otp/complete
 */

import { useNavigate } from "react-router";
import { useEffect } from "react";
import type { Route } from "./+types/otp-complete-page";
import AuthFormContainer from "../components/auth-form-container";
import { Button } from "~/common/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export const loader = ({ request }: Route.LoaderArgs) => {
  return {};
};

export const action = async ({ request }: Route.ActionArgs) => {
  return {};
};

export const meta: Route.MetaFunction = () => {
  return [
    { title: "OTP 인증 완료 | Inf" },
    { name: "description", content: "Inf 서비스 OTP 인증 완료" },
  ];
};

export default function OtpCompletePage({ loaderData, actionData }: Route.ComponentProps) {
  const navigate = useNavigate();

  // 3초 후 메인 페이지로 자동 이동
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <AuthFormContainer
      title="OTP 인증 완료"
      description="OTP 인증이 성공적으로 완료되었습니다"
      redirectLabel="로그인으로 돌아가기"
      redirectTo="/auth/login"
    >
      <div className="flex flex-col items-center gap-6 py-8">
        <CheckCircle2 className="text-primary h-16 w-16" />
        <div className="text-center">
          <p className="text-muted-foreground text-sm">잠시 후 메인 페이지로 자동 이동됩니다</p>
        </div>
        <Button className="w-full" onClick={() => navigate("/")}>
          메인으로 이동
        </Button>
      </div>
    </AuthFormContainer>
  );
}
