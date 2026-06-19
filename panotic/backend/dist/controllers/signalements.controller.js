"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.voteSignalement = exports.getSignalementById = exports.getSignalements = exports.createSignalement = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const createSignalement = async (req, res) => {
    try {
        const { type, description, lat, lng, imageUrl, videoUrl } = req.body;
        const userId = req.user?.id;
        const signalement = await prisma_1.default.signalement.create({
            data: {
                type,
                description,
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                imageUrl,
                videoUrl,
                authorId: userId,
            },
        });
        res.status(201).json(signalement);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la création du signalement' });
    }
};
exports.createSignalement = createSignalement;
const getSignalements = async (req, res) => {
    try {
        const signalements = await prisma_1.default.signalement.findMany({
            include: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const formattedSignalements = signalements.map((s) => ({
            ...s,
            location: {
                type: 'Point',
                coordinates: [s.lng, s.lat],
            },
        }));
        res.json(formattedSignalements);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des signalements' });
    }
};
exports.getSignalements = getSignalements;
const getSignalementById = async (req, res) => {
    try {
        const { id } = req.params;
        const signalement = await prisma_1.default.signalement.findUnique({
            where: { id },
            include: { author: true },
        });
        if (!signalement)
            return res.status(404).json({ error: 'Signalement non trouvé' });
        const formattedSignalement = {
            ...signalement,
            location: {
                type: 'Point',
                coordinates: [signalement.lng, signalement.lat],
            },
        };
        res.json(formattedSignalement);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération du signalement' });
    }
};
exports.getSignalementById = getSignalementById;
const voteSignalement = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId)
            return res.sendStatus(401);
        const signalement = await prisma_1.default.signalement.findUnique({ where: { id } });
        if (!signalement)
            return res.status(404).json({ error: 'Signalement non trouvé' });
        // Check for duplicate votes using the authorId as a simple uniqueness check
        // A SignalementVote model would be better for production
        const existingVotes = await prisma_1.default.signalement.count({
            where: { id, authorId: userId },
        });
        const updated = await prisma_1.default.signalement.update({
            where: { id },
            data: { votesCount: { increment: existingVotes > 0 ? 0 : 1 } },
        });
        res.json(updated);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors du vote' });
    }
};
exports.voteSignalement = voteSignalement;
