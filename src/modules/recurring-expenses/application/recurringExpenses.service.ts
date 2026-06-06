import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseEntityService } from '../../../shared/crud/create-entity-module';
import {
  RecurringExpense,
  RecurringExpenseDocument,
} from '../../../shared/database/entity.schemas';

@Injectable()
export class RecurringExpenseService extends BaseEntityService {
  constructor(
    @InjectModel(RecurringExpense.name)
    model: Model<RecurringExpenseDocument>,
  ) {
    super(model, 'RecurringExpense');
  }

  async markPaid(userId: string, id: string) {
    const expense = await this.getModel().findOne({ userId, id });
    if (!expense || expense.deletedAtMillis) {
      throw new NotFoundException('Recurring expense not found');
    }

    const now = Date.now();
    let nextDue = expense.nextDueAtMillis;
    switch (expense.frequency) {
      case 'WEEKLY':
        nextDue += 7 * 24 * 60 * 60 * 1000;
        break;
      case 'BIWEEKLY':
        nextDue += 14 * 24 * 60 * 60 * 1000;
        break;
      case 'MONTHLY':
        nextDue = this.addMonths(nextDue, 1);
        break;
      case 'QUARTERLY':
        nextDue = this.addMonths(nextDue, 3);
        break;
      case 'YEARLY':
        nextDue = this.addMonths(nextDue, 12);
        break;
      default:
        nextDue = this.addMonths(nextDue, 1);
    }

    expense.nextDueAtMillis = nextDue;
    expense.updatedAtMillis = now;
    await expense.save();
    return expense.toObject();
  }

  private addMonths(millis: number, months: number): number {
    const date = new Date(millis);
    date.setMonth(date.getMonth() + months);
    return date.getTime();
  }
}
