"use client";

import { useEffect, useMemo, useRef } from "react";

export function GameLog({ entries }: { entries: string[] }) {
  const listRef = useRef<HTMLOListElement>(null);
  const chronologicalEntries = useMemo(() => [...entries].reverse(), [entries]);

  useEffect(() => {
    listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [chronologicalEntries]);

  return <aside className="game-log"><h2>Journal</h2><ol ref={listRef}>{chronologicalEntries.map((entry, index) => <li key={`${chronologicalEntries.length - index}-${entry}`}>{entry}</li>)}</ol></aside>;
}
