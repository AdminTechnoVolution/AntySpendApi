import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecurringExpense, RecurringExpenseSchema } from '../../shared/database/entity.schemas';
import { RecurringExpenseService } from './application/recurringExpenses.service';
import { RecurringExpenseController } from './presentation/recurringExpenses.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RecurringExpense.name, schema: RecurringExpenseSchema }]),
  ],
  controllers: [RecurringExpenseController],
  providers: [RecurringExpenseService],
  exports: [RecurringExpenseService],
})
export class RecurringExpenseModule {}
