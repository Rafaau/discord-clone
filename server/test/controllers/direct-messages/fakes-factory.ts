import { faker } from "@faker-js/faker";
import { CreateDirectMessageDto, UpdateDirectMessageDto } from "src/direct-messages/direct-messages.dto";
import { DirectMessage } from "src/typeorm/direct-message";
import { generateDirectConversation } from "../direct-conversations/fakes-factory";
import { generateUser } from "../users/fakes-factory";

export function generateDirectMessage(): DirectMessage {
    return {
        id: faker.datatype.number(),
        content: faker.lorem.sentence(),
        user: generateUser(),
        directConversation: generateDirectConversation(),
        postDate: faker.date.past()
    }
}

export function generateFewDirectMessages(): DirectMessage[] {
    return [
        generateDirectMessage(),
        generateDirectMessage(),
        generateDirectMessage()
    ]
}

export class FakeDirectMessageCreate {
    static directMessageToCreate: CreateDirectMessageDto = {
        content: faker.lorem.sentence()
    }

    static directMessageToUpdate: UpdateDirectMessageDto = {
        content: faker.lorem.sentence()
    }

    static createdDirectMessage: DirectMessage = {
        id: faker.datatype.number(),
        content: this.directMessageToCreate.content,
        user: generateUser(),
        directConversation: generateDirectConversation(),
        postDate: faker.date.past()     
    }
    
    static invalidCreateReq: CreateDirectMessageDto = {
        content: ''
    }

    static invalidUpdateReq: UpdateDirectMessageDto = {
        content: ''
    }
}