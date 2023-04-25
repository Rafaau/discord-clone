import { faker } from "@faker-js/faker";
import { CreateDirectConversationDto } from "src/direct-conversations/direct-conversations.dto";
import { DirectConversation } from "src/entities/direct-conversation";
import { generateUser } from "../users/fakes-factory";

export function generateDirectConversation(): DirectConversation {
    return {
        id: faker.datatype.number(),
        users: [
            generateUser(),
            generateUser()
        ],
        directMessages: []
    }
}

export function generateFewDirectConversations(): DirectConversation[] {
    return [
        generateDirectConversation(),
        generateDirectConversation()
    ]
}

export class FakeDirectConversationCreate {
    static directConversationToCreate: CreateDirectConversationDto = {
        users: [
            generateUser(),
            generateUser()
        ]
    }

    static createdDirectConversation: DirectConversation = {
        id: faker.datatype.number(),
        users: this.directConversationToCreate.users,
        directMessages: []
    }
}