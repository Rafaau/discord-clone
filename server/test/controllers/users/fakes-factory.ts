import { faker } from '@faker-js/faker'
import { ChatServer } from 'src/entities/chat-server';
import { User } from "src/entities/user";
import { CreateUserDto, UpdateUserDto } from 'src/users/users.dto';

export function generateUser(): User {
    return {
        id: faker.datatype.number(),
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        managedChatServers: [],
        friends: [],
    }
}

export function generateServerOwner(): User {
    const user: User = {
        id: faker.datatype.number(),
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password()
    }
    user.managedChatServers = [{
        id: 1,
        name: "Test",
        owner: generateUser(),
        members: [generateUser()],
    }]

    return user
}

export function generateFewUsers(): User[] {
    return [
        generateUser(),
        generateUser(),
        generateServerOwner()
    ]
}

export class FakeUserCreate {
    static userToCreate: CreateUserDto = {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password()     
    }

    static createdUser: User = {
        id: faker.datatype.number(),
        username: this.userToCreate.username,
        email: this.userToCreate.email,
        password: this.userToCreate.password
    }

    static invalidUserReq: CreateUserDto = {
        username: faker.internet.userName(),
        email: 'invalidEmail',
        password: faker.internet.password()          
    }

    static userToUpdate: UpdateUserDto = {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        phonenumber: faker.phone.number()             
    }
}
