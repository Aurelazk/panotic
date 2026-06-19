"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrollInFormation = exports.getFormationById = exports.getFormations = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const getFormations = async (req, res) => {
    try {
        const { category } = req.query;
        const where = category ? { category: category.toUpperCase() } : {};
        const formations = await prisma_1.default.formation.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
        res.json(formations);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des formations' });
    }
};
exports.getFormations = getFormations;
const getFormationById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const formation = await prisma_1.default.formation.findUnique({
            where: { id },
            include: {
                enrolledUsers: userId ? { where: { id: userId } } : false,
            },
        });
        if (!formation)
            return res.status(404).json({ error: 'Formation non trouvée' });
        const isEnrolled = userId ? formation.enrolledUsers.length > 0 : false;
        res.json({ ...formation, isEnrolled });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération de la formation' });
    }
};
exports.getFormationById = getFormationById;
const enrollInFormation = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId)
            return res.sendStatus(401);
        const [formation, alreadyEnrolled] = await Promise.all([
            prisma_1.default.formation.findUnique({ where: { id } }),
            prisma_1.default.user.findFirst({
                where: { id: userId, formations: { some: { id } } },
            }),
        ]);
        if (!formation)
            return res.status(404).json({ error: 'Formation non trouvée' });
        if (alreadyEnrolled)
            return res.status(409).json({ error: 'Vous êtes déjà inscrit à cette formation' });
        if (formation.enrolledCount >= formation.capacity) {
            return res.status(400).json({ error: 'Cette formation est complète' });
        }
        await prisma_1.default.formation.update({
            where: { id },
            data: {
                enrolledCount: { increment: 1 },
                enrolledUsers: { connect: { id: userId } },
            },
        });
        res.json({ message: 'Inscription réussie' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de l\'inscription' });
    }
};
exports.enrollInFormation = enrollInFormation;
