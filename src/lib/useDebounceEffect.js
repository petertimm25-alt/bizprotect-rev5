import { useEffect, useRef } from 'react';
export function useDebounceEffect(fn, deps, delay = 400) {
    const t = useRef(null);
    useEffect(() => {
        if (t.current)
            window.clearTimeout(t.current);
        t.current = window.setTimeout(() => fn(), delay);
        return () => { if (t.current)
            window.clearTimeout(t.current); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}
