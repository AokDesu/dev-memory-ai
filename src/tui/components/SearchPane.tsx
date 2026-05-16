import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { useSearch } from '../hooks/useSearch.js';

interface SearchPaneProps {
  projectId: string | null;
  isFocused: boolean;
  onReleaseFocus: () => void;
}

export function SearchPane({ projectId, isFocused, onReleaseFocus }: SearchPaneProps) {
  const { query, setQuery, results, loading, error } = useSearch(projectId);
  const [inputActive, setInputActive] = useState(false);
  const [selected, setSelected] = useState(0);

  useInput(
    (input, key) => {
      if (key.escape) {
        setInputActive(false);
        onReleaseFocus();
        return;
      }
      if (!inputActive && input) setInputActive(true);
      if (!inputActive && key.upArrow) setSelected((s) => Math.max(0, s - 1));
      if (!inputActive && key.downArrow) setSelected((s) => Math.min(results.length - 1, s + 1));
    },
    { isActive: isFocused }
  );

  const rows = process.stdout.rows ?? 24;
  const maxResults = Math.max(3, rows - 12);
  const visible = results.slice(0, maxResults);

  return (
    <Box flexDirection="column" flexGrow={1} padding={1} gap={1}>
      {/* Input */}
      <Box borderStyle="round" borderColor={inputActive ? 'cyan' : 'gray'} paddingX={1}>
        <Text color="cyan">/ </Text>
        <TextInput
          value={query}
          onChange={(v) => { setQuery(v); setSelected(0); }}
          onSubmit={() => setInputActive(false)}
          focus={isFocused && inputActive}
          placeholder="Search code semantically…"
        />
        {loading && <Text color="yellow"> ⟳</Text>}
      </Box>

      {!isFocused && (
        <Text dimColor>Press [→] to focus, then type to search</Text>
      )}

      {error && <Text color="red">{error}</Text>}

      {query.length >= 2 && results.length === 0 && !loading && (
        <Text dimColor>No results found.</Text>
      )}

      {/* Results */}
      {visible.map((r, i) => {
        const isSelected = i === selected;
        const pct = (r.score * 100).toFixed(0);
        return (
          <Box key={r.id} flexDirection="column">
            <Box gap={1}>
              <Text dimColor>{i + 1}.</Text>
              <Text color="magenta" bold={isSelected} inverse={isSelected}>{r.file}</Text>
              <Text dimColor>:{r.lineStart}–{r.lineEnd}</Text>
              <Text color="cyan" dimColor={!isSelected}>({pct}%)</Text>
              {r.name && <Text dimColor>[{r.name}]</Text>}
            </Box>
            {isSelected && r.content && (
              <Box marginLeft={3} borderStyle="single" borderColor="gray" paddingX={1}>
                <Text dimColor wrap="wrap">
                  {r.content.split('\n').slice(0, 5).join('\n')}
                </Text>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
