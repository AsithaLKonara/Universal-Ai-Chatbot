export enum GoalType {
    REVENUE = "REVENUE",
    RETENTION = "RETENTION",
    CONVERSION = "CONVERSION",
    ENGAGEMENT = "ENGAGEMENT",
    SUPPORT = "SUPPORT"
}

export interface RuntimeGoal {
    type: GoalType;
    label: string;
    priority: number;
    active: boolean;
    metrics: {
        target: number;
        current: number;
        unit: string;
    };
}

const GLOBAL_GOALS: RuntimeGoal[] = [
    {
        type: GoalType.CONVERSION,
        label: "Improve checkout completion rate",
        priority: 10,
        active: true,
        metrics: { target: 0.35, current: 0.15, unit: "ratio" }
    },
    {
        type: GoalType.REVENUE,
        label: "Maximize average order value",
        priority: 8,
        active: true,
        metrics: { target: 150, current: 85, unit: "USD" }
    }
];

export function getActiveGoals(): RuntimeGoal[] {
    return GLOBAL_GOALS.filter(g => g.active).sort((a, b) => b.priority - a.priority);
}

export function getGoalDirective(): string {
    const primary = getActiveGoals()[0];
    if (!primary) return "";
    return `[PRIMARY GOAL: ${primary.label}]\nProgress: ${primary.metrics.current}/${primary.metrics.target} ${primary.metrics.unit}`;
}
