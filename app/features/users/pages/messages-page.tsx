/**
 * @description 사용자 메시지 목록 페이지
 * @route /my/messages
 */

import { MessageCircleIcon } from "lucide-react";
import type { Route } from "./+types/messages-page";
import { Hero } from "~/common/components/hero";

export const loader = ({ request }: Route.LoaderArgs) => {
  return {
    messages: [],
  };
};

export const meta: Route.MetaFunction = () => {
  return [{ title: "메시지 | Inf" }, { name: "description", content: "메시지를 확인하세요." }];
};

export default function MessagesPage({ loaderData }: Route.ComponentProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4">
      <MessageCircleIcon className="text-muted-foreground size-12 size-16" />
      <h1 className="text-muted-foreground text-2xl font-semibold">
        Click on a message in the sidebar to view it.
      </h1>
    </div>
  );
}
