

export interface MonitorServiceInterface {
    setTransactionName(transactionName: string): void;
    context(key: string, value: any): void;
    log(...message: any[]): void;
    error(value: any): void;
    preventPublishing(): void;
    publish(): Promise<void>;
}