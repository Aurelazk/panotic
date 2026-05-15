import { Request, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getFormations = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const where = category ? { category: (category as string).toUpperCase() as any } : {};
    const formations = await prisma.formation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(formations);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des formations' });
  }
};

export const getFormationById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const formation = await prisma.formation.findUnique({
      where: { id },
      include: {
        enrolledUsers: userId ? { where: { id: userId } } : false,
      },
    });

    if (!formation) return res.status(404).json({ error: 'Formation non trouvée' });

    const isEnrolled = userId ? (formation as any).enrolledUsers.length > 0 : false;
    res.json({ ...formation, isEnrolled });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération de la formation' });
  }
};

export const enrollInFormation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) return res.sendStatus(401);

    const formation = await prisma.formation.findUnique({ where: { id } });
    if (!formation) return res.status(404).json({ error: 'Formation non trouvée' });

    if (formation.enrolledCount >= formation.capacity) {
      return res.status(400).json({ error: 'Cette formation est complète' });
    }

    await prisma.formation.update({
      where: { id },
      data: {
        enrolledCount: { increment: 1 },
        enrolledUsers: { connect: { id: userId } },
      },
    });

    res.json({ message: 'Inscription réussie' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
};
