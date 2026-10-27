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
    response('QUERY', { queries: [{ ...query, scope: 'SOMEONE_ELSE' }] }),
    response('QUERY', { queries: [{ ...query, offset: -1 }] }),
    response('QUERY', { queries: [{ ...query, offset: 1.5 }] }),
    response('ACTIONS'),
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
