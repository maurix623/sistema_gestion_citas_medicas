import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolModule } from './rol/rol.module';
import { UsuarioModule } from './usuario/usuario.module';
import { AuthModule } from './auth/auth.module';
import { EspecialidadModule } from './especialidad/especialidad.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DoctorModule } from './doctor/doctor.module';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true,}),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    RolModule,
    UsuarioModule,
    AuthModule,
    EspecialidadModule,
    DoctorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
