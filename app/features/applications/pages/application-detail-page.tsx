import type { Route } from "./+types/application-detail-page";

export const loader = ({ request, params }: Route.LoaderArgs) => {
    return {
        application: {
            id: params.applicationId,
            // ... 지원서 데이터
        },
    };
};

export const meta: Route.MetaFunction = () => {
    return [
        { title: "지원서 상세 | Inf" },
        { name: "description", content: "지원서 상세 정보를 확인하세요" },
    ];
};

export default function ApplicationDetailPage({ loaderData }: Route.ComponentProps) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">지원서 상세</h1>
                <p className="text-muted-foreground text-sm">지원서 상세 정보를 확인하세요</p>
            </div>
            {/* ApplicationDetail 컴포넌트 */}
        </div>
    );
} 