import { AppError } from '@shared/errors/AppError';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMessage {
	level: LogLevel;
	message: string;
	data?: unknown;
	timestamp: string;
	service?: string;
}

export class Logger {
	private readonly service: string;

	constructor(service: string) {
		this.service = service;
	}

	private log(level: LogLevel, message: string, data?: unknown) {
		const logMessage: LogMessage = {
			level,
			message,
			data,
			timestamp: new Date().toISOString(),
			service: this.service,
		};

		// 在開發環境中輸出到控制台
		// if (process.env.NODE_ENV === 'development') {
		// 	// eslint-disable-next-line no-console
		console[level](JSON.stringify(logMessage, null, 2));
		// }

		// 在生產環境中將日誌發送到 Cloudflare Logs
		// if (process.env.NODE_ENV === 'production') {
		// eslint-disable-next-line no-console
		// console[level](JSON.stringify(logMessage));
		// }
	}

	debug(message: string, data?: unknown) {
		this.log('debug', message, data);
	}

	info(message: string, data?: unknown) {
		this.log('info', message, data);
	}

	warn(message: string, data?: unknown) {
		this.log('warn', message, data);
	}

	error(message: string, error?: unknown) {
		const errorData =
			error instanceof AppError
				? {
						name: error.name,
						code: error.code,
						statusCode: error.statusCode,
						message: error.message,
					}
				: error;

		console.error(
			JSON.stringify({
				level: 'error',
				message,
				error: errorData,
				timestamp: new Date().toISOString(),
				service: this.service,
			}),
		);
	}
}

// 創建單例實例
export const createLogger = (service: string) => new Logger(service);
