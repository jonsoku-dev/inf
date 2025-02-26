/**
 * @description 사용자 프로필 페이지
 * @route /my/profile
 */

import { redirect } from "react-router";
import type { Route } from "./+types/my-profile-page";

export const loader = ({ request }: Route.LoaderArgs) => {
  // find use using the cookies
  return redirect("/users/jonsoku");
};
