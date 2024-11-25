import { useEffect, useState } from "react";
import { getCachedData, setCachedData, UseFetchDataProps } from "./useFetchDataService";

const ongoingRequests = new Map<string, Promise<unknown>>();

export interface UseFetchDataReturn<Response> {
    data: Response | null;
    isFetching: boolean;
    isError: boolean;
    error: Error | null;
    hasFetchedSinceMount: boolean;
    refetch: () => Promise<Response>;
    resetErrors: () => void;
    resetData: () => void;
}

// Implementation
export function useFetchData<Response, Parameters extends unknown[]>(
    asyncFunction: (...parameters: Parameters) => Promise<Response>,
    props: UseFetchDataProps<Parameters>
): UseFetchDataReturn<Response> {
    const { options } = props;
    const parameters =
        "parameters" in props ? props.parameters : ([] as unknown as Parameters);
    const [data, setData] = useState<Response | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const [isError, setIsError] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [hasFetchedSinceMount, setHasFetchedSinceMount] = useState(false);

    const executeFetchFunction = async (): Promise<Response> => {
        setIsFetching(true);
        setHasFetchedSinceMount(true);
        setIsError(false);
        setError(null);
        try {
            if (options?.key) {
                const cachedData = getCachedData<Response>(options.key);
                if (cachedData) {
                    setData(cachedData);
                    setIsFetching(false);
                    return cachedData;
                }
            }

            if (options?.key && ongoingRequests.has(options.key)) {
                const existingPromise = ongoingRequests.get(
                    options.key
                ) as Promise<Response>;
                const result = await existingPromise;
                setData(result);
                setIsFetching(false);
                return result;
            }

            const params = parameters || ([] as unknown as Parameters);

            const fetchPromise: Promise<Response> = asyncFunction(
                ...(params as Parameters)
            )
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

            setIsFetching(true);
            const result = await fetchPromise;
            setData(result);
            setIsFetching(false);

            return result;
        } catch (error) {
            const typedError = error as Error;
            setError(typedError);
            setIsError(true);
            setIsFetching(false);
            throw typedError;
        }
    };

    const resetErrors = () => {
        setIsError(false);
        setError(null);
    };

    const resetData = () => {
        setData(null);
    };

    useEffect(() => {
        if (options?.enabled !== false) {
            executeFetchFunction();
        }
    }, [options?.enabled, asyncFunction]);

    return {
        data,
        isFetching,
        error,
        isError,
        hasFetchedSinceMount,
        refetch: executeFetchFunction,
        resetErrors,
        resetData,
    };
}
