export declare type Header = ReturnType<typeof readHeader>;
export declare function readHeader(rawData: Uint8Array): {
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
