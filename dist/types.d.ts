export declare type InputNumberSerie = {
    type: 'number';
    values: number[];
};
export declare type InputStringSerie = {
    type: 'string';
    values: string[];
};
export declare type AnyInputSerie = InputNumberSerie | InputStringSerie;
export declare type AnyDecompressedSerie = DecompressedNumberSerie | DecompressedStringSerie;
export declare type DecompressedNumberSerie = {
    type: 'number';
    values: number[];
    stats: {
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
};
export declare type DecompressedStringSerie = {
    type: 'string';
    values: string[];
    stats: {
        count: number;
        unique: number;
        maxDecimals: number;
        min: number;
        max: number;
    };
};
export declare type TransformType = 'delta' | 'dictionary' | 'rle';
