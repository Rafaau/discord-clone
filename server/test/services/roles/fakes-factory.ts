import { faker } from "@faker-js/faker"
import { Permission } from "src/entities/enums/Permission"
import { Role } from "src/entities/role"
import { UpdateRoleParams } from "src/utils/types"

export class FakeRoleCreate {
    static createdRole: Role = {
        id: faker.datatype.number(),
        name: faker.name.jobArea(),
        description: faker.lorem.sentence(),
        permissions: [       
            { administrator: true, 'view-channels': true, 'send-messages': true }
        ],
        users: []
    }

    static updateRoleParams: UpdateRoleParams = {
        name: faker.name.jobArea(),
        permissions: [       
            { administrator: true, 'view-channels': true, 'send-messages': true }
        ],
    }
}