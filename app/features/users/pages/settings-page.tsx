/**
 * @description 사용자 설정 페이지
 * @route /my/settings
 */

import type { Route } from "./+types/settings-page";
import { Hero } from "~/common/components/hero";
import { Form } from "react-router";
import InputPair from "~/common/components/input-pair";
import SelectPair from "~/common/components/select-pair";
import { useState } from "react";
import { ImagePair } from "~/common/components/image-pair";
import { Button } from "~/common/components/ui/button";
import { ROLES } from "~/features/users/constants";

export const loader = ({ request }: Route.LoaderArgs) => {
  return {
    settings: {
      // 사용자 설정
    },
  };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  // 설정 업데이트 로직
  return { success: true };
};

export const meta: Route.MetaFunction = () => {
  return [{ title: "설정 | Inf" }, { name: "description", content: "계정 설정을 관리하세요." }];
};

export default function SettingsPage({ loaderData }: Route.ComponentProps) {
  const [avatar, setAvatar] = useState<string | null>(null);
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      setAvatar(URL.createObjectURL(file));
    }
  };
  return (
    <div className="space-y-20">
      <div className="grid grid-cols-6 gap-40">
        <div className="col-span-4 flex flex-col gap-10">
          <h2 className="text-2xl font-semibold">Edit profile</h2>
          <Form className="flex flex-col gap-5">
            <InputPair
              label="Name"
              description="Your public name"
              required
              name="name"
              type="text"
              placeholder="i.e. John Doe"
            />
            <InputPair
              label="Email"
              description="Your email address"
              required
              name="email"
              type="email"
              placeholder="i.e. johndoe@example.com"
            />
            <SelectPair
              label="Role"
              description="What role do you identify with?"
              required
              name="role"
              options={ROLES}
              defaultValue="developer"
            />
            <InputPair
              label="Headline"
              description="An introduction to your profile"
              required
              name="headline"
              type="text"
              placeholder="i.e. I'm a software engineer"
              textArea
            />
            <InputPair
              label="Bio"
              description="Your public bio"
              required
              name="bio"
              type="text"
              placeholder="i.e. I'm a software engineer"
            />
            <Button type="submit" className="w-full">
              Update profile
            </Button>
          </Form>
        </div>
        <aside className="col-span-2 rounded-lg border p-6 shadow-md">
          <div className="flex flex-col gap-5">
            <ImagePair
              id="avatar"
              label="Avatar"
              description="This is the avatar of the user. It should be a square image."
              name="avatar"
              required
              onChange={onChange}
              preview={avatar}
              shape="circle"
            />
            <Button type="submit" className="w-full">
              Update avatar
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
