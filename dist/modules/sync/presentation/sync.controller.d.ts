import type { AuthenticatedUser } from '../../../shared/auth/jwt-payload.interface';
import { SyncPullQueryDto, SyncPushRequestDto } from '../../../shared/swagger/sync.dto';
import { SyncService } from '../application/sync.service';
export declare class SyncController {
    private readonly syncService;
    constructor(syncService: SyncService);
    push(user: AuthenticatedUser, body: SyncPushRequestDto): Promise<import("../../../shared/sync/sync.types").SyncPushResult>;
    pull(user: AuthenticatedUser, query: SyncPullQueryDto): Promise<import("../../../shared/sync/sync.types").SyncPullResult>;
}
