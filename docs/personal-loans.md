# Personal loans

Private loans and repayments use `personal_loans` and `personal_loan_repayments` in the existing sync endpoints. Authentication, owner isolation and the existing sync entitlement policy apply. Creating and managing loans locally has no additional premium requirement.

Loan payload: `person`, `amountMinor`, `currencyCode`, `walletServerId`, `method`, `dateMillis`, `createdAtMillis`, `updatedAtMillis`. Repayment payload: `loanServerId`, `amountMinor`, `walletServerId`, `method`, `dateMillis`, `createdAtMillis`, `updatedAtMillis`. Stable IDs and deletion/update metadata use the existing sync envelope. Methods are `TRANSFER`, `CASH`, `OTHER`. Amounts are positive safe integers in currency minor units.

Principal debits the originating wallet; repayments credit the receiving wallet. These movements are not transaction income or expenses. Wallet references must belong to the owner, be private and use the loan currency. A referenced wallet cannot be deleted or change currency. Principal, currency and originating wallet cannot change; delete and recreate instead.

The server atomically reserves repayment amounts on the parent loan, keyed by repayment ID, before accepting repayments. Repeated pushes of the same ID do not count twice. An excess repayment is rejected with `LOAN_OVERPAYMENT_CONFLICT`. Clients keep the local repayment, visibly mark the conflict and let the owner delete the mistaken payment. Remaining balances never render negative. Repayment deletion releases its reservation; loan deletion tombstones associated repayments.

Persistence: Android Room version 23 adds independent tables; iOS Core Data AntyV14 adds independent entities. Backups include both collections and accept previous backups without them. Account deletion removes both server collections.

## Release order

1. Deploy the API supporting both entity types before distributing either app.
2. Verify Android-to-iOS and iOS-to-Android sync on staging with private accounts, partial and complete repayments, offline edits and simultaneous repayments.
3. Verify account deletion and old backup restoration on staging.
4. Test the screens, accessibility and confirmations on physical devices before store release.

No deployment or store publication is included in this implementation. Local automated checks cover domain behavior, persistence/migrations, sync serialization and API validation; they do not replace an integration test against a deployed MongoDB/API with both physical clients.

## Local validation

- API: build successful; 215 tests passed across 28 suites.
- iOS: simulator build successful; 123 Swift tests passed, including Core Data migration and loan persistence.
- Android: debug build successful; 368 unit tests passed; two isolated emulator tests passed for Room persistence/reversal and the 22→23 migration.
- Physical-device cross-platform sync and deployed database concurrency remain release verification tasks.
