"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    // Mock notifications
    res.json([]);
});
router.get('/unread-count', (req, res) => {
    res.json({ count: 0 });
});
exports.default = router;
