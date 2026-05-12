export interface QualificationState {
    hasBudget: boolean;
    hasUseCase: boolean;
    hasStylePreference: boolean;
    hasTechnicalSpecs: boolean;
}

export interface QualificationGap {
    field: keyof QualificationState;
    question: string;
}

const QUESTIONS: QualificationGap[] = [
    { field: "hasUseCase", question: "What will you mainly use this for? (e.g., professional work, casual use, or a specific hobby?)" },
    { field: "hasBudget", question: "Do you have a specific budget range in mind for this?" },
    { field: "hasStylePreference", question: "Any preferences regarding style, color, or brand?" },
];

/**
 * Analyzes the current profile and history to find what's missing 
 * to provide an "elite" recommendation.
 */
export function getNextQualificationQuestion(profile: any): string | null {
    if (!profile) return QUESTIONS[0].question;

    for (const gap of QUESTIONS) {
        if (!profile[gap.field]) {
            return gap.question;
        }
    }

    return null;
}

/**
 * Heuristic to determine if we should stop searching and start qualifying.
 */
export function shouldQualify(message: string, resultsCount: number): boolean {
    // If user query is too broad (e.g. "I need a laptop") and we have too many results
    const genericTerms = ["need", "want", "looking for", "show me"];
    const isGeneric = genericTerms.some(t => message.toLowerCase().startsWith(t)) && message.split(' ').length < 5;
    
    return isGeneric || resultsCount > 10;
}
