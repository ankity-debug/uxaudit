import { AuditData, GeminiAnalysisPrompt } from '../types';
export declare class OpenRouterService {
    private apiKey;
    private baseURL;
    constructor(apiKey: string);
    analyzeUX(prompt: GeminiAnalysisPrompt): Promise<AuditData>;
    private buildAnalysisPrompt;
    private parseOpenRouterResponse;
    private extractEvidenceFiles;
    private calculateGrade;
    private createDemoResponse;
    private createFallbackResponse;
}
//# sourceMappingURL=openRouterService.d.ts.map