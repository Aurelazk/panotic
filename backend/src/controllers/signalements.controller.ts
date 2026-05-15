import { Request, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createSignalement = async (req: AuthRequest, res: Response) => {
  try {
    const { type, description, lat, lng, imageUrl, videoUrl } = req.body;
    const userId = req.user?.id;

    const signalement = await prisma.signalement.create({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la création du signalement' });
  }
};

export const getSignalements = async (req: Request, res: Response) => {
  try {
    const signalements = await prisma.signalement.findMany({
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
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des signalements' });
  }
};

export const getSignalementById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const signalement = await prisma.signalement.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!signalement) return res.status(404).json({ error: 'Signalement non trouvé' });

    const formattedSignalement = {
      ...signalement,
      location: {
        type: 'Point',
        coordinates: [signalement.lng, signalement.lat],
      },
    };

    res.json(formattedSignalement);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du signalement' });
  }
};

export const voteSignalement = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const signalement = await prisma.signalement.update({
      where: { id },
      data: { votesCount: { increment: 1 } },
    });
    res.json(signalement);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du vote' });
  }
};
