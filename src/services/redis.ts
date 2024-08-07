import Redis from "ioredis";

class CacheModule {
	private redisClient: Redis;

	constructor() {
		this.redisClient = new Redis({
			host: "127.0.0.1",
			port: 6379,
		});
	}

	async set(key: string, value: string, ttl?: number) {
		if (ttl) {
			await this.redisClient.setex(key, ttl, value);
		} else {
			await this.redisClient.set(key, value);
		}
	}

	async get(key: string): Promise<string | null> {
		return this.redisClient.get(key);
	}

	async del(key: string): Promise<void> {
		await this.redisClient.del(key);
	}

	async keys(pattern: string): Promise<string[]> {
		return this.redisClient.keys(pattern);
	}
}

export default CacheModule;
