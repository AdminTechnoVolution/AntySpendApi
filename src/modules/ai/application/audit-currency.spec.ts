import { AiService } from './ai.service';

describe('Audit currency preservation', () => {
  const model = { chatCompletionJson: jest.fn() };
  const settings = { findOne: jest.fn() };
  const transactions = { find: jest.fn() };
  const recurring = { find: jest.fn() };
  const categories = { find: jest.fn() };
  let service: AiService;
  const tx = (id: number, code: string, amount: number) => ({ id, title: 'Coffee', amount, currencyCode: code, categoryName: 'Food', daysAgo: 0, occurredAtMillis: Date.now() });
  const pattern = (currencyCode: string, aggregateAmount: number, ids: number[]) => ({ currencyCode, aggregateAmount, associatedTransactionIds: ids, associatedRecurringExpenseIds: [], title: 'Coffee', explanation: 'Habit', savingTip: 'Review', frequency: 'MONTHLY', severity: 'LOW' });
  const output = (...patterns: ReturnType<typeof pattern>[]) => ({ leakScore: 20, leakSummary: 'Audit', detectedLeaks: patterns });
  beforeEach(() => {
    jest.clearAllMocks();
    settings.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({ primaryCurrencyCode: 'USD' }) });
    categories.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
    service = new AiService(model as never, {} as never, categories as never, settings as never, transactions as never, recurring as never);
  });
  it('retains COP and never relabels its aggregate with the primary USD currency', async () => {
    model.chatCompletionJson.mockResolvedValue(output(pattern('COP', 300000, [1])));
    const result = await service.analyzeLeaks('test', { transactions: [tx(1, 'COP', 300000)], primaryCurrencyCode: 'USD' });
    expect(result.detectedLeaks[0].currencyCode).toBe('COP');
    expect(result.totalEstimatedMonthlyLeakImpactByCurrency).toEqual({ COP: 300000 });
    expect(result.totalEstimatedMonthlyLeakImpact).toBe(0);
  });
  it('keeps mixed-currency totals separate', async () => {
    model.chatCompletionJson.mockResolvedValue(output(pattern('COP', 300000, [1]), pattern('USD', 10, [2])));
    const result = await service.analyzeLeaks('test', { transactions: [tx(1, 'COP', 300000), tx(2, 'USD', 10)] });
    expect(result.totalEstimatedMonthlyLeakImpactByCurrency).toEqual({ COP: 300000, USD: 10 });
    expect(result.totalEstimatedMonthlyLeakImpact).toBe(10);
  });
  it('does not mistake ordinary advice or merchant names for a currency label', async () => {
    model.chatCompletionJson.mockResolvedValue({ ...output(pattern('COP', 300000, [1])), leakSummary: 'Try 10 days without coffee from Dollar Store.' });
    await service.analyzeLeaks('test', { transactions: [tx(1, 'COP', 300000)] });
    expect(model.chatCompletionJson).toHaveBeenCalledTimes(1);
  });
  it('repairs a model that assigns COP references to USD, even with both currencies present', async () => {
    model.chatCompletionJson.mockResolvedValueOnce(output(pattern('USD', 300000, [1]))).mockResolvedValueOnce(output(pattern('COP', 300000, [1])));
    const result = await service.analyzeLeaks('test', { transactions: [tx(1, 'COP', 300000), tx(2, 'USD', 10)] });
    expect(result.detectedLeaks[0].currencyCode).toBe('COP');
    expect(model.chatCompletionJson).toHaveBeenCalledTimes(2);
  });
  it('rejects an audit that still changes currencies after one repair', async () => {
    model.chatCompletionJson.mockResolvedValue(output(pattern('USD', 300000, [1])));
    await expect(service.analyzeLeaks('test', { transactions: [tx(1, 'COP', 300000)] })).rejects.toThrow('Audit currency does not match source records');
    expect(model.chatCompletionJson).toHaveBeenCalledTimes(2);
  });
  it.each(['Gastaste 300000 dólares.', 'You spent 300000 USD.'])('rejects a narrative relabeling COP: %s', async (leakSummary) => {
    model.chatCompletionJson.mockResolvedValueOnce({ ...output(pattern('COP', 300000, [1])), leakSummary }).mockResolvedValueOnce({ ...output(pattern('COP', 300000, [1])), leakSummary: 'Gastos: 300000 COP.' });
    const result = await service.analyzeLeaks('test', { transactions: [tx(1, 'COP', 300000)] });
    expect(result.auditSummary).toContain('COP');
    expect(model.chatCompletionJson).toHaveBeenCalledTimes(2);
  });
  it('preserves COP recurring scale and excludes income in database fallback queries', async () => {
    transactions.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([{ id: 'abc12345', originalAmountMinor: 100000, originalCurrencyCode: 'COP', occurredAtMillis: Date.now() }]) });
    recurring.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([{ id: 'abc12346', amountMinor: 300000, currencyCode: 'COP', title: 'Subscription', isActive: true, frequency: 'MONTHLY' }]) });
    model.chatCompletionJson.mockResolvedValue(output());
    await service.analyzeLeaks('test', {});
    const input = JSON.parse(model.chatCompletionJson.mock.calls[0][1]);
    expect(input.recurringExpenses[0].amount).toBe(300000);
    expect(transactions.find.mock.calls[0][0].type).toBe('EXPENSE');
    expect(recurring.find.mock.calls[0][0].transactionType).toEqual({ $ne: 'INCOME' });
  });
});
