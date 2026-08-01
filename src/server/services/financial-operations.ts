import "server-only";

/**
 * Reserved boundary for future protected financial operations.
 * Implementations must validate the server session and permission, use an
 * atomic database operation, and create immutable transaction and audit data.
 */
export type FinancialOperationBoundary = never;
