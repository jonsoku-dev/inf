import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

// Composer prompt: create all the files for the routes in the file

export default [
    // 공통 페이지
    index("common/pages/home-page.tsx"),

    // 인증 관련 라우트
    ...prefix("auth", [
        layout("features/auth/layouts/auth-layout.tsx", [
            route("/login", "features/auth/pages/login-page.tsx"),
            route("/join", "features/auth/pages/join-page.tsx"),
            route("/logout", "features/auth/pages/logout-page.tsx"),
            ...prefix("/otp", [
                route("/start", "features/auth/pages/otp-start-page.tsx"),
                route("/complete", "features/auth/pages/otp-complete-page.tsx"),
            ]),
            ...prefix("/social/:provider", [
                route("/start", "features/auth/pages/social-start-page.tsx"),
                route("/complete", "features/auth/pages/social-complete-page.tsx"),
            ]),
        ]),
    ]),

    // 사용자 계정 관련 라우트 (인증된 모든 사용자)
    ...prefix("/my", [
        // 알림 관련 라우트
        ...prefix("/alerts", [
            index("features/alerts/pages/alerts-page.tsx"),
            route("/settings", "features/alerts/pages/alert-settings-page.tsx"),
        ]),
    ]),

    // 캠페인 관련 라우트
    ...prefix("/campaigns", [
        // 공개 페이지
        index("features/campaigns/pages/public/list-page.tsx"),
        route("/:campaignId", "features/campaigns/pages/public/detail-page.tsx"),

        // 인플루언서용 페이지
        ...prefix("/influencer", [
            layout("features/campaigns/layouts/influencer-layout.tsx", [
                index("features/campaigns/pages/influencer/list-page.tsx"),
                route("/:campaignId", "features/campaigns/pages/influencer/detail-page.tsx"),
                route("/:campaignId/apply", "features/campaigns/pages/influencer/apply-page.tsx"),
            ]),
        ]),

        // 광고주용 페이지
        ...prefix("/advertiser", [
            layout("features/campaigns/layouts/advertiser-layout.tsx", [
                index("features/campaigns/pages/advertiser/list-page.tsx"),
                route("/new", "features/campaigns/pages/advertiser/new-page.tsx"),
                route("/:campaignId", "features/campaigns/pages/advertiser/detail-page.tsx"),
                route("/:campaignId/edit", "features/campaigns/pages/advertiser/edit-page.tsx"),
                route("/:campaignId/applications", "features/campaigns/pages/advertiser/applications-page.tsx"),
            ]),
        ]),

        // // 관리자용 페이지
        // ...prefix("/admin", [
        //     layout("features/campaigns/layouts/admin-layout.tsx", [
        //         index("features/campaigns/pages/admin/list-page.tsx"),
        //         route("/:campaignId", "features/campaigns/pages/admin/detail-page.tsx"),
        //         route("/:campaignId/edit", "features/campaigns/pages/admin/edit-page.tsx"),
        //     ]),
        // ]),
    ]),

    // 인플루언서 페이지
    ...prefix("/influencer", [
        // 공개 페이지 (모든 사용자가 접근 가능)
        ...prefix("/public", [
            index("features/influencers/pages/public/list-page.tsx"),
            route("/:influencerId", "features/influencers/pages/public/detail-page.tsx"),
        ]),

        // 인플루언서 전용 페이지 (인플루언서만 접근 가능)
        ...prefix("/my", [
            layout("features/influencers/layouts/influencer-profile-layout.tsx", [
                index("features/influencers/pages/my/overview-page.tsx"),
                route("/edit", "features/influencers/pages/my/edit-page.tsx"),
                route("/stats", "features/influencers/pages/my/stats-page.tsx"),
                route("/verifications", "features/influencers/pages/my/verifications-page.tsx"),
                route("/settings", "features/influencers/pages/my/settings-page.tsx"),
            ]),
        ]),
    ]),

    // 제안 관련 페이지
    ...prefix("/proposals", [
        // 공개 페이지 (모든 사용자가 접근 가능)
        ...prefix("/public", [
            index("features/proposals/pages/public/list-page.tsx"),
            route("/:proposalId", "features/proposals/pages/public/detail-page.tsx"),
            route("/:proposalId/apply", "features/proposals/pages/public/apply-page.tsx"),
        ]),

        // 인플루언서 전용 페이지
        ...prefix("/influencer", [
            layout("features/proposals/layouts/influencer-layout.tsx", [
                index("features/proposals/pages/influencer/list-page.tsx"),
                route("/new", "features/proposals/pages/influencer/new-page.tsx"),
                route("/:proposalId", "features/proposals/pages/influencer/detail-page.tsx"),
                route("/:proposalId/edit", "features/proposals/pages/influencer/edit-page.tsx"),
                route("/:proposalId/applications", "features/proposals/pages/influencer/applications-page.tsx"),
            ]),
        ]),

        // 광고주 전용 페이지
        ...prefix("/advertiser", [
            layout("features/proposals/layouts/advertiser-layout.tsx", [
                route("/list", "features/proposals/pages/advertiser/list-page.tsx"),
                route("/direct", "features/proposals/pages/advertiser/direct-page.tsx"),
                route("/:proposalId", "features/proposals/pages/advertiser/detail-page.tsx"),
                route("/:proposalId/apply", "features/proposals/pages/advertiser/apply-page.tsx"),
                route("/applications", "features/proposals/pages/advertiser/applications-page.tsx"),
                route("/applications/:applicationId", "features/proposals/pages/advertiser/application-detail-page.tsx"),
            ]),
        ]),
    ]),

    // 기존 라우트에 추가
    ...prefix("/notifications", [
        index("features/notifications/pages/notifications-page.tsx"),
    ]),

    ...prefix("/admin", [
        ...prefix("/notifications", [
            index("features/notifications/pages/admin/notifications-admin-page.tsx"),
            route("/:id", "features/notifications/pages/admin/notification-form-page.tsx"),
        ]),
    ]),
] satisfies RouteConfig;
