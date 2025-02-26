/**
 * @description 사용자 제품 목록 페이지
 * @route /users/:username/products
 */

import { ProductCard } from "~/features/products/components/product-card";
import type { Route } from "./+types/profile-products-page";

export const loader = ({ request, params }: Route.LoaderArgs) => {
  return {
    products: [],
  };
};

export const meta: Route.MetaFunction = ({ params }) => {
  return [
    { title: `${params.username}의 제품 | Inf` },
    { name: "description", content: "사용자가 등록한 제품을 확인하세요." },
  ];
};

export default function ProfileProductsPage({ loaderData }: Route.ComponentProps) {
  return (
    <div className="flex flex-col gap-5">
      {Array.from({ length: 10 }).map((_, index) => (
        <ProductCard
          key={index}
          id={`product-${index}`}
          name={`Product ${index}`}
          description={`Product ${index} description`}
          commentCount={12}
          viewCount={120}
          upvoteCount={120}
        />
      ))}
    </div>
  );
}
