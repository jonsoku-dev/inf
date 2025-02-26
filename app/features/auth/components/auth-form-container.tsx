/**
 * @description 인증 관련 폼(로그인/회원가입)의 공통 컨테이너 컴포넌트
 * @component AuthFormContainer
 * @param {object} props
 * @param {ReactNode} props.children - 폼 내용
 * @param {string} props.title - 폼 제목
 * @param {string} props.description - 폼 설명
 * @param {string} props.redirectLabel - 리다이렉트 버튼 텍스트
 * @param {string} props.redirectTo - 리다이렉트 경로
 */

import type { ReactNode } from "react";
import { Link } from "react-router";
import { Button } from "~/common/components/ui/button";

interface AuthFormContainerProps {
  children: ReactNode;
  title: string;
  description: string;
  redirectLabel: string;
  redirectTo: string;
}

export default function AuthFormContainer({
  children,
  title,
  description,
  redirectLabel,
  redirectTo,
}: AuthFormContainerProps) {
  return (
    <div className="flex flex-col items-center justify-center">
      <Button variant="ghost" className="absolute top-8 right-8" asChild>
        <Link to={redirectTo}>{redirectLabel}</Link>
      </Button>

      <div className="flex w-full max-w-md flex-col items-center justify-center gap-10">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground text-sm">{description}</p>
        {children}
      </div>
    </div>
  );
}
