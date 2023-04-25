import { faker } from "@faker-js/faker";
import { CreateChatMessageDto, UpdateChatMessageDto } from "src/chat-messages/chat-messages.dto";
import { ChatMessage } from "src/entities/chat-message";
import { generateChatChannel } from "../chat-channels/fakes-factory";
import { generateUser } from "../users/fakes-factory";

export function generateChatMessage(): ChatMessage {
    return {
        id: faker.datatype.number(),
        content: faker.lorem.sentence(),
        chatChannel: generateChatChannel(),
        user: generateUser(),
        postDate: faker.date.past()
    }
}

export function generateFewChatMessages(): ChatMessage[] {
    return [
        generateChatMessage(),
        generateChatMessage(),
        generateChatMessage()
    ]
}

export class FakeChatMessageCreate {
    static chatMessageToCreate: CreateChatMessageDto = {
        content: faker.lorem.sentence()
    }

    static chatMessageToUpdate: UpdateChatMessageDto = {
        content: faker.lorem.sentence()
    }

    static createdChatMessage: ChatMessage = {
        id: faker.datatype.number(),
        content: this.chatMessageToCreate.content,
        chatChannel: generateChatChannel(),
        user: generateUser(),
        postDate: faker.date.past()      
    }

    static invalidChatMessageReq: CreateChatMessageDto = {
        content: ''
    }
}