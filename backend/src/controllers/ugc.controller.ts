import { Request, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { content, mediaUrl, theme } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.sendStatus(401);

    const post = await prisma.post.create({
      data: {
        content,
        mediaUrl,
        theme,
        authorId: userId,
      },
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du post' });
  }
};

export const getPosts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, sortBy = 'recent', theme } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = theme ? { theme: theme as string } : {};
    
    const [posts, total] = await prisma.$transaction([
      prisma.post.findMany({
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
      prisma.post.count({ where }),
    ]);

    const lastPage = Math.ceil(total / Number(limit));

    res.json({ posts, lastPage });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des posts' });
  }
};

export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const { content, postId } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.sendStatus(401);

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: userId,
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du commentaire' });
  }
};
