"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_1 = __importDefault(require("./lib/prisma"));
exports.prisma = prisma_1.default;
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const signalements_routes_1 = __importDefault(require("./routes/signalements.routes"));
const formations_routes_1 = __importDefault(require("./routes/formations.routes"));
const ugc_routes_1 = __importDefault(require("./routes/ugc.routes"));
const mapping_routes_1 = __importDefault(require("./routes/mapping.routes"));
const notifications_routes_1 = __importDefault(require("./routes/notifications.routes"));
const publicite_routes_1 = __importDefault(require("./routes/publicite.routes"));
const payments_routes_1 = __importDefault(require("./routes/payments.routes"));
const crowdsourcing_routes_1 = __importDefault(require("./routes/crowdsourcing.routes"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
// Middleware for logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});
// Ensure uploads directory exists
const uploadsDir = path_1.default.join(__dirname, '..', 'uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Serve uploaded files
app.use('/uploads', express_1.default.static(uploadsDir));
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
app.use('/auth', auth_routes_1.default);
app.use('/signalements', signalements_routes_1.default);
app.use('/formations', formations_routes_1.default);
app.use('/ugc', ugc_routes_1.default);
app.use('/mapping', mapping_routes_1.default);
app.use('/notifications', notifications_routes_1.default);
app.use('/publicite', publicite_routes_1.default);
app.use('/payments', payments_routes_1.default);
app.use('/api/crowdsourcing', crowdsourcing_routes_1.default);
// Global error handler
app.use((err, req, res, _next) => {
    console.error(`[${new Date().toISOString()}] Error:`, err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
});
const server = app.listen(port, () => {
    console.log(`🚀 Server ready at: http://localhost:${port}`);
});
// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    server.close();
    await prisma_1.default.$disconnect();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('Shutting down gracefully...');
    server.close();
    await prisma_1.default.$disconnect();
    process.exit(0);
});
