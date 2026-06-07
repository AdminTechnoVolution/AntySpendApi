import { AccountDeletionService } from './account-deletion.service';

describe('AccountDeletionService', () => {
  const userId = '507f1f77bcf86cd799439011';

  const makeModel = () => ({
    deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  });

  const settingsModel = makeModel();
  const walletModel = makeModel();
  const categoryModel = makeModel();
  const merchantModel = makeModel();
  const transactionModel = makeModel();
  const budgetModel = makeModel();
  const recurringModel = makeModel();
  const savingsPlanModel = makeModel();
  const savingsMovementModel = makeModel();
  const investmentModel = makeModel();
  const investmentMovementModel = makeModel();
  const refreshTokenModel = makeModel();
  const syncMetadataModel = makeModel();
  const userModel = {
    findByIdAndDelete: jest.fn().mockResolvedValue({ _id: userId }),
  };

  let service: AccountDeletionService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AccountDeletionService(
      settingsModel as never,
      walletModel as never,
      categoryModel as never,
      merchantModel as never,
      transactionModel as never,
      budgetModel as never,
      recurringModel as never,
      savingsPlanModel as never,
      savingsMovementModel as never,
      investmentModel as never,
      investmentMovementModel as never,
      refreshTokenModel as never,
      syncMetadataModel as never,
      userModel as never,
    );
  });

  it('deletes all user-scoped collections then the user document', async () => {
    const result = await service.deleteUserAccount(userId);

    expect(result).toEqual({ success: true });

    const entityModels = [
      settingsModel,
      walletModel,
      categoryModel,
      merchantModel,
      transactionModel,
      budgetModel,
      recurringModel,
      savingsPlanModel,
      savingsMovementModel,
      investmentModel,
      investmentMovementModel,
    ];

    for (const model of entityModels) {
      expect(model.deleteMany).toHaveBeenCalledWith({ userId });
    }

    expect(refreshTokenModel.deleteMany).toHaveBeenCalledWith({ userId });
    expect(syncMetadataModel.deleteMany).toHaveBeenCalledWith({ userId });
    expect(userModel.findByIdAndDelete).toHaveBeenCalledWith(userId);
  });
});
