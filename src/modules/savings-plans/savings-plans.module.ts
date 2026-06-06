import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SavingsPlan, SavingsPlanSchema } from '../../shared/database/entity.schemas';
import { SavingsPlanService } from './application/savingsPlans.service';
import { SavingsPlanController } from './presentation/savingsPlans.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SavingsPlan.name, schema: SavingsPlanSchema }]),
  ],
  controllers: [SavingsPlanController],
  providers: [SavingsPlanService],
  exports: [SavingsPlanService],
})
export class SavingsPlanModule {}
