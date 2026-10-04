import { SyncService } from './sync.service';
import { LwwService } from '../../../shared/sync/lww.service';
import { HouseholdAuthzService } from '../../households/application/household-authz.service';
import { SyncChange } from '../../../shared/sync/sync.types';
const loanId = 'a'.repeat(32), walletId = 'b'.repeat(32), paymentId = 'c'.repeat(32);
const generic = { findOne: jest.fn(() => ({ lean: jest.fn().mockResolvedValue(null) })), findOneAndUpdate: jest.fn().mockResolvedValue({}) };
const wallets = { ...generic, findOne: jest.fn(), exists: jest.fn() };
const loans = { ...generic, findOne: jest.fn(), findOneAndUpdate: jest.fn(), exists: jest.fn(), updateOne: jest.fn().mockResolvedValue({}) };
const payments = { ...generic, findOne: jest.fn(), findOneAndUpdate: jest.fn(), exists: jest.fn(), updateMany: jest.fn().mockResolvedValue({}) };
const lww = { decide: jest.fn().mockReturnValue({ outcome: 'apply' }), bumpServerVersion: jest.fn().mockResolvedValue('2'), getServerVersion: jest.fn().mockResolvedValue('1') };
const authz = { resolveHouseholdId: jest.fn(), buildEntityFilter: jest.fn((userId, change) => ({ userId, id: change.entityId })), authorizeSyncChange: jest.fn().mockResolvedValue({ allowed: true }) };
const service = new SyncService(generic as never, wallets as never, generic as never, generic as never, generic as never,
  generic as never, generic as never, generic as never, generic as never, generic as never, generic as never, generic as never,
  generic as never, generic as never, generic as never, generic as never, lww as unknown as LwwService, authz as unknown as HouseholdAuthzService,
  generic as never, loans as never, payments as never);
const principal = { id: loanId, person: 'Ana', amountMinor: 10000, currencyCode: 'USD', walletServerId: walletId, method: 'CASH', dateMillis: 1000 };
function loanChange(payload = principal): SyncChange { return { entityType: 'personal_loans', entityId: loanId, updatedAtMillis: 1000, payload }; }
function paymentChange(): SyncChange { return { entityType: 'personal_loan_repayments', entityId: paymentId, updatedAtMillis: 1001, payload: { loanServerId: loanId, walletServerId: walletId, amountMinor: 4000, method: 'TRANSFER', dateMillis: 1001 } }; }
async function push(change: SyncChange) { return service.push('owner', { changes: [change], deviceId: 'device' }); }
beforeEach(() => {
  jest.clearAllMocks();
  wallets.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({ id: walletId, userId: 'owner', currencyCode: 'USD' }) });
  loans.findOne.mockImplementation((filter) => ({ lean: jest.fn().mockResolvedValue(filter.id === loanId ? principal : null) }));
  loans.findOneAndUpdate.mockResolvedValue(principal);
  payments.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
  payments.findOneAndUpdate.mockResolvedValue({});
  loans.exists.mockResolvedValue(null); payments.exists.mockResolvedValue(null);
});
describe('Personal loan sync', () => {
  it('accepts a private loan without altering transaction records', async () => {
    loans.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
    expect((await push(loanChange())).accepted).toEqual([loanId]);
    expect(wallets.findOne).toHaveBeenCalledWith(expect.objectContaining({ userId: 'owner', id: walletId }));
    expect(generic.findOneAndUpdate).not.toHaveBeenCalled();
  });
  it.each([['empty person', { ...principal, person: '' }, 'LOAN_INVALID_PERSON'],
    ['zero amount', { ...principal, amountMinor: 0 }, 'LOAN_INVALID_AMOUNT'],
    ['negative amount', { ...principal, amountMinor: -1 }, 'LOAN_INVALID_AMOUNT'],
    ['wrong method', { ...principal, method: 'CARD' }, 'LOAN_INVALID_METHOD'],
    ['wrong currency', { ...principal, currencyCode: 'EUR' }, 'LOAN_CURRENCY_MISMATCH']])('rejects %s', async (_label, payload, reason) => {
      loans.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
      expect((await push(loanChange(payload as typeof principal))).rejected[0].reason).toBe(reason);
  });
  it('rejects household visibility', async () => {
    const change = loanChange(); change.payload.householdId = 'household';
    expect((await push(change)).rejected[0].reason).toBe('LOAN_PRIVATE_ONLY');
  });
  it('reserves repayment atomically with an owner-scoped amount limit', async () => {
    expect((await push(paymentChange())).accepted).toEqual([paymentId]);
    expect(loans.findOneAndUpdate).toHaveBeenCalledWith(expect.objectContaining({ userId: 'owner', id: loanId, $expr: expect.any(Object) }), { $set: { ['repaymentAmounts.' + paymentId]: 4000 } });
    expect(payments.findOneAndUpdate).toHaveBeenCalledTimes(1);
  });
  it('rejects concurrent overpayment without saving the payment', async () => {
    loans.findOneAndUpdate.mockResolvedValue(null);
    expect((await push(paymentChange())).rejected[0].reason).toBe('LOAN_OVERPAYMENT_CONFLICT');
    expect(payments.findOneAndUpdate).not.toHaveBeenCalled();
  });
  it('does not accept a parent loan belonging to another account', async () => {
    loans.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
    expect((await push(paymentChange())).rejected[0].reason).toBe('LOAN_MISSING_PARENT');
    expect(loans.findOne).toHaveBeenCalledWith(expect.objectContaining({ userId: 'owner' }));
  });
  it('blocks deletion of a wallet referenced by a loan', async () => {
    loans.exists.mockResolvedValue(principal);
    const change: SyncChange = { entityType: 'wallets', entityId: walletId, updatedAtMillis: 1001, deletedAtMillis: 1001, payload: {} };
    expect((await push(change)).rejected[0].reason).toBe('LOAN_WALLET_IN_USE');
  });
  it('releasing a payment removes its claim so the balance can reopen', async () => {
    const old = paymentChange(); payments.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(old.payload) });
    old.deletedAtMillis = 1002;
    expect((await push(old)).accepted).toEqual([paymentId]);
    expect(loans.updateOne).toHaveBeenCalledWith({ userId: 'owner', id: loanId }, { $unset: { ['repaymentAmounts.' + paymentId]: '' } });
  });
});
