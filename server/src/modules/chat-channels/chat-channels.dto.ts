import { IsNotEmpty } from "class-validator"
import { User } from "src/entities/user"

export class CreateChatChannelDto {
    @IsNotEmpty()
    name: string
    isPrivate: boolean
    users?: User[]
}

export class CreateChatCategoryDto {
    @IsNotEmpty()
    name: string
}