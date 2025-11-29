import { useState, useEffect } from 'react';

export function useDebounceSearch(searchFn: (query: string) => any[], delay: number = 300) {
  const [rawQuery, setRawQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(rawQuery);
    }, delay);

    return () => clearTimeout(timer);
  }, [rawQuery, delay]);

  useEffect(() => {
    setResults(searchFn(debouncedQuery));
  }, [debouncedQuery, searchFn]);

  return {
    query: rawQuery,
    setQuery: setRawQuery,
    results,
    debouncedQuery
  };
}
