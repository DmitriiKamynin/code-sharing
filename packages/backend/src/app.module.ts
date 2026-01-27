import { Module } from '@nestjs/common';
import { EventsModule } from './events/events.module';
import { RoomsModule } from './rooms/rooms.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    EventsModule,
    RoomsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/db/migrations/*.js'],
        migrationsRun: true,
        migrationsTableName: '__migrations__',
        migrationsTransactionMode: 'all',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
