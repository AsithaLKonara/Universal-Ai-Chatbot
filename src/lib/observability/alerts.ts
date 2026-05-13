import { logger } from "../logger";

export type AlertSeverity = "low" | "medium" | "high" | "critical";

export interface Alert {
    id: string;
    type: string;
    severity: AlertSeverity;
    message: string;
    projectId: string;
    meta?: any;
    timestamp: string;
}

export async function triggerAlert(params: {
    type: string;
    severity: AlertSeverity;
    message: string;
    projectId: string;
    meta?: any;
}) {
    const alert: Alert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...params,
        timestamp: new Date().toISOString()
    };

    logger.error(`[ALERT] [${alert.severity.toUpperCase()}] ${alert.message}`, { alert });

    // In a real system, you would send this to Slack, PagerDuty, or a dedicated alert DB
    if (process.env.ALERT_WEBHOOK_URL) {
        try {
            await fetch(process.env.ALERT_WEBHOOK_URL, {
                method: "POST",
                body: JSON.stringify(alert),
                headers: { "Content-Type": "application/json" }
            });
        } catch (err) {
            logger.warn("[ALERT] Failed to send alert webhook", { error: err });
        }
    }

    return alert;
}

// Specialized Alert Triggers

export const alerts = {
    criticalToolFailure: (projectId: string, tool: string, error: string) => 
        triggerAlert({
            type: "tool_failure",
            severity: "critical",
            message: `Critical tool failure: ${tool}`,
            projectId,
            meta: { tool, error }
        }),

    conversionDropDetected: (projectId: string, rate: number) => 
        triggerAlert({
            type: "conversion_drop",
            severity: "high",
            message: `Sudden drop in conversion rate detected: ${rate}%`,
            projectId,
            meta: { currentRate: rate }
        }),

    highAiFallbackRate: (projectId: string, rate: number) => 
        triggerAlert({
            type: "high_fallback_rate",
            severity: "medium",
            message: `High AI fallback rate: ${rate}% of messages requiring human or basic fallback.`,
            projectId,
            meta: { rate }
        })
};
