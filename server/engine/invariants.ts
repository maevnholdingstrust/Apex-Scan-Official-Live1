export enum PoolVariantType {
    ConstantProduct = "ConstantProduct",
    UniV3 = "UniV3",
    BalancerWeighted = "BalancerWeighted",
    CurveStable = "CurveStable"
}

export interface ConstantProductParams {
    reserveIn: bigint;
    reserveOut: bigint;
    feeBps: bigint;
}

export interface UniV3Params {
    liquidity: bigint;
    sqrtPriceX96: bigint;
    feeBps: bigint;
}

export interface BalancerWeightedParams {
    balanceIn: bigint;
    weightIn: bigint;
    balanceOut: bigint;
    weightOut: bigint;
    swapFeeBps: bigint;
}

export interface CurveStableParams {
    balances: bigint[];
    A: bigint;
    fee: bigint;
}

export type PoolVariant = 
    | { type: PoolVariantType.ConstantProduct; params: ConstantProductParams }
    | { type: PoolVariantType.UniV3; params: UniV3Params }
    | { type: PoolVariantType.BalancerWeighted; params: BalancerWeightedParams }
    | { type: PoolVariantType.CurveStable; params: CurveStableParams };

export class InvariantMath {
    static getAmountOutConstantProduct(amountIn: bigint, reserves: ConstantProductParams): bigint {
        const amountInWithFee = amountIn * (10000n - reserves.feeBps);
        const numerator = amountInWithFee * reserves.reserveOut;
        const denominator = (reserves.reserveIn * 10000n) + amountInWithFee;
        return numerator / denominator;
    }

    static getAmountOutBalancerWeighted(amountIn: bigint, params: BalancerWeightedParams): bigint {
        // approx V2 math: B_out * (1 - (B_in / (B_in + A_in * (1 - fee))) ^ (W_in / W_out))
        // Here we just provide a basic placeholder for standard math
        const feeMultiplier = 10000n - params.swapFeeBps;
        return amountIn * feeMultiplier / 10000n; // mock simplification
    }
}
