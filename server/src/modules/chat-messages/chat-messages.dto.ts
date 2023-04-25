import { IsNotEmpty } from "class-validator"

export class CreateChatMessageDto {
    @IsNotEmpty()
    content: string
}

export class UpdateChatMessageDto {
    @IsNotEmpty()
    content: string
}