export const IS_REPEATED_RANGE = /*   */ 0b000_000_01
export const IS_FLOAT = /*            */ 0b000_000_10

export const ITEM_RANGE_MASK = /*     */ 0b000_111_00
export const IS_ZERO_ITEM_RANGE = /*  */ 0b000_000_00
export const IS_ONE_ITEM_RANGE = /*   */ 0b000_001_00
export const IS_TWO_ITEM_RANGE = /*   */ 0b000_010_00
export const IS_8_BIT_ITEM_RANGE = /* */ 0b000_011_00
export const IS_16_BIT_ITEM_RANGE = /**/ 0b000_110_00
export const IS_32_BIT_ITEM_RANGE = /**/ 0b000_101_00

export const IS_8_BIT_VALUES = /*     */ 0b000_000_00
export const IS_16_BIT_VALUES = /*    */ 0b001_000_00
export const IS_32_BIT_VALUES = /*    */ 0b011_000_00
export const IS_32_BIT_FLOAT = /*     */ 0b101_000_10
export const IS_64_BIT_FLOAT = /*     */ 0b111_000_10

//
//

export const TRANSFORM_DELTA = /*      */ 0b00_00_01_00
export const TRANSFORM_DELTA_DELTA = /**/ 0b00_00_10_00
export const TRANSFORM_RLE = /*        */ 0b00_00_00_01
export const TRANSFORM_STRING = /*     */ 0b10_00_00_00
