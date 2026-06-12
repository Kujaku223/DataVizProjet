export interface HappinessRecord {
    year: number;
    rank: number;
    country: string;
    continent: string;
    lifeEvaluation: number;
    lowerWhisker: number;
    upperWhisker: number;
    GDP: number;
    socialSupport: number;
    lifeExpectancy: number;
    freedom: number;
    generosity: number;
    corruptionPerception: number;
    dystopia: number;
}

export interface HumanDevelopmentIndexRecord {
    rank: number;
    country: string;
    humanDevelopmentIndex: number;
    lifeExpectancy: number;
}