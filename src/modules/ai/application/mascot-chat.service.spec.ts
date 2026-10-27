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
      history: Array.from({ length: 14 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: `turn ${i}` })),
      financialContext: { budgets: [{ name: 'Comida', limitMinor: 10000, spentMinor: 4000 }] },
      userLanguage: 'es',
    } as MascotTurnRequestDto;

    await expect(service.processTurn(dto)).resolves.toMatchObject({ intent: 'RECORD_EXPENSE' });
    const [, userContent, schemaName, schema] = openRouter.chatCompletionJson.mock.calls[0];
    const parsed = JSON.parse(userContent);
    expect(parsed.currentMessage).toBe('Registra un gasto');
    expect(parsed.history).toHaveLength(12);
    expect(parsed.financialContext.budgets[0].name).toBe('Comida');
    expect(schemaName).toBe('anty_mascot_turn');
    expect(schema.properties.actionFields.type).toBe('array');
  });
});
