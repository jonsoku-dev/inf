/**
 * @description 개별 메시지 페이지
 * @route /my/messages/:messageId
 */

import { SendIcon } from "lucide-react";
import { Form } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "~/common/components/ui/avatar";
import { Button } from "~/common/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Textarea } from "~/common/components/ui/textarea";
import { MessageBubble } from "../components/message-bubble";
import type { Route } from "./+types/message-page";

export const loader = ({ request, params }: Route.LoaderArgs) => {
  return {
    message: {
      id: params.messageId,
      messages: [
        {
          id: "1",
          message: "안녕하세요, 상품에 관심이 있어서 연락드립니다.",
          timestamp: "2024-03-20T10:00:00",
          avatarUrl: "https://github.com/shadcn.png",
          fallback: "JD",
        },
        {
          id: "2",
          message: "네, 어떤 점이 궁금하신가요?",
          timestamp: "2024-03-20T10:05:00",
          avatarUrl: "https://github.com/shadcn.png",
          fallback: "ME",
        },
        {
          id: "3",
          message: "네, 어떤 점이 궁금하신가요?",
          timestamp: "2024-03-20T10:05:00",
          avatarUrl: "https://github.com/shadcn.png",
          fallback: "ME",
        },
        {
          id: "4",
          message: "네, 어떤 점이 궁금하신가요?",
          timestamp: "2024-03-20T10:05:00",
          avatarUrl: "https://github.com/shadcn.png",
          fallback: "ME",
        },
        {
          id: "5",
          message: "네, 어떤 점이 궁금하신가요?",
          timestamp: "2024-03-20T10:05:00",
          avatarUrl: "https://github.com/shadcn.png",
          fallback: "ME",
        },
        {
          id: "6",
          message: "네, 어떤 점이 궁금하신가요?",
          timestamp: "2024-03-20T10:05:00",
          avatarUrl: "https://github.com/shadcn.png",
          fallback: "ME",
        },
        {
          id: "7",
          message: "네, 어떤 점이 궁금하신가요?",
          timestamp: "2024-03-20T10:05:00",
          avatarUrl: "https://github.com/shadcn.png",
          fallback: "ME",
        },
      ],
    },
  };
};

export const action = async ({ request }: Route.LoaderArgs) => {
  const formData = await request.formData();
  // 메시지 전송 로직
  return { success: true };
};

export const meta: Route.MetaFunction = () => {
  return [
    { title: "메시지 상세 | Inf" },
    { name: "description", content: "메시지를 확인하세요." },
  ];
};

export default function MessagePage({ loaderData }: Route.ComponentProps) {
  return (
    <div className="flex h-full flex-col justify-between pl-60">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="size-14">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0">
            <CardTitle>John Doe</CardTitle>
            <CardDescription>2 days ago</CardDescription>
          </div>
        </CardHeader>
      </Card>
      <div className="flex h-full flex-col justify-start overflow-y-scroll py-10">
        {loaderData.message.messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message.message}
            avatarUrl={message.avatarUrl}
            fallback={message.fallback}
            isSender={index % 2 === 0}
            timestamp={message.timestamp}
          />
        ))}
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Form className="relative flex w-full items-center justify-end">
            <Textarea placeholder="메시지를 입력하세요..." className="resize-none" />
            <Button type="submit" size="icon" className="absolute top-2 right-2">
              <SendIcon className="size-4" />
            </Button>
          </Form>
        </CardHeader>
      </Card>
    </div>
  );
}
