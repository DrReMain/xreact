export const NoWork = 0;
export const Never = 1;

// 0b { 0011 1111  1111 1111  1111 1111  1111 1111 }
const MAX_SIGNED_31_BIT_INT = 1073741823;

export const Sync = MAX_SIGNED_31_BIT_INT;

const UNIT_SIZE = 10;

const MAGIC_NUMBER_OFFSET = MAX_SIGNED_31_BIT_INT - 1;

export function msToExpirationTime(ms) {
    return MAGIC_NUMBER_OFFSET - ((ms / UNIT_SIZE) | 0);
}

function ceiling(num, precision) {
    return (((num / precision) | 0) + 1) * precision;
}

function computeExpirationBucket(
    currentTime,
    expirationInMs,
    bucketSizeMs,
) {
    return (
        MAGIC_NUMBER_OFFSET - ceiling(
            MAGIC_NUMBER_OFFSET - currentTime + expirationInMs / UNIT_SIZE,
            bucketSizeMs / UNIT_SIZE)
    )
}

export const HIGH_PRIORITY_EXPIRATION = window.__DEV__ ? 500 : 150;
export const HIGH_PRIORITY_BATCH_SIZE = 100;

export function computeInteractiveExpiration(currentTime) {
    return computeExpirationBucket(
        currentTime,
        HIGH_PRIORITY_EXPIRATION,
        HIGH_PRIORITY_BATCH_SIZE,
    )
}

export const LOW_PRIORITY_EXPIRATION = 5000;
export const LOW_PRIORITY_BATCH_SIZE = 250;

export function computeAsyncExpiration(currentTime) {
    return computeExpirationBucket(
        currentTime,
        LOW_PRIORITY_EXPIRATION,
        LOW_PRIORITY_BATCH_SIZE,
    );
}
