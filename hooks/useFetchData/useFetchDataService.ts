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

    if (item) {
        const cachedData = JSON.parse(item);
        const now = Date.now();
        if ((now - cachedData.timestamp) / 1000 > cachedData.ttl) {
            localStorage.removeItem(key);
            return null;
        }

        return cachedData.data;
    }
    return null;
};
