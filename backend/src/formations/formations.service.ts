import { Injectable, BadRequestException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Formation, FormationCategory } from './entities/formation.entity';
import { UserProgress } from './entities/user-progress.entity';
import { User } from '../users/entities/user.entity';
import { PaymentsService, PaymentProvider, PaymentStatus } from '../payments/payments.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class FormationsService implements OnModuleInit {
  constructor(
    @InjectRepository(Formation)
    private formationsRepository: Repository<Formation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserProgress)
    private progressRepository: Repository<UserProgress>,
    private paymentsService: PaymentsService,
    private notificationsService: NotificationsService,
  ) {}

  async onModuleInit() {
    const existing = await this.formationsRepository.findOne({
      where: { title: 'FORMATION SUR LA PANNEAUTIQUE DANS LE DOMAINE PUBLIC (Module 1)' },
    });

    if (!existing) {
      // 1. Panneautique Module
      await this.create({
        title: 'FORMATION SUR LA PANNEAUTIQUE DANS LE DOMAINE PUBLIC (Module 1)',
        description: 'Réforme dans le secteur de la panneautique. Ce module couvre l\'audit, l\'état des lieux, le zonage, le mobilier urbain et la mise en concession.',
        category: FormationCategory.PANNEAUTIQUE,
        duration: '4 semaines',
        capacity: 100,
        isFree: false,
        price: 50000,
        imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0',
        content: [
          {
            title: 'I/ Audit & État des lieux',
            steps: [
              { title: '1/ Audit', points: ['Liste exhaustive des acteurs', 'Examen des droits d\'exploitation', 'Examen du cahier des charges'] },
              { title: '2/ État des lieux', points: ['Relevé précis des supports', 'Plan piquet géolocalisable'] }
            ]
          },
          {
            title: 'II/ Zonage & Mobilier Urbain',
            steps: [
              { title: '3/ Zonage spécifique', points: ['Conditions de développement harmonieux', 'Grilles tarifaires adaptées'] },
              { title: '4/ Mobilier Urbain', points: ['Embellissement du cadre de vie', 'Modernisation urbaine'] }
            ]
          }
        ]
      });

      // 2. Environnement Module
      await this.create({
          title: 'STRATÉGIE VILLE VERTE : URBANISME DURABLE',
          description: 'Comment intégrer la nature au cœur de nos villes pour un futur durable. Étude des couloirs verts et de la gestion de l\'eau.',
          category: FormationCategory.ENVIRONNEMENT,
          duration: '2 semaines',
          capacity: 50,
          isFree: true,
          price: 0,
          imageUrl: 'https://images.unsplash.com/photo-1449156059539-798052149959',
          content: [
            {
              title: 'Module de base',
              steps: [
                { title: 'Introduction', points: ['Principes de la ville durable', 'Impact environnemental des infrastructures'] },
                { title: 'Végétalisation', points: ['Toitures végétalisées', 'Forêts urbaines'] }
              ]
            }
          ]
      });

      // 3. Vie Saine Module
      await this.create({
          title: 'HYGIÈNE PUBLIQUE ET SANTÉ URBAINE',
          description: 'Les fondamentaux de la salubrité urbaine pour prévenir les épidémies et améliorer le bien-être des citoyens.',
          category: FormationCategory.VIE_SAINE,
          duration: '1 semaine',
          capacity: 200,
          isFree: true,
          price: 0,
          imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173599211d0',
          content: [
            {
              title: 'Fondamentaux',
              steps: [
                { title: 'Gestion des déchets', points: ['Tri sélectif à grande échelle', 'Traitement des eaux usées'] }
              ]
            }
          ]
      });
    }
  }

  async findAll(category?: string): Promise<Formation[]> {
    const query = this.formationsRepository.createQueryBuilder('formation');
    if (category) {
      query.where('formation.category = :category', { category });
    }
    return query.orderBy('formation.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Formation & { isEnrolled: boolean }> {
    const formation = await this.formationsRepository.findOne({
      where: { id },
      relations: ['enrolledUsers'],
    });
    if (!formation) throw new NotFoundException('Formation non trouvée');
    
    // For demo purposes, we'll mark as enrolled if the list is not empty
    const isEnrolled = formation.enrolledUsers.length > 0;

    return { ...formation, isEnrolled };
  }

  async enroll(
    id: string,
    authUser: { userId: string },
    metadata?: { transactionId?: string; provider?: PaymentProvider },
  ): Promise<Formation> {
    const formation = await this.findOne(id);

    const user = await this.userRepository.findOne({ where: { id: authUser.userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (formation.enrolledCount >= formation.capacity) {
      throw new BadRequestException('Cette formation est complète');
    }

    const isAlreadyEnrolled = formation.enrolledUsers.some((u) => u.id === user.id);
    if (isAlreadyEnrolled) {
      throw new BadRequestException('Vous êtes déjà inscrit à cette formation');
    }

    // Check payment if not free
    if (!formation.isFree) {
      if (!metadata?.transactionId) {
        throw new BadRequestException('Un paiement est requis pour cette formation');
      }

      const status = await this.paymentsService.verifyPayment(
        metadata.transactionId,
        metadata.provider || PaymentProvider.CINETPAY,
      );
      if (status !== PaymentStatus.SUCCESS) {
        throw new BadRequestException('Le paiement n\'a pas pu être vérifié');
      }
    }

    formation.enrolledUsers.push(user);
    formation.enrolledCount += 1;
    
    const savedPost = await this.formationsRepository.save(formation);

    await this.notificationsService.create(user, {
      type: NotificationType.FORMATION,
      title: 'Confirmation d\'inscription',
      message: `Votre inscription à la formation "${formation.title}" a été confirmée ! 🎓`,
      link: formation.id,
    });

    return savedPost;
  }

  async generateCertificate(formationId: string, userId: string): Promise<string> {
    const progress = await this.progressRepository.findOne({
      where: { user: { id: userId }, formation: { id: formationId } },
    });

    if (!progress?.quizPassed) {
      throw new BadRequestException('Vous devez réussir le quiz avant d\'obtenir un certificat.');
    }

    if (progress.certificateGenerated) {
      return progress.certificateUrl;
    }

    const certUrl = `https://panotic.app/certificates/${formationId}_${userId}.pdf`;
    progress.certificateGenerated = true;
    progress.certificateUrl = certUrl;
    await this.progressRepository.save(progress);
    return certUrl;
  }

  async getProgress(formationId: string, userId: string): Promise<UserProgress | null> {
    return this.progressRepository.findOne({
      where: { user: { id: userId }, formation: { id: formationId } },
    });
  }

  async updateProgress(
    formationId: string,
    userId: string,
    phaseIndex: number,
    stepIndex: number,
  ): Promise<UserProgress> {
    const formation = await this.formationsRepository.findOne({ where: { id: formationId } });
    if (!formation) throw new NotFoundException('Formation non trouvée');

    let progress = await this.progressRepository.findOne({
      where: { user: { id: userId }, formation: { id: formationId } },
    });

    if (!progress) {
      progress = this.progressRepository.create({
        user: { id: userId } as User,
        formation: { id: formationId } as Formation,
      });
    }

    progress.currentPhaseIndex = phaseIndex;
    progress.currentStepIndex = stepIndex;

    // Calculate overall progress percentage
    const totalPhases = formation.content?.length || 1;
    const totalSteps = formation.content?.reduce((acc, p) => acc + (p.steps?.length || 1), 0) || 1;
    const doneSteps = formation.content?.slice(0, phaseIndex).reduce((acc, p) => acc + (p.steps?.length || 1), 0) + stepIndex + 1 || 1;
    progress.progressPercent = Math.min(100, Math.round((doneSteps / totalSteps) * 100));

    return this.progressRepository.save(progress);
  }

  async submitQuiz(
    formationId: string,
    userId: string,
    answers: number[],
  ): Promise<{ passed: boolean; score: number; certificateUrl?: string }> {
    // Simple mock quiz: answers must match [0, 1, 2, 0] for 100%
    // In production, these would be stored per-formation in the DB
    const correctAnswers = [0, 1, 2, 0];
    const score = answers.reduce((acc, ans, idx) => acc + (ans === correctAnswers[idx] ? 1 : 0), 0);
    const percentage = Math.round((score / correctAnswers.length) * 100);
    const passed = percentage >= 75;

    let progress = await this.progressRepository.findOne({
      where: { user: { id: userId }, formation: { id: formationId } },
    });
    if (!progress) {
      progress = this.progressRepository.create({
        user: { id: userId } as User,
        formation: { id: formationId } as Formation,
      });
    }

    progress.quizPassed = passed;
    progress.quizScore = percentage;
    if (passed) progress.progressPercent = 100;
    await this.progressRepository.save(progress);

    let certificateUrl: string | undefined;
    if (passed) {
      certificateUrl = await this.generateCertificate(formationId, userId);
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (user) {
        await this.notificationsService.create(user, {
          type: NotificationType.FORMATION,
          title: '🎓 Certificat disponible !',
          message: 'Félicitations ! Vous avez terminé la formation avec succès.',
          link: formationId,
        });
      }
    }

    return { passed, score: percentage, certificateUrl };
  }

  // Used for seeding or admin creation
  async create(data: Partial<Formation>): Promise<Formation> {
    const formation = this.formationsRepository.create(data);
    return this.formationsRepository.save(formation);
  }
}
