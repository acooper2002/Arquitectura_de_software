export interface IQueue<T> {
	add(data: T, topic?: string): Promise<void>;
	process(callback: (data: T) => Promise<void>): void;
}
