const normalizeMarkdownLine = (line: string): string =>
  line
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1\n')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1\n')
    .replace(/^#{1,6}\s*/, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/TRADINGLIMIT/g, 'TRADING\nLIMIT')
    .replace(/IDX(?=[A-Z])/g, 'IDX\n')

export const normalizeStockbitLines = (rawText: string): string[] =>
  rawText
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .flatMap((line) => normalizeMarkdownLine(line).split('\n'))
    .map((line) => line.trim())
    .filter(Boolean)
