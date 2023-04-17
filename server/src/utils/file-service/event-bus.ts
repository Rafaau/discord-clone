import { EventEmitter } from "stream";

class EventBus extends EventEmitter {}

const eventBus = new EventBus()
eventBus.setMaxListeners(30)
export default eventBus