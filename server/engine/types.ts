export interface DualPunchParams {
    p1Success: number;
    flashFeeBps: bigint;
    safetyBetaBps: bigint;
    gasCostWei: bigint;
    failureLossWei: bigint;
    minProfitWei: bigint;
    p1Min: number;
    minFlashloanWei: bigint;
}

export interface C2ExecutionConfig {
    targetContract: string;
    walletAddress: string;
    privateKey: string;
    anvilRpcUrl: string;
    mainnetRpcUrl: string;
    anvilActive: boolean;
}
