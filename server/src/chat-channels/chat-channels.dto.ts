import { IsNotEmpty } from "class-validator"

export class CreateChatChannelDto {
    @IsNotEmpty()
    name: string
}

export class CreateChatCategoryDto {
    @IsNotEmpty()
    name: string
}