import { ALERT_TYPE } from "../constants";
import { AlertService } from "../services/alert-service";

interface CampaignCreatedAlertParams {
    request: Request;
    campaignId: string;
    campaignTitle: string;
    recipientIds: string[];
}

/**
 * 캠페인 생성 알림을 보냅니다
 */
export async function sendCampaignCreatedAlert({
    request,
    campaignId,
    campaignTitle,
    recipientIds
}: CampaignCreatedAlertParams) {
    const title = "새로운 캠페인이 등록되었습니다";
    const content = `"${campaignTitle}" 캠페인이 새롭게 등록되었습니다.`;
    const link = `/campaigns/${campaignId}`;

    const promises = recipientIds.map(recipientId =>
        AlertService.createAlert({
            recipientId,
            alertType: ALERT_TYPE.CAMPAIGN_CREATED,
            title,
            content,
            link,
            isImportant: false
        }, request)
    );

    await Promise.all(promises);
}

interface ApplicationReceivedAlertParams {
    request: Request;
    applicationId: string;
    campaignId: string;
    campaignTitle: string;
    recipientId: string;
}

/**
 * 지원서 접수 알림을 보냅니다
 */
export async function sendApplicationReceivedAlert({
    request,
    applicationId,
    campaignId,
    campaignTitle,
    recipientId
}: ApplicationReceivedAlertParams) {
    const title = "새로운 지원서가 접수되었습니다";
    const content = `"${campaignTitle}" 캠페인에 새로운 지원서가 접수되었습니다.`;
    const link = `/my/campaigns/${campaignId}/applications`;

    await AlertService.createAlert({
        recipientId,
        alertType: ALERT_TYPE.APPLICATION_RECEIVED,
        title,
        content,
        link,
        isImportant: true
    }, request);
}

interface ApplicationAcceptedAlertParams {
    request: Request;
    applicationId: string;
    campaignId: string;
    campaignTitle: string;
    recipientId: string;
}

/**
 * 지원 승인 알림을 보냅니다
 */
export async function sendApplicationAcceptedAlert({
    request,
    applicationId,
    campaignId,
    campaignTitle,
    recipientId
}: ApplicationAcceptedAlertParams) {
    const title = "지원서가 승인되었습니다";
    const content = `"${campaignTitle}" 캠페인에 대한 지원이 승인되었습니다.`;
    const link = `/my/applications/${applicationId}`;

    await AlertService.createAlert({
        recipientId,
        alertType: ALERT_TYPE.APPLICATION_ACCEPTED,
        title,
        content,
        link,
        isImportant: true
    }, request);
}

interface ApplicationRejectedAlertParams {
    request: Request;
    applicationId: string;
    campaignId: string;
    campaignTitle: string;
    recipientId: string;
}

/**
 * 지원 거절 알림을 보냅니다
 */
export async function sendApplicationRejectedAlert({
    request,
    applicationId,
    campaignId,
    campaignTitle,
    recipientId
}: ApplicationRejectedAlertParams) {
    const title = "지원서가 거절되었습니다";
    const content = `"${campaignTitle}" 캠페인에 대한 지원이 거절되었습니다.`;
    const link = `/campaigns`;

    await AlertService.createAlert({
        recipientId,
        alertType: ALERT_TYPE.APPLICATION_REJECTED,
        title,
        content,
        link,
        isImportant: false
    }, request);
}

interface ProposalReceivedAlertParams {
    request: Request;
    proposalId: string;
    proposalTitle: string;
    senderName: string;
    recipientId: string;
}

/**
 * 제안 수신 알림을 보냅니다
 */
export async function sendProposalReceivedAlert({
    request,
    proposalId,
    proposalTitle,
    senderName,
    recipientId
}: ProposalReceivedAlertParams) {
    const title = "새 제안이 도착했습니다";
    const content = `${senderName}님이 "${proposalTitle}" 제안을 보냈습니다.`;
    const link = `/my/proposals/received/${proposalId}`;

    await AlertService.createAlert({
        recipientId,
        alertType: ALERT_TYPE.PROPOSAL_RECEIVED,
        title,
        content,
        link,
        isImportant: true
    }, request);
}

interface SystemAlertParams {
    request: Request;
    title: string;
    content: string;
    recipientIds: string[];
    link: string;
    isImportant?: boolean;
}

/**
 * 시스템 알림을 보냅니다
 */
export async function sendSystemAlert({
    request,
    title,
    content,
    recipientIds,
    link,
    isImportant = false
}: SystemAlertParams) {
    const promises = recipientIds.map(recipientId =>
        AlertService.createAlert({
            recipientId,
            alertType: ALERT_TYPE.SYSTEM_NOTIFICATION,
            title,
            content,
            link,
            isImportant
        }, request)
    );

    await Promise.all(promises);
} 