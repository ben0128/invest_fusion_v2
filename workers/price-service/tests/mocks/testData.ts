export const mockPriceData = {
	singleSymbol: {
		raw: {
			price: '150.25',
		},
		processed: {
			symbol: 'AAPL',
			price: 150.25,
			timestamp: 1234567890,
		},
	},
	batchSymbols: {
		raw: {
			AAPL: { price: '150.25' },
			GOOGL: { price: '2750.50' },
			MSFT: { price: '310.75' },
		},
	},
};

export const mockErrorResponses = {
	rateLimitExceeded: { code: 429, message: 'Rate limit exceeded' },
	symbolNotFound: { code: 404, message: 'Symbol not found' },
	serverError: { code: 500, message: 'Internal server error' },
};
