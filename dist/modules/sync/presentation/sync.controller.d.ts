import type { AuthenticatedUser } from '../../../shared/auth/jwt-payload.interface';
import type { SyncPushRequest } from '../../../shared/sync/sync.types';
import { SyncPullQueryDto } from '../../../shared/swagger/sync.dto';
import { SyncService } from '../application/sync.service';
export declare class SyncController {
    private readonly syncService;
    constructor(syncService: SyncService);
    push(user: AuthenticatedUser, body: SyncPushRequest): Promise<import("../../../shared/sync/sync.types").SyncPushResult>;
    pull(user: AuthenticatedUser, query: SyncPullQueryDto): Promise<import("../../../shared/sync/sync.types").SyncPullResult>;
}
