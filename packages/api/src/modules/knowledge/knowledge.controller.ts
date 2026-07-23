import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';

@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get('articles')
  getArticles(@Query('category') category?: string, @Query('query') query?: string) {
    return this.knowledgeService.getArticles(category, query);
  }

  @Get('articles/:id')
  getArticleById(@Param('id') id: string) {
    return this.knowledgeService.getArticleById(id);
  }

  @Post('articles')
  createArticle(@Body() body: any) {
    return this.knowledgeService.createArticle(body);
  }
}
