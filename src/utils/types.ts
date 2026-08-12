export interface ParsedMetric {
  readonly label: string
  readonly value: string
}

export interface ParsedTable {
  readonly title: string
  readonly headers: readonly string[]
  readonly rows: readonly ParsedTableRow[]
}

export interface ParsedTableRow {
  readonly label: string
  readonly values: readonly string[]
}

export interface ParsedSection {
  readonly title: string
  readonly metrics: readonly ParsedMetric[]
  readonly tables: readonly ParsedTable[]
}

export interface ParseResult {
  readonly sections: readonly ParsedSection[]
  readonly rawLines: number
  readonly recognizedLines: number
  readonly warnings: readonly string[]
  readonly stockData: StockData
}

export type NumberMap = Record<string, number | null>

export interface StockData {
  readonly metadata: {
    readonly currency: string
    readonly amount_unit: string
    readonly percentage_unit: string
    readonly null_represents: string
  }
  readonly stock_identity: {
    readonly ticker: string | null
    readonly company_name: string | null
    readonly sector: string | null
    readonly sharia_status: string | null
    readonly listing_board: string | null
    readonly exchange: string | null
    readonly trading_status: string | null
    readonly trading_limit_status: string | null
    readonly followers: number | null
  }
  readonly market_quote: {
    readonly currency: string
    readonly snapshots: readonly MarketQuoteSnapshot[]
  }
  readonly platform_data: {
    readonly selected_tab: string | null
    readonly available_tabs: readonly string[]
    readonly eps_estimate: Record<string, string | number | null>
    readonly data_scopes: readonly string[]
  }
  readonly current_valuation: {
    readonly current_pe_ratio_annualised: number | null
    readonly current_pe_ratio_ttm: number | null
    readonly forward_pe_ratio: number | null
    readonly ihsg_pe_ratio_ttm_median: number | null
    readonly earnings_yield_ttm_percent: number | null
    readonly current_price_to_sales_ttm: number | null
    readonly current_price_to_book_value: number | null
    readonly current_price_to_cashflow_ttm: number | null
    readonly current_price_to_free_cashflow_ttm: number | null
    readonly ev_to_ebit_ttm: number | null
    readonly ev_to_ebitda_ttm: number | null
    readonly peg_ratio: number | null
    readonly peg_ratio_3yr: number | null
    readonly peg_forward: number | null
  }
  readonly per_share: {
    readonly current_eps_ttm: number | null
    readonly current_eps_annualised: number | null
    readonly revenue_per_share_ttm: number | null
    readonly cash_per_share_quarter: number | null
    readonly current_book_value_per_share: number | null
    readonly free_cashflow_per_share_ttm: number | null
  }
  readonly solvency: {
    readonly current_ratio_quarter: number | null
    readonly quick_ratio_quarter: number | null
    readonly debt_to_equity_ratio_quarter: number | null
    readonly long_term_debt_to_equity_quarter: number | null
    readonly total_liabilities_to_equity_quarter: number | null
    readonly total_debt_to_total_assets_quarter: number | null
    readonly financial_leverage_quarter: number | null
    readonly interest_coverage_ttm: number | null
    readonly free_cashflow_quarter_idr_billion: number | null
    readonly altman_z_score_modified: number | null
  }
  readonly management_effectiveness: {
    readonly return_on_assets_ttm_percent: number | null
    readonly return_on_equity_ttm_percent: number | null
    readonly return_on_capital_employed_ttm_percent: number | null
    readonly return_on_invested_capital_ttm_percent: number | null
    readonly days_sales_outstanding_quarter: number | null
    readonly days_inventory_quarter: number | null
    readonly days_payables_outstanding_quarter: number | null
    readonly cash_conversion_cycle_quarter: number | null
    readonly receivables_turnover_quarter: number | null
    readonly asset_turnover_ttm: number | null
    readonly inventory_turnover_ttm: number | null
  }
  readonly historical_net_income: {
    readonly unit: string
    readonly years: readonly number[]
    readonly quarterly: {
      readonly q1: NumberMap
      readonly q2: NumberMap
      readonly q3: NumberMap
      readonly q4: NumberMap
    }
    readonly annualised: NumberMap
    readonly ttm_q1: NumberMap
    readonly dividend_ttm: NumberMap
    readonly payout_ratio: NumberMap
    readonly dividend_yield: NumberMap
  }
  readonly market_data: {
    readonly market_cap_idr_billion: number | null
    readonly enterprise_value_idr_billion: number | null
    readonly current_share_outstanding_billion: number | null
    readonly free_float_percent: number | null
  }
  readonly profitability: {
    readonly gross_profit_margin_quarter_percent: number | null
    readonly operating_profit_margin_quarter_percent: number | null
    readonly net_profit_margin_quarter_percent: number | null
  }
  readonly growth: {
    readonly revenue_quarter_yoy_growth_percent: number | null
    readonly gross_profit_quarter_yoy_growth_percent: number | null
    readonly net_income_quarter_yoy_growth_percent: number | null
  }
  readonly dividend: {
    readonly dividend: number | null
    readonly dividend_ttm: number | null
    readonly payout_ratio: number | null
    readonly dividend_yield: number | null
    readonly latest_dividend_ex_date: string | null
    readonly dividend_history: readonly DividendHistoryRecord[]
  }
  readonly market_rank: {
    readonly piotroski_f_score: number | null
    readonly eps_rating: number | null
    readonly relative_strength_rating_percent: number | null
    readonly rank_market_cap_percent: number | null
    readonly rank_current_pe_ratio_ttm_percent: number | null
    readonly rank_earnings_yield_percent: number | null
    readonly rank_price_to_sales_percent: number | null
    readonly rank_price_to_book_percent: number | null
    readonly rank_near_52_weeks_high_percent: number | null
  }
  readonly income_statement: {
    readonly revenue_ttm_idr_billion: number | null
    readonly gross_profit_ttm_idr_billion: number | null
    readonly ebitda_ttm_idr_billion: number | null
    readonly net_income_ttm_idr_billion: number | null
  }
  readonly balance_sheet: {
    readonly cash_quarter_idr_billion: number | null
    readonly total_assets_quarter_idr_billion: number | null
    readonly total_liabilities_quarter_idr_billion: number | null
    readonly working_capital_quarter_idr_billion: number | null
    readonly common_equity_idr_billion: number | null
    readonly long_term_debt_quarter_idr_billion: number | null
    readonly short_term_debt_quarter_idr_billion: number | null
    readonly total_debt_quarter_idr_billion: number | null
    readonly net_debt_quarter_idr_billion: number | null
    readonly total_equity_idr_billion: number | null
  }
  readonly cash_flow_statement: {
    readonly cash_from_operations_ttm_idr_billion: number | null
    readonly cash_from_investing_ttm_idr_billion: number | null
    readonly cash_from_financing_ttm_idr_billion: number | null
    readonly capital_expenditure_ttm_idr_billion: number | null
    readonly free_cashflow_ttm_idr_billion: number | null
  }
  readonly price_performance: {
    readonly currency: string
    readonly periods: Record<string, PricePerformancePeriod>
  }
  readonly corporate_actions: {
    readonly scope: string | null
    readonly source: string | null
    readonly records: readonly CorporateActionRecord[]
  }
  readonly company_profile: {
    readonly background: string | null
    readonly business_activities: readonly string[]
    readonly sector: string | null
    readonly sub_sector: string | null
    readonly sharia_status: string | null
    readonly listing_board: string | null
    readonly indices: readonly string[]
    readonly updated_at: string | null
  }
  readonly ownership: {
    readonly updated_at: string | null
    readonly shareholders: readonly ShareholderRecord[]
    readonly shareholder_composition: {
      readonly period: string | null
      readonly total_shares: number | null
      readonly share_unit: string
      readonly holders: readonly ShareholderCompositionRecord[]
    }
    readonly holding_composition: {
      readonly period: string | null
      readonly local_percent: number | null
      readonly foreign_percent: number | null
      readonly data_points: readonly string[]
    }
    readonly ultimate_beneficial_owner: string | null
  }
  readonly company_history: {
    readonly listing_date: string | null
    readonly ipo_price: number | null
    readonly ipo_amount_idr_billion: number | null
    readonly ipo_shares: number | null
    readonly free_float_percent: number | null
    readonly underwriters: readonly string[]
    readonly administration_bureau: string | null
    readonly listing_board: string | null
  }
  readonly management: {
    readonly directors: readonly ManagementRecord[]
    readonly commissioners: readonly ManagementRecord[]
  }
  readonly contact: {
    readonly address: string | null
    readonly phone: string | null
    readonly fax: string | null
    readonly tax_id: string | null
    readonly email: string | null
    readonly website: string | null
  }
  readonly subsidiaries: {
    readonly updated_at: string | null
    readonly companies: readonly SubsidiaryRecord[]
  }
}

export interface MarketQuoteSnapshot {
  readonly price: number | null
  readonly price_change: number | null
  readonly price_change_percent: number | null
  readonly session: string | null
  readonly date: string | null
  readonly time: string | null
  readonly timezone: string | null
  readonly volume: number | null
  readonly volume_unit: string
  readonly average_volume: number | null
  readonly average_volume_unit: string
}

export interface PricePerformancePeriod {
  readonly return_percent: number | null
  readonly low: number | null
  readonly high: number | null
}

export interface DividendHistoryRecord {
  readonly period: string | null
  readonly dividend: number | null
  readonly ex_date: string | null
  readonly pay_date: string | null
}

export interface CorporateActionRecord {
  readonly date: string | null
  readonly name: string | null
  readonly change_percent: number | null
  readonly change_shares: number | null
  readonly previous_percentage: number | null
  readonly previous_shares: number | null
  readonly current_percentage: number | null
  readonly current_shares: number | null
  readonly price: number | null
  readonly broker: string | null
  readonly action_type: string | null
  readonly action_source: string | null
}

export interface ShareholderRecord {
  readonly name: string | null
  readonly type: string | null
  readonly location: string | null
  readonly domicile: string | null
  readonly scripless_shares: number | null
  readonly scrip_shares: number | null
  readonly total_shares: number | null
  readonly percentage: number | null
}

export interface ShareholderCompositionRecord {
  readonly category: string | null
  readonly shares: number | null
  readonly percentage: number | null
  readonly is_controller: boolean | null
}

export interface ManagementRecord {
  readonly name: string | null
  readonly title: string | null
}

export interface SubsidiaryRecord {
  readonly name: string | null
  readonly business_type: string | null
  readonly location: string | null
  readonly commercial_year: number | null
  readonly total_asset: number | null
  readonly asset_currency: string
  readonly ownership_percent: number | null
}
