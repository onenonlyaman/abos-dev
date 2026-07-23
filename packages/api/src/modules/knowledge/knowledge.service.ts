import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class KnowledgeService {
  constructor(private readonly prisma: PrismaService) {}

  async getArticles(category?: string, query?: string) {
    return this.prisma.knowledgeArticle.findMany({
      where: {
        category: category ? category : undefined,
        OR: query
          ? [
              { title: { contains: query, mode: 'insensitive' } },
              { content: { contains: query, mode: 'insensitive' } },
            ]
          : undefined,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getArticleById(id: string) {
    // Increment view count atomically
    await this.prisma.knowledgeArticle.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return this.prisma.knowledgeArticle.findUnique({
      where: { id },
    });
  }

  async createArticle(data: any) {
    return this.prisma.knowledgeArticle.create({
      data: {
        title: data.title,
        category: data.category || 'General',
        content: data.content,
        author: data.author || 'Support Team',
      },
    });
  }
}
