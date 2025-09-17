"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const PORT = process.env.PORT || 3001;
app_1.default.listen(PORT, () => {
    console.log(`🚀 UX Audit Platform API running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🎯 Gemini AI: ${process.env.GEMINI_API_KEY ? 'Connected' : 'Not configured'}`);
    console.log(`🌐 CORS origin: ${process.env.NODE_ENV === 'production' ? 'Production domains' : 'http://localhost:3000'}`);
});
exports.default = app_1.default;
//# sourceMappingURL=index.js.map