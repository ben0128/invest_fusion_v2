export const formatPrice = (price: number, currency = 'USD'): string => {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
	}).format(price);
};

export const formatPercent = (value: number): string => {
	return new Intl.NumberFormat('en-US', {
		style: 'percent',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(value / 100);
};
