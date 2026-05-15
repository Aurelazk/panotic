import { Request, Response } from 'express';
import { prisma } from '../index';

export const getPanels = async (req: Request, res: Response) => {
  try {
    const { type, etat } = req.query;
    const panels = await prisma.panel.findMany({
      where: {
        ...(type !== 'tous' && { type: type as any }),
        ...(etat !== 'tous' && { etat: etat as any }),
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
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des panneaux' });
  }
};

export const getZones = async (req: Request, res: Response) => {
  try {
    const zones = await prisma.zone.findMany();
    res.json(zones);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des zones' });
  }
};

export const searchMapping = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ panels: [], zones: [] });

    const panels = await prisma.panel.findMany({
      where: {
        OR: [
          { format: { contains: q as string, mode: 'insensitive' } },
          { regime: { contains: q as string, mode: 'insensitive' } },
        ],
      },
    });

    const zones = await prisma.zone.findMany({
      where: {
        name: { contains: q as string, mode: 'insensitive' },
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
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la recherche' });
  }
};
