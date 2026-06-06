import { sanitizeDocumentForStorage } from './strip-mongo-keys';

describe('sanitizeDocumentForStorage', () => {
  it('removes top-level Mongo operator keys', () => {
    expect(sanitizeDocumentForStorage({ $gt: 1, name: 'Cash' })).toEqual({
      name: 'Cash',
    });
  });

  it('removes keys containing dots', () => {
    expect(
      sanitizeDocumentForStorage({ 'user.name': 'x', title: 'ok' }),
    ).toEqual({ title: 'ok' });
  });

  it('strips nested operator keys', () => {
    expect(
      sanitizeDocumentForStorage({
        meta: { $where: '1', note: 'keep' },
        amount: 100,
      }),
    ).toEqual({
      meta: { note: 'keep' },
      amount: 100,
    });
  });

  it('preserves primitive arrays', () => {
    expect(
      sanitizeDocumentForStorage({ tags: ['a', 'b'], $set: {} }),
    ).toEqual({ tags: ['a', 'b'] });
  });
});
