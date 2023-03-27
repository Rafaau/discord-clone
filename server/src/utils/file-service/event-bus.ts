import { EventEmitter } from "stream";

class EventBus extends EventEmitter {}

const eventBus = new EventBus()
export default eventBus