import { useFetchData } from "../hooks/useFetchData/useFetchData";

interface FetchCatFactResponse {
    fact: string;
}

const fetchCatFact = ({ url }: { url: string }): Promise<FetchCatFactResponse> => {
    return fetch(url).then((response) => response.json());
};

export default function App() {
    const { data, isLoading } = useFetchData(fetchCatFact, {
        options: { key: "catFact", enabled: true },
        parameters: [{ url: "http://localhost:1234/random-fact" }],
    });

    return (
        <div>
            <div>Data 1: {data && !isLoading && data.fact}</div>
        </div>
    );
}
