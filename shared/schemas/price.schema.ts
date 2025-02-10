import { z } from 'zod';

// 單一股票代號的驗證 Schema
export const symbolSchema = z.object({
	symbol: z
		.string()
		.min(1, '股票代號不能為空')
		.max(15, '股票代號過長')
		.transform((val) => val.trim()),
});

// 批量股票代號的驗證 Schema
export const batchSymbolsSchema = z.object({
	symbols: z
		.array(z.string())
		.min(1, '股票代號列表不能為空')
		.max(50, '單次請求股票數量不能超過100')
		.transform((symbols) =>
			symbols.map((s) => s.trim()).filter((s) => s.length > 0 && s.length <= 20),
		),
});

// 定義輸入類型
export type SymbolInput = z.infer<typeof symbolSchema>;
export type BatchSymbolsInput = z.infer<typeof batchSymbolsSchema>;
