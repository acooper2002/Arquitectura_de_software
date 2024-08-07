import { EventEmitter } from "events";
import type { IQueue } from "../queues-providers/IQueue";

type FilterFunction<T> = (input: T) => Promise<T>;

export class Pipeline<T> extends EventEmitter {
	private filters: FilterFunction<T>[];
	private filterQueues: { filter: FilterFunction<T>; queue: IQueue<T> }[];

	constructor(
		filters: FilterFunction<T>[],
		queueFactory: (name: string) => IQueue<T>,
	) {
		super();
		this.filters = filters;
		this.filterQueues = [];
		this.setupQueues(queueFactory);
	}

	// setupQueues configura una cola para cada filtro utilizando la función factory proporcionada.
	private setupQueues(queueFactory: (name: string) => IQueue<T>): void {
		this.filters.forEach((filter, index) => {
			const queueName = `filter-queue-${index}`;
			const filterQueue = queueFactory(queueName);
			this.filterQueues.push({ filter, queue: filterQueue });
			filterQueue.process(async (data: T) => {
				try {
					const filteredData = await filter(data);
					this.enqueueNextFilter(index, filteredData);
				} catch (err) {
					this.emit("errorInFilter", { error: err, data: data });
				}
			});
		});
	}

	// enqueueNextFilter intenta añadir los datos filtrados a la cola del siguiente filtro.
	private enqueueNextFilter(currentFilterIndex: number, data: T): void {
		const nextFilter = this.filterQueues[currentFilterIndex + 1];
		if (nextFilter) {
			nextFilter.queue.add(data);
		} else {
			//console.log("Final output: ", data);
			this.emit("finalOutput", data);
		}
	}

	// processInput toma datos de entrada y los añade a la cola del primer filtro para comenzar el procesamiento.
	public async processInput(input: T): Promise<void> {
		if (this.filterQueues.length > 0) {
			await this.filterQueues[0].queue.add(input);
		}
	}
}
