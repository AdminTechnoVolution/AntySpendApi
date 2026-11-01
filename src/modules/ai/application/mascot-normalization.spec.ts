import { canonicalAmount, normalizeModelOutput } from './mascot-normalization';

describe('mascot output normalization', () => {
  it.each([
    ['15.000', '15000'],
    ['15,000', '15000'],
    ['20,50', '20.5'],
    ['1.500,75', '1500.75'],
    ['1,500.75', '1500.75'],
    ['15 mil', '15000'],
    ['20 lucas', '20000'],
    ['1.5k', '1500'],
    ['2 millones', '2000000'],
    ['2,5 millones', '2500000'],
    ['$ 20', '20'],
    ['€12.5', '12.5'],
    ['10', '10'],
    ['999999999999', '999999999999'],
  ])('reads %s as %s', (raw, expected) => {
    expect(canonicalAmount(raw)).toBe(expected);
  });

  it('returns null for words without a number', () => {
    expect(canonicalAmount('mucho')).toBeNull();
  });

  it('maps field synonyms, keeps canonical names and normalizes amounts', () => {
    const output = normalizeModelOutput({
      decision: 'ACTIONS',
      actions: [
        {
          entity: 'TRANSACTION',
          fields: [
            { name: 'category', value: 'comida' },
            { name: 'description', value: 'Almuerzo' },
            { name: 'monto', value: '15.000' },
            { name: 'wallet', value: 'Nequi' },
            { name: 'currency', value: 'COP' },
          ],
          missingFields: ['category', 'walletName'],
        },
      ],
    }) as { actions: Array<{ fields: unknown[]; missingFields: string[] }> };
    expect(output.actions[0].fields).toEqual([
      { name: 'categoryName', value: 'comida' },
      { name: 'title', value: 'Almuerzo' },
      { name: 'amount', value: '15000' },
      { name: 'walletName', value: 'Nequi' },
      { name: 'currencyCode', value: 'COP' },
    ]);
    expect(output.actions[0].missingFields).toEqual([]);
  });

  it('names the creditor of a debt and the debtor of a loan', () => {
    const output = normalizeModelOutput({
      actions: [
        {
          entity: 'DEBT',
          fields: [
            { name: 'creditor', value: 'Juan' },
            { name: 'amount', value: '300' },
          ],
          missingFields: [],
        },
        {
          entity: 'LOAN',
          fields: [
            { name: 'name', value: 'Ana' },
            { name: 'amount', value: '50' },
          ],
          missingFields: [],
        },
      ],
    }) as {
      actions: Array<{ fields: Array<{ name: string; value: string }> }>;
    };
    expect(output.actions[0].fields[0]).toEqual({
      name: 'name',
      value: 'Juan',
    });
    expect(output.actions[1].fields[0]).toEqual({
      name: 'person',
      value: 'Ana',
    });
  });

  it('turns an unreadable amount into a question instead of an invalid response', () => {
    const output = normalizeModelOutput({
      actions: [
        {
          entity: 'TRANSACTION',
          fields: [{ name: 'amount', value: 'un montón' }],
          missingFields: [],
        },
      ],
    }) as { actions: Array<{ fields: unknown[]; missingFields: string[] }> };
    expect(output.actions[0].fields).toEqual([]);
    expect(output.actions[0].missingFields).toEqual(['amount']);
  });
});
