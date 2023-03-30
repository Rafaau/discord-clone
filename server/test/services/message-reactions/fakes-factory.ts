import { faker } from "@faker-js/faker";
import { CreateMessageReactionDto } from "src/message-reactions/message-reactions.dto";
import { MessageReaction } from "src/typeorm/message-reaction";
import { generateUser } from "test/controllers/users/fakes-factory";

export class FakeMessageReactionCreate {
    static createdMessageReaction: MessageReaction = {
        id: faker.datatype.number(),
        reaction: '👍',
        user: generateUser()
    }

    static messageReactionToCreate: CreateMessageReactionDto = {
        reaction: '👍'    
    }
}