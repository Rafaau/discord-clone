import { faker } from "@faker-js/faker";
import { CreateChatServerDto, UpdateChatServerDto } from "src/chat-servers/chat-servers.dto";
import { ChatServer } from "src/entities/chat-server";
import { generateUser } from "../users/fakes-factory";

export function generateChatServer(): ChatServer {
    return {
        id: faker.datatype.number(),
        name: faker.company.name(),
        owner: generateUser(),
        members: [],
        roles: []
    }
}

export function generateFewChatServers(): ChatServer[] {
    return [
        generateChatServer(),
        generateChatServer(),
        generateChatServer()
    ]
}

export class FakeChatServerCreate {
    static chatServerToCreate: CreateChatServerDto = {
        name: faker.company.name()
    }

    static createdChatServer: ChatServer = {
        id: faker.datatype.number(),
        name: this.chatServerToCreate.name,
        owner: generateUser(),
        members: []
    }

    static invalidChatServerReq: CreateChatServerDto = {
        name: ''
    }

    static chatServerToUpdate: UpdateChatServerDto = {
        name: faker.company.name()
    }
}