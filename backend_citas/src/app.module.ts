import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolModule } from './rol/rol.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host : 'localhost',
      port: 5432,
      username: 'postgres',
      password: '9923343',
      database: 'bd_citas_medicas',
      autoLoadEntities: true, // Carga automáticamente las entidades
      synchronize: true, // Sincroniza la base de datos con las entidades 
    }),
    RolModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
