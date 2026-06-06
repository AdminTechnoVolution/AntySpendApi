import { of } from 'rxjs';
import { ExchangeRatesService } from './exchange-rates.service';

describe('ExchangeRatesService daily cache', () => {
  const findOne = jest.fn();
  const findOneAndUpdate = jest.fn();
  const snapshotModel = { findOne, findOneAndUpdate };

  const httpGet = jest.fn();
  const http = { get: httpGet };

  const configGet = jest.fn();
  const config = { get: configGet };

  let service: ExchangeRatesService;

  const dayOneMillis = Date.UTC(2026, 5, 6, 12, 0, 0, 0);
  const dayTwoMillis = Date.UTC(2026, 5, 7, 12, 0, 0, 0);
  const dayOneUtc = '2026-06-06';
  const dayTwoUtc = '2026-06-07';

  const apiRates = { EUR: 0.92, MXN: 17.5 };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(dayOneMillis);
    configGet.mockReturnValue('test-token');
    httpGet.mockReturnValue(
      of({
        data: { result: 'success', conversion_rates: apiRates },
      }),
    );
    service = new ExchangeRatesService(
      snapshotModel as never,
      http as never,
      config as never,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function mockFindOneLean(result: unknown) {
    findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(result),
    });
  }

  it('returns today snapshot without calling ExchangeRate-API', async () => {
    const snapshot = {
      baseCurrency: 'USD',
      snapshotDate: dayOneUtc,
      rates: { EUR: 0.9 },
      fetchedAtMillis: dayOneMillis,
      expiresAtMillis: dayOneMillis + 86_400_000,
    };
    mockFindOneLean(snapshot);

    const result = await service.getLatest();

    expect(findOne).toHaveBeenCalledWith({
      baseCurrency: 'USD',
      snapshotDate: dayOneUtc,
    });
    expect(httpGet).not.toHaveBeenCalled();
    expect(findOneAndUpdate).not.toHaveBeenCalled();
    expect(result).toEqual({
      base: 'USD',
      rates: { EUR: 0.9 },
      fetchedAtMillis: dayOneMillis,
      cached: true,
    });
  });

  it('calls ExchangeRate-API once when no snapshot exists for today', async () => {
    mockFindOneLean(null);
    findOneAndUpdate.mockResolvedValue({
      baseCurrency: 'USD',
      rates: apiRates,
      fetchedAtMillis: dayOneMillis,
    });

    const result = await service.getLatest();

    expect(httpGet).toHaveBeenCalledTimes(1);
    expect(findOneAndUpdate).toHaveBeenCalledWith(
      { baseCurrency: 'USD', snapshotDate: dayOneUtc },
      expect.objectContaining({
        $set: expect.objectContaining({
          rates: apiRates,
          fetchedAtMillis: dayOneMillis,
        }),
        $setOnInsert: { baseCurrency: 'USD', snapshotDate: dayOneUtc },
      }),
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
    expect(result).toEqual({
      base: 'USD',
      rates: apiRates,
      fetchedAtMillis: dayOneMillis,
      cached: false,
    });
  });

  it('does not call ExchangeRate-API again on second request the same UTC day', async () => {
    const persisted = {
      baseCurrency: 'USD',
      snapshotDate: dayOneUtc,
      rates: apiRates,
      fetchedAtMillis: dayOneMillis,
    };

    mockFindOneLean(null);
    findOneAndUpdate.mockResolvedValue(persisted);

    const first = await service.getLatest();
    expect(first.cached).toBe(false);
    expect(httpGet).toHaveBeenCalledTimes(1);

    mockFindOneLean(persisted);

    const second = await service.getLatest();
    expect(second).toEqual({
      base: 'USD',
      rates: apiRates,
      fetchedAtMillis: dayOneMillis,
      cached: true,
    });
    expect(httpGet).toHaveBeenCalledTimes(1);
  });

  it('calls ExchangeRate-API again on the next UTC day', async () => {
    mockFindOneLean(null);
    findOneAndUpdate.mockResolvedValue({
      baseCurrency: 'USD',
      rates: apiRates,
      fetchedAtMillis: dayOneMillis,
    });

    await service.getLatest();
    expect(httpGet).toHaveBeenCalledTimes(1);

    jest.spyOn(Date, 'now').mockReturnValue(dayTwoMillis);
    mockFindOneLean(null);
    findOneAndUpdate.mockResolvedValue({
      baseCurrency: 'USD',
      rates: { EUR: 0.93, MXN: 17.6 },
      fetchedAtMillis: dayTwoMillis,
    });

    const result = await service.getLatest();

    expect(findOne).toHaveBeenLastCalledWith({
      baseCurrency: 'USD',
      snapshotDate: dayTwoUtc,
    });
    expect(httpGet).toHaveBeenCalledTimes(2);
    expect(result.cached).toBe(false);
    expect(result.fetchedAtMillis).toBe(dayTwoMillis);
  });
});
