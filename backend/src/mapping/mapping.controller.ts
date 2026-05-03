import { Controller, Get, Query } from '@nestjs/common';
import { MappingService } from './mapping.service';
import { Panneau } from './entities/panneau.entity';
import { Zone } from './entities/zone.entity';

@Controller('mapping')
export class MappingController {
  constructor(private readonly mappingService: MappingService) {}

  @Get('panels')
  async getAllPanels(
    @Query('type') type?: string,
    @Query('etat') etat?: string,
  ): Promise<Panneau[]> {
    return this.mappingService.findAllPanels(type, etat);
  }

  @Get('zones')
  async getAllZones(): Promise<Zone[]> {
    return this.mappingService.findAllZones();
  }

  @Get('panels/bounds')
  async getPanelsInBounds(
    @Query('xmin') xmin: number,
    @Query('ymin') ymin: number,
    @Query('xmax') xmax: number,
    @Query('ymax') ymax: number,
  ): Promise<Panneau[]> {
    return this.mappingService.getPanelsInBounds(xmin, ymin, xmax, ymax);
  }

  @Get('search')
  async search(@Query('q') q: string): Promise<any> {
    if (!q || q.length < 2) return { panels: [], zones: [] };
    return this.mappingService.search(q);
  }
}
