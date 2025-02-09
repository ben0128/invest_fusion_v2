type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMessage {
	level: LogLevel;
	message: string;
	data?: any;
	timestamp: string;
	service?: string;
}

export class Logger {
	private readonly service: string;

	constructor(service: string) {
		this.service = service;
	}

	private log(level: LogLevel, message: string, data?: any) {
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

	debug(message: string, data?: any) {
		this.log('debug', message, data);
	}

	info(message: string, data?: any) {
		this.log('info', message, data);
	}

	warn(message: string, data?: any) {
		this.log('warn', message, data);
	}

	error(message: string, data?: any) {
		this.log('error', message, data);
	}
}

// 創建單例實例
export const createLogger = (service: string) => new Logger(service);