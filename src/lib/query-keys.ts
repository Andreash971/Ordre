export const queryKeys = {
  customers: {
    all: ['customers'] as const,
    search: (q: string) => ['customers', 'search', q] as const,
    searchByPhone: (q: string) => ['customers', 'searchPhone', q] as const,
    searchByBusiness: (q: string) =>
      ['customers', 'searchBusiness', q] as const,
  },
  products: {
    all: ['products'] as const,
    search: (q: string) => ['products', 'search', q] as const,
  },
  bring: {
    postcode: (code: string) => ['bring', 'postcode', code] as const,
  },
}
