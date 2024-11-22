import { useFetchData } from "../hooks/useFetchData/useFetchData";

interface FetchCatFactResponse {
    fact: string;
}

const fetchCatFact = (): Promise<FetchCatFactResponse> => {
    return fetch("http://localhost:1234/random-fact").then((response) => response.json());
};

export default function App() {
    const { data, isLoading } = useFetchData(fetchCatFact, {
        options: { key: "catFact", enabled: false },
        parameters: [],
    });

    return (
        <div>
            <div>Data 1: {data && !isLoading && data.fact}</div>
        </div>
    );
}
