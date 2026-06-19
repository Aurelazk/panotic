"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchMapping = exports.getZones = exports.getPanels = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const getPanels = async (req, res) => {
    try {
        const { type, etat } = req.query;
        const panels = await prisma_1.default.panel.findMany({
            where: {
                ...(type && type !== 'tous' && { type: type }),
                ...(etat && etat !== 'tous' && { etat: etat }),
            },
        });
        const formattedPanels = panels.map((p) => ({
            ...p,
            location: {
                type: 'Point',
                coordinates: [p.lng, p.lat],
            },
        }));
        res.json(formattedPanels);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des panneaux' });
    }
};
exports.getPanels = getPanels;
const getZones = async (req, res) => {
    try {
        const zones = await prisma_1.default.zone.findMany();
        res.json(zones);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des zones' });
    }
};
exports.getZones = getZones;
const searchMapping = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q)
            return res.json({ panels: [], zones: [] });
        const panels = await prisma_1.default.panel.findMany({
            where: {
                OR: [
                    { format: { contains: q, mode: 'insensitive' } },
                    { regime: { contains: q, mode: 'insensitive' } },
                ],
            },
        });
        const zones = await prisma_1.default.zone.findMany({
            where: {
                name: { contains: q, mode: 'insensitive' },
            },
        });
        const formattedPanels = panels.map((p) => ({
            ...p,
            location: {
                type: 'Point',
                coordinates: [p.lng, p.lat],
            },
        }));
        res.json({ panels: formattedPanels, zones });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la recherche' });
    }
};
exports.searchMapping = searchMapping;
