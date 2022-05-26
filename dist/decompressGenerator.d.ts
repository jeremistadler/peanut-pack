export declare function decompressSerieGenerator(serie: Uint8Array): {
    stats: {
        valueOffset: number;
        headerSize: number;
        flags: number;
        count: number;
        unique: number;
        maxDecimals: number;
        min: number;
        max: number;
        p02: number;
        p05: number;
        p50: number;
        p95: number;
        p98: number;
    };
    values: Generator<string, void, void> | Generator<number, void, void>;
};
