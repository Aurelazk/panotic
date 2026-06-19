"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mapping_controller_1 = require("../controllers/mapping.controller");
const router = (0, express_1.Router)();
router.get('/panels', mapping_controller_1.getPanels);
router.get('/zones', mapping_controller_1.getZones);
router.get('/search', mapping_controller_1.searchMapping);
exports.default = router;
