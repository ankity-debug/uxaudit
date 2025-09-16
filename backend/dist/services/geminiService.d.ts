import { AuditData, GeminiAnalysisPrompt } from '../types';
export declare class GeminiService {
    private apiKey;
    private baseURL;
    constructor(apiKey: string);
    analyzeUX(prompt: GeminiAnalysisPrompt): Promise<AuditData>;
    private buildAnalysisPrompt;
    private parseGeminiResponse;
    private extractEvidenceFiles;
    private calculateGrade;
}
//# sourceMappingURL=geminiService.d.ts.map