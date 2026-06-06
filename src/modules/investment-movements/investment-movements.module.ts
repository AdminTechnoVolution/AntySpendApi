import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvestmentMovement, InvestmentMovementSchema } from '../../shared/database/entity.schemas';
import { InvestmentMovementService } from './application/investmentMovements.service';
import { InvestmentMovementController } from './presentation/investmentMovements.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: InvestmentMovement.name, schema: InvestmentMovementSchema }]),
  ],
  controllers: [InvestmentMovementController],
  providers: [InvestmentMovementService],
  exports: [InvestmentMovementService],
})
export class InvestmentMovementModule {}
