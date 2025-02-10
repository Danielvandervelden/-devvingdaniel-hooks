import { useFetchData } from "../hooks/useFetchData/useFetchData";

interface FetchCatFactResponse {
    fact: string;
}

const fetchCatFact = (url?: string): Promise<FetchCatFactResponse> => {
    if (!url) {
        return new Promise((resolve) => resolve({ fact: "No fact" }));
    }
    return fetch(url).then((response) => response.json());
};

export default function App() {
    const { data, isFetching } = useFetchData(fetchCatFact, {
        options: { key: "catFactt", enabled: true, ttl: 300 },
        parameters: ["https://cat-fact.herokuapp.com/fact"],
    });

    return (
        <div>
            <div>Data 1: {data && !isFetching && data.fact}</div>
        </div>
    );
}
