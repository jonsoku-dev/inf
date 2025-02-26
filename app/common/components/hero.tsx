/**
 * @description 페이지 상단에 표시되는 Hero 섹션 컴포넌트
 * @component Hero
 * @param {string} title - Hero 섹션의 제목
 * @param {string} description - Hero 섹션의 설명
 * @param {ReactNode} children - 추가적인 컨텐츠를 위한 children prop
 */

import { type ReactNode } from "react";

interface HeroProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function Hero({ title, description, children }: HeroProps) {
  return (
    <div className="from-background to-primary/10 flex flex-col items-center justify-center rounded-md bg-gradient-to-t py-20">
      <h1 className="text-5xl font-bold">{title}</h1>
      {description && <p className="text-foreground text-2xl font-light">{description}</p>}
      {children}
    </div>
  );
}
