import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host : 'localhost',
      port: 5432,
      username: 'postgres',
      password: '9923343',
      database: 'bd-tienda-online',
      autoLoadEntities: true, // Carga automáticamente las entidades
      synchronize: true, // Sincroniza la base de datos con las entidades 
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
