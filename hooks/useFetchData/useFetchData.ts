import { useEffect, useState } from "react";
import {
    AsyncFunction,
    getCachedData,
    setCachedData,
    UseFetchDataProps,
} from "./useFetchDataService";

const ongoingRequests = new Map<string, Promise<unknown>>();

export const useFetchData = <Response, Parameters extends unknown[]>(
    asyncFunction: AsyncFunction<Response, Parameters>,
    { parameters, options }: UseFetchDataProps<Parameters>
) => {
    const [data, setData] = useState<Response | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [hasFetchedSinceMount, setHasFetchedSinceMount] = useState(false);

    const executeFetchFunction = async () => {
        setIsLoading(true);
        setHasFetchedSinceMount(true);
        setIsError(false);
        setError(null);
        try {
            if (options?.key) {
                const cachedData = getCachedData<Response>(options.key);
                if (cachedData) {
                    setData(cachedData);
                    setIsLoading(false);
                    return null;
                }
            }

            if (options?.key && ongoingRequests.has(options.key)) {
                const existingPromise = ongoingRequests.get(
                    options.key
                ) as Promise<Response>;
                const result = await existingPromise;
                setData(result);
                setIsLoading(false);
                return result;
            }

            const params = parameters || ([] as unknown as Parameters);

            const fetchPromise: Promise<Response> = asyncFunction(...params)
                .then(async (result) => {
                    if (options?.key) {
                        setCachedData(options.key, result);
                    }
                    return result;
                })
                .finally(() => {
                    if (options?.key) {
                        ongoingRequests.delete(options.key);
                    }
                });

            if (options?.key) {
                ongoingRequests.set(options.key, fetchPromise);
            }

            setIsLoading(true);
            const result = await fetchPromise;
            setData(result);
            setIsLoading(false);
        } catch (error) {
            const typedError = error as Error;
            setError(typedError);
            setIsError(true);
            setIsLoading(false);
        }
    };

    const resetErrors = () => {
        setIsError(false);
        setError(null);
    };

    useEffect(() => {
        if (options?.enabled !== false) {
            executeFetchFunction();
        }
    }, [options?.enabled, asyncFunction]);

    return {
        data,
        isLoading,
        error,
        isError,
        hasFetchedSinceMount,
        refetch: executeFetchFunction,
        resetErrors,
    };
};
