import { Request, Response } from 'express';
export declare class AuditController {
    private geminiService;
    private screenshotService;
    constructor();
    auditWebsite: (req: Request, res: Response) => Promise<void>;
    getAuditStatus: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=auditController.d.ts.map