"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComment = exports.getPosts = exports.createPost = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const createPost = async (req, res) => {
    try {
        const { content, mediaUrl, theme } = req.body;
        const userId = req.user?.id;
        if (!userId)
            return res.sendStatus(401);
        const post = await prisma_1.default.post.create({
            data: {
                content,
                mediaUrl,
                theme,
                authorId: userId,
            },
        });
        res.status(201).json(post);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la création du post' });
    }
};
exports.createPost = createPost;
const getPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10, sortBy = 'recent', theme } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = theme ? { theme: theme } : {};
        const [posts, total] = await prisma_1.default.$transaction([
            prisma_1.default.post.findMany({
                where,
                skip,
                take: Number(limit),
                include: {
                    author: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            profilePicture: true,
                        },
                    },
                    _count: { select: { comments: true } },
                },
                orderBy: sortBy === 'recent' ? { createdAt: 'desc' } : { createdAt: 'asc' }, // Simplified popular logic for now
            }),
            prisma_1.default.post.count({ where }),
        ]);
        const lastPage = Math.ceil(total / Number(limit));
        res.json({ posts, lastPage });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des posts' });
    }
};
exports.getPosts = getPosts;
const createComment = async (req, res) => {
    try {
        const { content, postId } = req.body;
        const userId = req.user?.id;
        if (!userId)
            return res.sendStatus(401);
        const comment = await prisma_1.default.comment.create({
            data: {
                content,
                postId,
                authorId: userId,
            },
        });
        res.status(201).json(comment);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la création du commentaire' });
    }
};
exports.createComment = createComment;
