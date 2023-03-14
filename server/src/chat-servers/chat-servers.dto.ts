import { IsNotEmpty } from "class-validator";

export class CreateChatServerDto {
    @IsNotEmpty()
    name: string
}