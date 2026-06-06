import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseEntityService } from '../../../shared/crud/create-entity-module';
import {
  Transaction,
  TransactionDocument,
} from '../../../shared/database/entity.schemas';

export interface TransactionFilters {
  fromMillis?: number;
  toMillis?: number;
  categoryId?: string;
}

@Injectable()
export class TransactionService extends BaseEntityService {
  constructor(
    @InjectModel(Transaction.name) model: Model<TransactionDocument>,
  ) {
    super(model, 'Transaction');
  }

  async findFiltered(userId: string, filters: TransactionFilters) {
    const query: Record<string, unknown> = {
      userId,
      deletedAtMillis: { $exists: false },
    };
    if (filters.categoryId) query.categoryId = filters.categoryId;
    if (filters.fromMillis || filters.toMillis) {
      query.occurredAtMillis = {};
      if (filters.fromMillis) {
        (query.occurredAtMillis as Record<string, number>).$gte = filters.fromMillis;
      }
      if (filters.toMillis) {
        (query.occurredAtMillis as Record<string, number>).$lt = filters.toMillis;
      }
    }
    return this.getModel().find(query).sort({ occurredAtMillis: -1 }).lean();
  }
}
