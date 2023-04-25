import { faker } from "@faker-js/faker";
import { ChatServerInvitation } from "src/entities/chat-server-invitation";
import { generateChatServer } from "../chat-servers/fakes-factory";

export function generateChatServerInvitation(): ChatServerInvitation {
    return {
        id: faker.datatype.number(),
        url: faker.internet.url(),
        expirationTime: faker.date.future(),
        chatServer: generateChatServer()
    }
}