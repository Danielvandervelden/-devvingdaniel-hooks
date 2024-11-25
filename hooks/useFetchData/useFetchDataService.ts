export const CACHE_KEY = "useFetchDataCache";

export interface UseFetchDataOptions {
    enabled?: boolean;
    key?: string | null;
}

export type AsyncFunction<Response, Parameters extends unknown[]> = (
    ...parameters: Parameters
) => Promise<Response>;

export type UseFetchDataProps<Parameters extends unknown[]> = Parameters extends []
    ? { options?: UseFetchDataOptions }
    : { parameters: Parameters; options?: UseFetchDataOptions };

export const setCachedData = <Response>(
    key: string,
    result?: Response,
    ttl: number = 30
) => {
    const metadata = {
        timestamp: Date.now(),
        ttl,
        data: result,
    };
    localStorage.setItem(key, JSON.stringify(metadata));
};

export const getCachedData = <Response>(key: string): Response | null => {
    const item = localStorage.getItem(key);

    console.log("ITEM IN LOCALSTORAGE: ", item);
    if (item) {
        const cachedData = JSON.parse(item);
        const now = Date.now();
        console.log("CHECKING DATES: ", now, cachedData.timestamp, cachedData.ttl);
        if ((now - cachedData.timestamp) / 1000 > cachedData.ttl) {
            localStorage.removeItem(key);
            console.log("REMOVING CACHED DATA: ", cachedData.data);
            return null;
        }
        console.log("RETURNING CACHED DATA: ", cachedData.data);
        return cachedData.data;
    }
    return null;
};
