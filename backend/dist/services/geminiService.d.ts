import { AuditData, GeminiAnalysisPrompt } from '../types';
export declare class GeminiService {
    private genAI;
    constructor(apiKey: string);
    analyzeUX(prompt: GeminiAnalysisPrompt): Promise<AuditData>;
    private buildAnalysisPrompt;
    private parseGeminiResponse;
    private calculateGrade;
    private createDemoResponse;
    private createFallbackResponse;
}
//# sourceMappingURL=geminiService.d.ts.map