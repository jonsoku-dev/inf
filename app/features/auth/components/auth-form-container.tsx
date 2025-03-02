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
    <div className="flex w-full flex-col items-center justify-center">
      <div className="mb-4 flex w-full items-center justify-between md:mb-0 md:justify-end">
        <Link to="/" className="text-lg font-bold md:hidden">Inf</Link>
        <Button variant="ghost" className="text-sm" asChild>
          <Link to={redirectTo}>{redirectLabel}</Link>
        </Button>
      </div>

      <div className="flex w-full max-w-md flex-col items-center justify-center gap-6 md:gap-10">
        <div className="text-center">
          <h1 className="mb-2 text-xl font-semibold tracking-tight md:text-2xl">{title}</h1>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
