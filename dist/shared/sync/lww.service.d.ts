import { Model } from 'mongoose';
import { SyncChange } from './sync.types';
import { SyncMetadataDocument } from './sync-metadata.schema';
export type LwwOutcome = 'accept' | 'reject' | 'noop';
export interface LwwDecision {
    outcome: LwwOutcome;
    reason?: string;
}
export declare function decideLww(clientChange: Pick<SyncChange, 'updatedAtMillis' | 'deviceId'>, serverUpdatedAtMillis: number | undefined, serverDeviceId: string | undefined): LwwDecision;
export declare class LwwService {
    private readonly syncMetadataModel;
    constructor(syncMetadataModel: Model<SyncMetadataDocument>);
    decide(clientChange: SyncChange, serverUpdatedAtMillis: number | undefined, serverDeviceId: string | undefined): LwwDecision;
    bumpServerVersion(userId: string): Promise<string>;
    getServerVersion(userId: string): Promise<string>;
}
