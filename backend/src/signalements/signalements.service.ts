import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Signalement, SignalementStatus, SignalementType } from './entities/signalement.entity';
import { Vote } from './entities/vote.entity';
import { CreateSignalementDto } from './dto/create-signalement.dto';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import PDFDocument from 'pdfkit';

@Injectable()
export class SignalementsService {
  constructor(
    @InjectRepository(Signalement)
    private readonly signalementsRepository: Repository<Signalement>,
    @InjectRepository(Vote)
    private readonly votesRepository: Repository<Vote>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createSignalementDto: CreateSignalementDto): Promise<Signalement> {
    const { latitude, longitude, ...rest } = createSignalementDto;
    
    const signalement = this.signalementsRepository.create({
      ...rest,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
    });

    return this.signalementsRepository.save(signalement);
  }

  async findAll(type?: string): Promise<Signalement[]> {
    const query = this.signalementsRepository.createQueryBuilder('signalement');
    
    if (type && type !== 'tous') {
      query.andWhere('signalement.type = :type', { type });
    }

    return query.orderBy('signalement.createdAt', 'DESC').getMany();
  }

  async getHeatmapData(): Promise<{ latitude: number; longitude: number; weight: number }[]> {
    const signalements = await this.signalementsRepository.find({
      where: [
        { type: SignalementType.DEGRADE },
        { type: SignalementType.DANGEREUX },
        { type: SignalementType.ILLEGAL },
      ],
      select: ['location', 'type'],
    });

    return signalements.map(s => {
      let weight = 1;
      if (s.type === SignalementType.DANGEREUX) weight = 3;
      if (s.type === SignalementType.ILLEGAL) weight = 2;
      return {
        latitude: s.location.coordinates[1],
        longitude: s.location.coordinates[0],
        weight,
      };
    });
  }

  async findOne(id: string): Promise<Signalement> {
    const signalement = await this.signalementsRepository.findOneBy({ id });
    if (!signalement) {
      throw new NotFoundException('Signalement non trouvé');
    }
    return signalement;
  }

  async vote(id: string, authUser: { userId: string }, type: 'confirm' | 'reject'): Promise<Signalement> {
    const signalement = await this.findOne(id);

    const existingVote = await this.votesRepository.findOne({
      where: { user: { id: authUser.userId }, signalement: { id: signalement.id } },
    });

    if (existingVote) {
      throw new BadRequestException('Vous avez déjà voté pour ce signalement');
    }

    const vote = this.votesRepository.create({
      user: { id: authUser.userId } as User,
      signalement,
      type,
    });

    await this.votesRepository.save(vote);

    // Update signalement votesCount or logic
    if (type === 'confirm') {
      signalement.votesCount += 1;
    } else {
      signalement.votesCount -= 1;
    }

    return this.signalementsRepository.save(signalement);
  }

  async generateReport(id: string): Promise<Buffer> {
    const signalement = await this.findOne(id);
    
    // Mapping internal types to friendly labels
    const friendlyTypes: Record<string, string> = {
      'bon_etat': 'Bon État',
      'degrade': 'Dégradé',
      'obsolete': 'Obsolète',
      'dangereux': 'Dangereux',
      'illegal': 'Illégal',
      'travaux': 'En Travaux',
    };

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // Header
      doc.fontSize(20).text('PANOTIC - RAPPORT DE SIGNALEMENT', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Généré le: ${new Date().toLocaleString()}`, { align: 'right' });
      doc.moveDown();

      // Content
      doc.fontSize(14).text('Détails du Signalement', { underline: true });
      doc.moveDown(0.5);
      
      doc.fontSize(11).text(`ID Intervention: ${signalement.id}`);
      doc.text(`Nature du problème: ${friendlyTypes[signalement.type] || signalement.type.toUpperCase()}`);
      doc.text(`Statut actuel: ${signalement.status.toUpperCase()}`);
      doc.text(`Date du constat: ${signalement.createdAt.toLocaleDateString()}`);
      doc.text(`Validation communautaire (votes): ${signalement.votesCount}`);
      doc.moveDown();

      doc.fontSize(14).text('Données Géospatiales', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).text(`Longitude: ${signalement.location.coordinates[0]}`);
      doc.text(`Latitude: ${signalement.location.coordinates[1]}`);
      doc.moveDown();

      doc.fontSize(14).text('Description et Preuves', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).text(signalement.description);
      doc.moveDown();

      if (signalement.imageUrl) {
        doc.fillColor('blue').text('Image(s) jointe(s): OUI (Consultable sur la plateforme)', { link: signalement.imageUrl });
      } else {
        doc.fillColor('black').text('Image jointe: NON');
      }

      if (signalement.videoUrl) {
        doc.fillColor('blue').text('Vidéo joince: OUI (Consultable sur la plateforme)', { link: signalement.videoUrl });
      } else {
        doc.fillColor('black').text('Vidéo jointe: NON');
      }

      // Footer
      doc.fillColor('grey').fontSize(9).text(
        'Ce document officiel est généré par Panotic pour le suivi de la maintenance urbaine.',
        { align: 'center', baseline: 'bottom' }
      );

      doc.end();
    });
  }

  async updateStatus(id: string, status: SignalementStatus, user?: User): Promise<Signalement> {
    const signalement = await this.findOne(id);
    signalement.status = status;
    const saved = await this.signalementsRepository.save(signalement);

    if (user) {
      await this.notificationsService.create(user, {
        type: NotificationType.SIGNALEMENT,
        title: 'Mise à jour de signalement',
        message: `Le signalement "${signalement.type.toUpperCase()}" a été mis à jour: ${status}.`,
        link: signalement.id,
      });
    }

    return saved;
  }
}
