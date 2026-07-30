import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SyncChangeDto } from './sync.dto';

describe('SyncChangeDto entityId compatibility', () => {
  const validateEntityId = (entityId: string) =>
    validate(
      plainToInstance(SyncChangeDto, {
        entityType: 'wallets',
        entityId,
        updatedAtMillis: 1,
        payload: {},
      }),
    );

  it('accepts the new 32-character Android id', async () => {
    await expect(
      validateEntityId('1234567890abcdef1234567890abcdef'),
    ).resolves.toHaveLength(0);
  });

  it('accepts a canonical UUID produced by existing Android installs', async () => {
    await expect(
      validateEntityId('123e4567-e89b-42d3-a456-426614174000'),
    ).resolves.toHaveLength(0);
  });

  it('rejects malformed ids', async () => {
    await expect(validateEntityId('wallet:1')).resolves.not.toHaveLength(0);
  });
});
