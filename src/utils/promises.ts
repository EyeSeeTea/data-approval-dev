import _ from "lodash";

/* Map sequentially over T[] with an asynchronous function and return array of mapped values */
export function promiseMap<T, S>(inputValues: T[], mapper: (value: T) => Promise<S>): Promise<S[]> {
    const reducer = (acc$: Promise<S[]>, inputValue: T): Promise<S[]> =>
        acc$.then((acc: S[]) =>
            mapper(inputValue).then(result => {
                acc.push(result);
                return acc;
            })
        );
    return inputValues.reduce(reducer, Promise.resolve([]));
}

export async function getInChunks<T, U>(ids: T[], getter: (idsGroup: T[]) => Promise<U[]>): Promise<U[]> {
    const objsCollection = await promiseMap(_.chunk(ids, 500), idsGroup => getter(idsGroup));
    return _.flatten(objsCollection);
}

export async function promiseMapConcurrent<T, S>(
    inputValues: T[],
    mapper: (value: T) => Promise<S>,
    concurrency = 5
): Promise<S[]> {
    const chunks = _.chunk(inputValues, concurrency);

    const processChunk = (batch: T[]) => Promise.all(batch.map(value => mapper(value)));

    const results = await chunks.reduce<Promise<S[]>>(async (accPromise, batch) => {
        const acc = await accPromise;
        const batchResults = await processChunk(batch);
        return [...acc, ...batchResults];
    }, Promise.resolve([]));

    return results;
}

export const wait = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
