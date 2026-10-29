import { MascotChatService } from './mascot-chat.service';
import { MascotTurnRequestDto } from '../dto/ai.dto';

describe('MascotChatService', () => {
  it('trims the current turn, caps history, and sends financial context to the structured model', async () => {
    const openRouter = {
      chatCompletionJson: jest.fn().mockResolvedValue({
        reply: '¿Quieres añadir detalles?',
        intent: 'RECORD_EXPENSE',
        actionFields: [{ name: 'amount', value: '12' }],
        missingFields: ['detailPreference'],
      }),
    };
    const service = new MascotChatService(openRouter as never);
    const dto = {
      message: '  Registra un gasto  ',
      history: Array.from({ length: 14 }, (_, i) => ({
        role: i % 2 ? 'assistant' : 'user',
        content: `turn ${i}`,
      })),
      financialContext: {
        budgets: [{ name: 'Comida', limitMinor: 10000, spentMinor: 4000 }],
      },
      userLanguage: 'es',
    } as MascotTurnRequestDto;

    await expect(service.processTurn(dto)).resolves.toMatchObject({
      intent: 'RECORD_EXPENSE',
    });
    const [, userContent, schemaName, schema] =
      openRouter.chatCompletionJson.mock.calls[0];
    const parsed = JSON.parse(userContent);
    expect(parsed.currentMessage).toBe('Registra un gasto');
    expect(parsed.history).toHaveLength(12);
    expect(parsed.financialContext.budgets[0].name).toBe('Comida');
    expect(schemaName).toBe('anty_mascot_turn');
    expect(schema.properties.actionFields.type).toBe('array');
  });
});

describe('Mascot financial conversation v2', () => {
  const query = {
    entity: 'TRANSACTION',
    scope: 'BOTH',
    period: 'THIS_MONTH',
    startDate: '',
    endDate: '',
    search: '',
    categoryId: '',
    walletId: '',
    parentId: '',
    offset: 0,
  };
  const action = {
    operation: 'CREATE',
    entity: 'TRANSACTION',
    scope: 'PRIVATE',
    targetId: '',
    fields: [{ name: 'amount', value: '10' }],
    missingFields: [],
  };
  const dto = {
    message: 'Registra 10 de hamburguesa',
    conversationId: 'conversation-1',
    turnId: 'turn-1',
    userLanguage: 'es',
  };
  const response = (decision: string, extra = {}) => ({
    reply: 'Respuesta',
    decision,
    queries: [],
    actions: [],
    ...extra,
  });
  let model: { chatCompletionJson: jest.Mock };
  let service: MascotChatService;
  beforeEach(() => {
    model = { chatCompletionJson: jest.fn() };
    service = new MascotChatService(model as never);
  });

  it('echoes trusted conversation IDs instead of accepting model IDs', async () => {
    model.chatCompletionJson.mockResolvedValue(
      response('ACTIONS', { actions: [action] }),
    );
    await expect(service.processTurnV2(dto)).resolves.toMatchObject({
      conversationId: 'conversation-1',
      turnId: 'turn-1',
      actions: [action],
    });
    const [prompt, content, schemaName] =
      model.chatCompletionJson.mock.calls[0];
    expect(schemaName).toBe('anty_financial_turn_v2');
    expect(JSON.parse(content).currentMessage).toBe(dto.message);
    expect(prompt).toContain('No preguntes por detalles opcionales');
    expect(prompt).toContain('ingresos menos gastos');
  });

  it('supports multiple expenses in one turn', async () => {
    model.chatCompletionJson.mockResolvedValue(
      response('ACTIONS', {
        actions: [
          action,
          { ...action, fields: [{ name: 'amount', value: '20' }] },
        ],
      }),
    );
    expect((await service.processTurnV2(dto)).actions).toHaveLength(2);
  });

  it('uses the device calendar and fresh results instead of historical monthly answers', async () => {
    model.chatCompletionJson.mockResolvedValue(
      response('QUERY', { queries: [query] }),
    );
    await service.processTurnV2({
      ...dto,
      message: 'cuánto me he gastado en el mes actual',
      history: [
        { role: 'assistant', content: 'El mes pasado te gastaste 90 USD.' },
      ],
      financialContext: {
        currentDate: '2026-10-28',
        currentMonth: '2026-10',
        zoneId: 'America/Bogota',
      },
    });
    const [prompt, content] = model.chatCompletionJson.mock.calls[0];
    expect(prompt).toContain('financialContext.currentDate');
    expect(prompt).toContain('LAST_MONTH es únicamente el mes pasado');
    expect(prompt).toContain(
      'Las cifras del historial no son resultados vigentes',
    );
    expect(JSON.parse(content).financialContext.currentMonth).toBe('2026-10');
  });

  it('preserves complete aggregate results without the legacy 80 transaction truncation', async () => {
    const results = {
      queryResults: [
        {
          totalCount: 501,
          expenseMinor: 50100,
          records: Array.from({ length: 25 }, (_, id) => ({ id })),
        },
      ],
    };
    model.chatCompletionJson.mockResolvedValue(response('ANSWER'));
    await service.processTurnV2({ ...dto, financialContext: results });
    expect(
      JSON.parse(model.chatCompletionJson.mock.calls[0][1]).financialContext,
    ).toEqual(results);
  });

  it.each([
    'WALLET',
    'CATEGORY',
    'BUDGET',
    'DEBT',
    'DEBT_MOVEMENT',
    'LOAN',
    'LOAN_REPAYMENT',
    'RECURRING',
    'SAVINGS',
    'SAVINGS_MOVEMENT',
    'INVESTMENT',
    'INVESTMENT_MOVEMENT',
  ])('allows querying %s', async (entity) => {
    model.chatCompletionJson.mockResolvedValue(
      response('QUERY', { queries: [{ ...query, entity }] }),
    );
    await expect(service.processTurnV2(dto)).resolves.toMatchObject({
      decision: 'QUERY',
    });
  });

  it.each([
    null,
    response('ANSWER', { reply: '' }),
    response('DELETE_EVERYTHING'),
    response('QUERY'),
    response('QUERY', { reply: '', queries: [query] }),
    response('QUERY', { queries: [{ ...query, scope: 'SOMEONE_ELSE' }] }),
    response('QUERY', { queries: [{ ...query, offset: -1 }] }),
    response('QUERY', { queries: [{ ...query, offset: 1.5 }] }),
    response('ACTIONS'),
    response('ACTIONS', { actions: [{ ...action, targetLabel: null }] }),
    response('ACTIONS', { actions: [{ ...action, referenceLabels: {} }] }),
    response('ACTIONS', {
      actions: [{ ...action, fields: [{ name: 'amount', value: '}] } ,' }] }],
    }),
    response('ACTIONS', {
      actions: [{ ...action, fields: [{ name: 'amount', value: '1,000' }] }],
    }),
    response('ACTIONS', { actions: [{ ...action, operation: 'EXECUTE_SQL' }] }),
    response('ACTIONS', { actions: [{ ...action, scope: 'BOTH' }] }),
    response('ACTIONS', {
      actions: [{ ...action, fields: [{ name: 'amount', value: 10 }] }],
    }),
    response('ACTIONS', {
      actions: [
        {
          ...action,
          fields: [
            { name: 'amount', value: '10' },
            { name: 'amount', value: '20' },
          ],
        },
      ],
    }),
    response('CONFIRM', { actions: [action] }),
    response('ANSWER', { queries: [query] }),
    response('ACTIONS', { actions: [action], queries: [query] }),
  ])('rejects malformed or contradictory model output %#', async (invalid) => {
    model.chatCompletionJson.mockResolvedValue(invalid);
    await expect(service.processTurnV2(dto)).rejects.toThrow(
      'Invalid financial assistant response',
    );
  });

  it('forces a grounded final answer after completed queries instead of requesting more filters', async () => {
    model.chatCompletionJson.mockResolvedValue(
      response('ANSWER', { reply: 'Esta semana gastaste 12 USD.' }),
    );
    await service.processTurnV2({
      ...dto,
      message: 'cuales son mis gastos de esta semana?',
      financialContext: {
        responseMode: 'SUMMARIZE_RESULTS',
        queryResults: [
          {
            status: 'COMPLETED',
            query: { ...query, period: 'THIS_WEEK' },
            results: [],
          },
        ],
      },
    });
    const [prompt, , , schema] = model.chatCompletionJson.mock.calls[0];
    expect(prompt).toContain('FASE FINAL');
    expect(prompt).toContain('nunca una promesa');
    expect(prompt).not.toContain('Para CREATE TRANSACTION');
    expect(schema.properties.decision.enum).toEqual(['ANSWER']);
    expect(schema.properties.queries.maxItems).toBe(0);
    expect(schema.properties.actions.maxItems).toBe(0);
  });

  it.each([
    'MERCHANT',
    'CURRENCY',
    'EXCHANGE_RATE',
    'CATEGORY_RULE',
    'EXPENSE_SPLIT',
    'EXPENSE_SPLIT_LINE',
    'SETTLEMENT',
    'BUDGET_QUOTA',
    'LOCAL_SPLIT',
    'TAG',
    'TAG_LINK',
    'HOUSEHOLD',
    'HOUSEHOLD_MEMBER',
    'SETTINGS',
  ])('maps read-only entity %s and rejects its writes', async (entity) => {
    model.chatCompletionJson.mockResolvedValue(
      response('QUERY', { queries: [{ ...query, entity }] }),
    );
    expect(
      (
        await service.processTurnV2({
          ...dto,
          financialContext: { dataCatalog: { entities: [entity] } },
        })
      ).queries[0],
    ).toMatchObject({
      entity,
    });
    model.chatCompletionJson.mockResolvedValue(
      response('ACTIONS', { actions: [{ ...action, entity }] }),
    );
    await expect(
      service.processTurnV2({
        ...dto,
        financialContext: { dataCatalog: { entities: [entity] } },
      }),
    ).rejects.toThrow('Invalid financial assistant response');
  });

  it('rejects a query when final synthesis was requested', async () => {
    model.chatCompletionJson.mockResolvedValue(
      response('QUERY', { queries: [query] }),
    );
    await expect(
      service.processTurnV2({
        ...dto,
        financialContext: { responseMode: 'SUMMARIZE_RESULTS' },
      }),
    ).rejects.toThrow('Assistant did not finalize');
  });

  it('does not offer unsupported tools to older Android installations', async () => {
    model.chatCompletionJson.mockResolvedValue(
      response('QUERY', { queries: [query] }),
    );
    await service.processTurnV2(dto);
    const schema = model.chatCompletionJson.mock.calls[0][3];
    expect(schema.properties.queries.items.properties.groupBy).toBeUndefined();
    expect(
      schema.properties.queries.items.properties.entity.enum,
    ).not.toContain('TAG');
  });

  it('repairs an equivalent weekly tool loop for older apps inside the API', async () => {
    const weekly = {
      ...query,
      period: 'THIS_WEEK',
      startDate: '2026-10-26',
      endDate: '2026-10-30',
    };
    model.chatCompletionJson
      .mockResolvedValueOnce(
        response('QUERY', { queries: [{ ...weekly, endDate: '2026-10-29' }] }),
      )
      .mockResolvedValueOnce(
        response('ANSWER', { reply: 'Esta semana gastaste 12.34 USD.' }),
      );
    const answer = await service.processTurnV2({
      ...dto,
      message: 'cuales son mis gastos de esta semana?',
      financialContext: {
        queryResults: [
          {
            query: { ...weekly, offset: '0' },
            results: [{ scope: 'PRIVATE', totalCount: '2' }],
          },
        ],
      },
    });
    expect(answer.decision).toBe('ANSWER');
    expect(model.chatCompletionJson).toHaveBeenCalledTimes(2);
    expect(
      model.chatCompletionJson.mock.calls[1][3].properties.decision.enum,
    ).toEqual(['ANSWER']);
  });

  it('keeps genuinely new category filters instead of finalizing a different query', async () => {
    model.chatCompletionJson.mockResolvedValue(
      response('QUERY', { queries: [{ ...query, categoryId: 'food' }] }),
    );
    const answer = await service.processTurnV2({
      ...dto,
      financialContext: { queryResults: [{ query, results: [] }] },
    });
    expect(answer.decision).toBe('QUERY');
    expect(model.chatCompletionJson).toHaveBeenCalledTimes(1);
  });

  it('returns only new tools in a mixed repeated-and-new model plan', async () => {
    model.chatCompletionJson.mockResolvedValue(
      response('QUERY', {
        queries: [query, { ...query, entity: 'WALLET', period: 'ALL' }],
      }),
    );
    const answer = await service.processTurnV2({
      ...dto,
      financialContext: { queryResults: [{ query, results: [] }] },
    });
    expect(answer.queries).toHaveLength(1);
    expect(answer.queries[0]).toMatchObject({ entity: 'WALLET' });
    expect(model.chatCompletionJson).toHaveBeenCalledTimes(1);
  });

  it('rejects oversized financial context before making a model call', async () => {
    await expect(
      service.processTurnV2({
        ...dto,
        financialContext: { data: 'x'.repeat(180001) },
      }),
    ).rejects.toThrow('Financial query context too large');
    expect(model.chatCompletionJson).not.toHaveBeenCalled();
  });
});
