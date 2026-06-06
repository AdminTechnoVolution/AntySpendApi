import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SavingsMovement, SavingsMovementSchema } from '../../shared/database/entity.schemas';
import { SavingsMovementService } from './application/savingsMovements.service';
import { SavingsMovementController } from './presentation/savingsMovements.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SavingsMovement.name, schema: SavingsMovementSchema }]),
  ],
  controllers: [SavingsMovementController],
  providers: [SavingsMovementService],
  exports: [SavingsMovementService],
})
export class SavingsMovementModule {}
