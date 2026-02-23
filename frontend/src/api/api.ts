import {useState, useCallback} from 'react';


type FetchState<T> = {
    data: T | null;
    loading: boolean;
    error: string | null;
}

export function useFetch<T, B = unknown>(url: string, options: RequestInit){
    const [state, setState] = useState<FetchState<T>>({
        data: null,
        loading: false,
        error: null,
    })

    const execute = useCallback(async (body?: B) => {
        setState({ data: null, loading: true, error: null})

        try {
            const res = await fetch(url, {
                ...options,
                body: body ? JSON.stringify(body): undefined,
            })

            if(!res.ok) throw new Error(`Request failed: ${res.status}`)

            const data: T = await res.json()
            setState({data, loading: false, error: null})
            return data
        } catch(err) {
            const error = err instanceof Error ? err.message : 'Unknown error';
            setState({ data: null, loading: false, error})
        }
    }, [url, options])

    return { ...state, execute}
}

