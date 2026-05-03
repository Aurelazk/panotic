import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Panneau, PanneauType, PanneauEtat, PanneauRegime } from './entities/panneau.entity';
import { Zone, ZoneType } from './entities/zone.entity';

@Injectable()
export class MappingService implements OnModuleInit {
  constructor(
    @InjectRepository(Panneau)
    private readonly panneauRepository: Repository<Panneau>,
    @InjectRepository(Zone)
    private readonly zoneRepository: Repository<Zone>,
  ) {}

  async onModuleInit() {
    await this.seedDemoData();
  }

  private async seedDemoData() {
    const panelsCount = await this.panneauRepository.count();
    const zonesCount = await this.zoneRepository.count();

    if (zonesCount === 0) {
      console.log('Seeding demo zones...');
      // Demo Zones in Cotonou
      await this.zoneRepository.save([
        {
          name: 'Zone Commerciale Ganhier',
          type: ZoneType.COMMERCIALE,
          tariffFactor: 1.5,
          boundary: {
            type: 'Polygon',
            coordinates: [[
              [2.4278, 6.3533],
              [2.4358, 6.3533],
              [2.4358, 6.3603],
              [2.4278, 6.3603],
              [2.4278, 6.3533]
            ]]
          }
        },
        {
          name: 'Zone Résidentielle Haie Vive',
          type: ZoneType.RESIDENTIELLE,
          tariffFactor: 1.2,
          boundary: {
            type: 'Polygon',
            coordinates: [[
              [2.3958, 6.3553],
              [2.4088, 6.3553],
              [2.4088, 6.3653],
              [2.3958, 6.3653],
              [2.3958, 6.3553]
            ]]
          }
        }
      ]);
    }

    if (panelsCount === 0) {
      console.log('Seeding demo panels...');
      // Demo Panels
      await this.panneauRepository.save([
        {
          type: PanneauType.GRAND_FORMAT,
          etat: PanneauEtat.BON,
          regime: PanneauRegime.CONCESSION,
          format: '12m2',
          location: { type: 'Point', coordinates: [2.4312, 6.3571] }
        },
        {
          type: PanneauType.MOBILIER_URBAIN,
          etat: PanneauEtat.DEGRADE,
          regime: PanneauRegime.PUBLIC,
          format: '2m2',
          location: { type: 'Point', coordinates: [2.4021, 6.3605] }
        },
        {
          type: PanneauType.PETIT_FORMAT,
          etat: PanneauEtat.BON,
          regime: PanneauRegime.PRIVE,
          format: '1m2',
          location: { type: 'Point', coordinates: [2.4150, 6.3580] }
        }
      ]);
    }
  }

  async findAllPanels(type?: string, etat?: string): Promise<Panneau[]> {
    const query = this.panneauRepository.createQueryBuilder('panneau');
    
    if (type && type !== 'tous') {
      query.andWhere('panneau.type = :type', { type });
    }
    
    if (etat && etat !== 'tous') {
      query.andWhere('panneau.etat = :etat', { etat });
    }

    return query.getMany();
  }

  async findAllZones(): Promise<Zone[]> {
    return this.zoneRepository.find();
  }

  async getPanelsInBounds(xmin: number, ymin: number, xmax: number, ymax: number): Promise<Panneau[]> {
    return this.panneauRepository.createQueryBuilder('panneau')
      .where('panneau.location && ST_MakeEnvelope(:xmin, :ymin, :xmax, :ymax, 4326)', { xmin, ymin, xmax, ymax })
      .getMany();
  }

  async search(query: string): Promise<{ panels: Panneau[], zones: Zone[] }> {
    const q = `%${query.toLowerCase()}%`;
    const panels = await this.panneauRepository.createQueryBuilder('panneau')
      .where('LOWER(panneau.type) LIKE :q OR LOWER(panneau.format) LIKE :q OR LOWER(panneau.regime) LIKE :q', { q })
      .getMany();

    const zones = await this.zoneRepository.createQueryBuilder('zone')
      .where('LOWER(zone.name) LIKE :q OR LOWER(zone.type) LIKE :q', { q })
      .getMany();

    return { panels, zones };
  }
}
