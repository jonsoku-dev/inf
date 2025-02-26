/**
 * @description 사용자 프로필 레이아웃
 * @route /users/:username/*
 */

import { Form, Link, NavLink, Outlet } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "~/common/components/ui/avatar";
import { Badge } from "~/common/components/ui/badge";
import { Button, buttonVariants } from "~/common/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/common/components/ui/dialog";
import { Textarea } from "~/common/components/ui/textarea";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/profile-layout";

export const loader = ({ request, params }: Route.LoaderArgs) => {
  return {
    username: params.username,
  };
};

export default function ProfileLayout({ loaderData }: Route.ComponentProps) {
  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4">
        <Avatar className="size-40">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="space-y-5">
          <div className="flex flex-row gap-2">
            <h1 className="text-2xl font-semibold">{loaderData?.username}</h1>
            <Button variant="outline" asChild>
              <Link to="/my/settings">Edit profile</Link>
            </Button>
            <Button variant="secondary">Follow</Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary">Message</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Message</DialogTitle>
                </DialogHeader>
                <DialogDescription className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    {loaderData?.username}님에게 메시지를 보내세요.
                  </p>
                  <Form className="space-y-4">
                    <Textarea placeholder="Message" className="resize-none" rows={4} />
                    <Button type="submit">Send</Button>
                  </Form>
                </DialogDescription>
              </DialogContent>
            </Dialog>
          </div>
          <div>
            <span className="text-muted-foreground text-sm">@john_name</span>
            <Badge variant="secondary">Product Designer</Badge>
            <Badge variant="secondary">100 followers</Badge>
            <Badge variant="secondary">100 following</Badge>
          </div>
        </div>
      </div>
      <div className="flex gap-10">
        {[
          { label: "About", to: `/users/${loaderData?.username}` },
          { label: "Products", to: `/users/${loaderData?.username}/products` },
          { label: "Posts", to: `/users/${loaderData?.username}/posts` },
        ].map((item) => (
          <NavLink
            end
            key={item.label}
            className={({ isActive }) =>
              cn(buttonVariants({ variant: "outline" }), isActive && "bg-accent text-foreground")
            }
            to={item.to}
          >
            {item.label}
          </NavLink>
        ))}
      </div>
      <div className="max-w-screen-md">
        <Outlet />
      </div>
    </div>
  );
}
