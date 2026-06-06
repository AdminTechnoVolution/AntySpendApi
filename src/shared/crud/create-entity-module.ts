import { Model } from 'mongoose';
import { SyncableCrudService } from './syncable-crud.service';

export abstract class BaseEntityService extends SyncableCrudService {
  protected constructor(model: Model<unknown>, entityName: string) {
    super(model as never, entityName);
  }
}
