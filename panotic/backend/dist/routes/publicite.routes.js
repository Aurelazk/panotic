"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/campaigns/me', (req, res) => {
    res.json([]);
});
exports.default = router;
