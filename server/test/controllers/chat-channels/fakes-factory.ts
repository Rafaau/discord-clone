import { faker } from "@faker-js/faker";
import { CreateChatCategoryDto, CreateChatChannelDto } from "src/chat-channels/chat-channels.dto";
import { ChatCategory } from "src/typeorm/chat-category";
import { ChatChannel } from "src/typeorm/chat-channel";
import { generateChatServer } from "../chat-servers/fakes-factory";

export function generateChatChannel(): ChatChannel {
    return {
        id: faker.datatype.number(),
        name: faker.commerce.department(),
        chatCategory: {
            id: faker.datatype.number(),
            name: faker.commerce.department(),
            chatServer: generateChatServer(),
            chatChannels: []
        },
        chatMessages: []
    }
}

export function generateFewChatChannels(): ChatChannel[] {
    return [
        generateChatChannel(),
        generateChatChannel(),
        generateChatChannel()
    ]
}

export class FakeChatChannelCreate {
    static chatChannelToCreate: CreateChatChannelDto = {
        name: faker.commerce.department()
    }

    static createdChatChannel: ChatChannel = {
        id: faker.datatype.number(),
        name: this.chatChannelToCreate.name,
        chatCategory: {
            id: faker.datatype.number(),
            name: faker.commerce.department(),
            chatServer: generateChatServer(),
            chatChannels: []
        },
        chatMessages: []
    }

    static invalidChatChannelReq: CreateChatChannelDto = {
        name: ''
    }
}

export function generateChatCategory(): ChatCategory {
    return {
        id: faker.datatype.number(),
        name: faker.commerce.department(),
        chatServer: generateChatServer(),
        chatChannels: []
    }
}

export function generateFewChatCategories(): ChatCategory[] {
    return [
        generateChatCategory(),
        generateChatCategory(),
        generateChatCategory()
    ]
}

export class FakeChatCategoryCreate {
    static chatCategoryToCreate: CreateChatCategoryDto = {
        name: faker.commerce.department()
    }

    static createdChatCategory: ChatCategory = {
        id: faker.datatype.number(),
        name: this.chatCategoryToCreate.name,
        chatServer: generateChatServer(),
        chatChannels: []
    }

    static invalidChatCategoryReq: CreateChatCategoryDto = {
        name : ''
    }
}
