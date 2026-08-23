import type { StockData } from '../../src/utils/types'

import { parseStockText } from '../../src/utils/parser'

export const SYNTHETIC_SNAPSHOT = [
  'Unsupported Heading',
  'Unknown value',
  'START TRADING',
  'ZZZZ',
  'Perusahaan Contoh Tbk.',
  'Technology',
  'Syariah',
  'Papan Utama',
  'TRADING',
  'NO LIMIT',
  'IDX',
  '42 followers',
  'Key Stats',
  '1,250 +25 (+2.04%) Today Fri 09:30 WIB 3M Volume 1.2M Avg volume',
  'Current Valuation',
  'Current PE Ratio (TTM)',
  '10.5x',
  'Current Price to Book Value',
  '1.2x',
  'Forward PE Ratio',
  '-',
  'Per Share',
  'Current EPS (TTM)',
  '25.5',
  'Solvency',
  'Current Ratio (Quarter)',
  '1.8x',
  'Debt to Equity Ratio (Quarter)',
  '0.4x',
  'Management Effectiveness',
  'Return on Assets (TTM)',
  '7%',
  'Profitability',
  'Return on Equity (TTM)',
  '18%',
  'Net Profit Margin (Quarter)',
  '12%',
  'Growth',
  'Revenue (Quarter YoY Growth)',
  '12%',
  'Net Income (Quarter YoY Growth)',
  '-',
  'Market Rank',
  'Piotroski F-Score',
  '7',
  'Income Statement',
  'Revenue (TTM)',
  '1.2B',
  'Net Income (TTM)',
  '0.3B',
  'Period (IDR)',
  '2022',
  '2023',
  'Q1',
  '(10)',
  '20',
  'Annualised',
  '40',
  '50',
  'Balance Sheet',
  'Total Assets (Quarter)',
  '3.4B',
  'Cash Flow Statement',
  'Cash From Operations (TTM)',
  '0.45B',
  'Free cash flow (TTM)',
  '0.2B',
  'Dividend',
  'Dividend Yield',
  '3.5%',
  'Dividend History',
  'Period',
  'Dividend',
  'Ex Date',
  'Pay Date',
  'Fiscal 2023',
  '0.5',
  '01 Jan 24',
  '15 Jan 24',
  'Price Performance',
  '1M',
  '6%',
  '1,000',
  '1,300',
  '1Y',
  '12%',
  '900',
  '1,400',
  'Unknown Format',
  'N/A',
].join('\n')

export const DENSE_SYNTHETIC_SNAPSHOT = [
  'Current Valuation',
  'Current PE Ratio (TTM)',
  '10.5x',
  'Per Share',
  'Current EPS (TTM)',
  '25.5',
].join('')

export type SyntheticStockDataOverrides = {
  readonly stock_identity?: Partial<StockData['stock_identity']>
  readonly market_quote?: Partial<StockData['market_quote']>
  readonly current_valuation?: Partial<StockData['current_valuation']>
  readonly solvency?: Partial<StockData['solvency']>
  readonly management_effectiveness?: Partial<StockData['management_effectiveness']>
  readonly growth?: Partial<StockData['growth']>
  readonly market_rank?: Partial<StockData['market_rank']>
  readonly income_statement?: Partial<StockData['income_statement']>
  readonly cash_flow_statement?: Partial<StockData['cash_flow_statement']>
  readonly dividend?: Partial<StockData['dividend']>
  readonly price_performance?: Partial<StockData['price_performance']>
}

export const mergeSyntheticStockData = (
  stockData: StockData,
  overrides: SyntheticStockDataOverrides
): StockData => ({
  ...stockData,
  stock_identity: { ...stockData.stock_identity, ...overrides.stock_identity },
  market_quote: { ...stockData.market_quote, ...overrides.market_quote },
  current_valuation: { ...stockData.current_valuation, ...overrides.current_valuation },
  solvency: { ...stockData.solvency, ...overrides.solvency },
  management_effectiveness: {
    ...stockData.management_effectiveness,
    ...overrides.management_effectiveness,
  },
  growth: { ...stockData.growth, ...overrides.growth },
  market_rank: { ...stockData.market_rank, ...overrides.market_rank },
  income_statement: { ...stockData.income_statement, ...overrides.income_statement },
  cash_flow_statement: {
    ...stockData.cash_flow_statement,
    ...overrides.cash_flow_statement,
  },
  dividend: { ...stockData.dividend, ...overrides.dividend },
  price_performance: { ...stockData.price_performance, ...overrides.price_performance },
})

export const makeSyntheticStockData = (overrides: SyntheticStockDataOverrides = {}): StockData =>
  mergeSyntheticStockData(parseStockText('').stockData, overrides)
