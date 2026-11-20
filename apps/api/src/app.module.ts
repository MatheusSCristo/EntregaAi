import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { EncomendasModule } from './encomendas/encomendas.module';
import { PrismaModule } from './prisma/prisma.module';
import { NotificacoesModule } from './notificacoes/notificacoes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    EncomendasModule,
    NotificacoesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
