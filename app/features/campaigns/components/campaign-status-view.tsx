import { Badge } from "~/common/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { CAMPAIGN_STATUS } from "../constants";
import { CheckIcon, ClockIcon, XIcon, AlertCircleIcon, FileTextIcon, GlobeIcon, CheckCircleIcon } from "lucide-react";

interface CampaignStatusViewProps {
    status: string;
}

export function CampaignStatusView({ status }: CampaignStatusViewProps) {
    // 상태에 따른 색상 및 아이콘 정보 가져오기
    const getStatusInfo = () => {
        switch (status) {
            case CAMPAIGN_STATUS.DRAFT:
                return {
                    color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
                    icon: <FileTextIcon className="h-4 w-4" />,
                    label: "임시저장"
                };
            case CAMPAIGN_STATUS.PUBLISHED:
                return {
                    color: "bg-green-100 text-green-800 hover:bg-green-100",
                    icon: <GlobeIcon className="h-4 w-4" />,
                    label: "공개"
                };
            case CAMPAIGN_STATUS.CLOSED:
                return {
                    color: "bg-gray-100 text-gray-800 hover:bg-gray-100",
                    icon: <XIcon className="h-4 w-4" />,
                    label: "마감"
                };
            case CAMPAIGN_STATUS.CANCELLED:
                return {
                    color: "bg-red-100 text-red-800 hover:bg-red-100",
                    icon: <AlertCircleIcon className="h-4 w-4" />,
                    label: "취소"
                };
            case CAMPAIGN_STATUS.COMPLETED:
                return {
                    color: "bg-blue-100 text-blue-800 hover:bg-blue-100",
                    icon: <CheckCircleIcon className="h-4 w-4" />,
                    label: "완료"
                };
            default:
                return {
                    color: "bg-gray-100 text-gray-800 hover:bg-gray-100",
                    icon: <ClockIcon className="h-4 w-4" />,
                    label: "알 수 없음"
                };
        }
    };

    // 현재 상태의 진행 단계 계산
    const getStatusProgress = (currentStatus: string) => {
        const statusOrder = [
            CAMPAIGN_STATUS.DRAFT,
            CAMPAIGN_STATUS.PUBLISHED,
            CAMPAIGN_STATUS.CLOSED,
            CAMPAIGN_STATUS.COMPLETED
        ];
        const currentIndex = statusOrder.findIndex(s => s === currentStatus);
        return currentIndex >= 0 ? currentIndex : -1;
    };

    const statusInfo = getStatusInfo();
    const statusProgress = getStatusProgress(status);

    // 상태 흐름 정의
    const statusFlow = [
        {
            status: CAMPAIGN_STATUS.DRAFT,
            label: "임시저장",
            description: "캠페인이 작성 중이거나 검토 대기 중입니다",
            icon: <FileTextIcon className="h-5 w-5" />
        },
        {
            status: CAMPAIGN_STATUS.PUBLISHED,
            label: "공개",
            description: "인플루언서가 지원할 수 있습니다",
            icon: <GlobeIcon className="h-5 w-5" />
        },
        {
            status: CAMPAIGN_STATUS.CLOSED,
            label: "마감",
            description: "더 이상 지원을 받지 않습니다",
            icon: <XIcon className="h-5 w-5" />
        },
        {
            status: CAMPAIGN_STATUS.COMPLETED,
            label: "완료",
            description: "캠페인이 성공적으로 완료되었습니다",
            icon: <CheckCircleIcon className="h-5 w-5" />
        }
    ];

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">캠페인 상태</CardTitle>
                    <Badge className={`${statusInfo.color} flex items-center gap-1`}>
                        {statusInfo.icon}
                        {statusInfo.label}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                {/* 취소된 캠페인 표시 */}
                {status === CAMPAIGN_STATUS.CANCELLED && (
                    <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-800">
                        <div className="flex items-center">
                            <AlertCircleIcon className="mr-2 h-5 w-5" />
                            <span className="font-medium">이 캠페인은 취소되었습니다.</span>
                        </div>
                        <p className="mt-1 ml-7">취소된 캠페인은 더 이상 진행할 수 없습니다.</p>
                    </div>
                )}

                {/* 상태 진행 흐름 */}
                <div className="relative mt-6">
                    <div className="flex justify-between">
                        {statusFlow.map((step, index) => (
                            <div key={step.status} className="flex flex-col items-center relative z-10">
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center 
                                        ${status === CAMPAIGN_STATUS.CANCELLED
                                            ? 'bg-gray-200 text-gray-500'
                                            : statusProgress >= index
                                                ? 'bg-primary text-primary-foreground shadow-md'
                                                : 'bg-gray-100 text-gray-400'
                                        }`}
                                >
                                    {status === CAMPAIGN_STATUS.CANCELLED && index > statusProgress
                                        ? <XIcon className="h-5 w-5" />
                                        : statusProgress > index
                                            ? <CheckIcon className="h-5 w-5" />
                                            : step.icon}
                                </div>
                                <span className={`mt-2 font-medium text-sm 
                                    ${statusProgress >= index ? 'text-primary' : 'text-gray-500'}`}>
                                    {step.label}
                                </span>
                                <span className="text-xs text-gray-500 text-center mt-1 max-w-[120px]">
                                    {step.description}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* 연결선 */}
                    <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 -z-10"></div>

                    {/* 진행된 연결선 */}
                    {status !== CAMPAIGN_STATUS.CANCELLED && statusProgress > 0 && (
                        <div
                            className="absolute top-6 left-0 h-0.5 bg-primary -z-10 transition-all duration-500"
                            style={{
                                width: `${Math.min(100, (statusProgress / (statusFlow.length - 1)) * 100)}%`
                            }}
                        ></div>
                    )}
                </div>

                {/* 상태별 추가 정보 */}
                <div className="mt-8 p-4 bg-gray-50 rounded-md">
                    <h4 className="font-medium mb-2">다음 단계</h4>
                    {status === CAMPAIGN_STATUS.DRAFT && (
                        <p className="text-sm text-gray-600">
                            캠페인을 공개하면 인플루언서들이 지원할 수 있습니다. 모든 정보를 확인하고 공개 버튼을 클릭하세요.
                        </p>
                    )}
                    {status === CAMPAIGN_STATUS.PUBLISHED && (
                        <p className="text-sm text-gray-600">
                            인플루언서의 지원을 기다리는 중입니다. 지원자를 검토하고 협업할 인플루언서를 선택하세요.
                        </p>
                    )}
                    {status === CAMPAIGN_STATUS.CLOSED && (
                        <p className="text-sm text-gray-600">
                            캠페인이 마감되었습니다. 선택된 인플루언서와 협업을 진행하세요.
                        </p>
                    )}
                    {status === CAMPAIGN_STATUS.COMPLETED && (
                        <p className="text-sm text-gray-600">
                            캠페인이 성공적으로 완료되었습니다. 결과를 확인하고 새로운 캠페인을 시작해보세요.
                        </p>
                    )}
                    {status === CAMPAIGN_STATUS.CANCELLED && (
                        <p className="text-sm text-gray-600">
                            캠페인이 취소되었습니다. 새로운 캠페인을 시작하려면 메인 페이지로 이동하세요.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 