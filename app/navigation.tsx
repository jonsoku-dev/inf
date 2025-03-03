import type { IconName } from "~/common/components/ui/icon";

export interface NavigationItem {
    title: string;
    href: string;
    icon?: IconName;
    children?: NavigationItem[];
}

export const adminNavigation: NavigationItem[] = [
    {
        title: "대시보드",
        href: "/admin",
        icon: "dashboard",
    },
    {
        title: "캠페인 관리",
        href: "/admin/campaigns",
        icon: "campaign",
        children: [
            {
                title: "캠페인 목록",
                href: "/admin/campaigns",
            },
            {
                title: "새 캠페인 등록",
                href: "/admin/campaigns/new",
            },
            {
                title: "신청 관리",
                href: "/admin/applications",
            }
        ]
    },
    {
        title: "인플루언서 관리",
        href: "/admin/influencers",
        icon: "person",
    },
    {
        title: "사용자 관리",
        href: "/admin/users",
        icon: "people",
    },
    {
        title: "알림 관리",
        href: "/admin/notifications",
        icon: "notifications",
    },
    {
        title: "설정",
        href: "/admin/settings",
        icon: "settings",
    },
];

export const userNavigation: NavigationItem[] = [
    {
        title: "대시보드",
        href: "/dashboard",
        icon: "dashboard",
    },
    {
        title: "캠페인",
        href: "/campaigns",
        icon: "campaign",
    },
    {
        title: "신청 내역",
        href: "/applications",
        icon: "description",
    },
    {
        title: "메시지",
        href: "/messages",
        icon: "chat",
    },
    {
        title: "프로필",
        href: "/profile",
        icon: "person",
    },
    {
        title: "설정",
        href: "/settings",
        icon: "settings",
    },
];

export const influencerNavigation: NavigationItem[] = [
    {
        title: "대시보드",
        href: "/dashboard",
        icon: "dashboard",
    },
    {
        title: "캠페인 찾기",
        href: "/campaigns",
        icon: "search",
    },
    {
        title: "내 신청",
        href: "/applications",
        icon: "description",
    },
    {
        title: "메시지",
        href: "/messages",
        icon: "chat",
    },
    {
        title: "프로필",
        href: "/profile",
        icon: "person",
    },
    {
        title: "설정",
        href: "/settings",
        icon: "settings",
    },
];

export const advertiserNavigation: NavigationItem[] = [
    {
        title: "대시보드",
        href: "/dashboard",
        icon: "dashboard",
    },
    {
        title: "내 캠페인",
        href: "/campaigns",
        icon: "campaign",
    },
    {
        title: "신청 관리",
        href: "/applications",
        icon: "description",
    },
    {
        title: "메시지",
        href: "/messages",
        icon: "chat",
    },
    {
        title: "프로필",
        href: "/profile",
        icon: "person",
    },
    {
        title: "설정",
        href: "/settings",
        icon: "settings",
    },
]; 