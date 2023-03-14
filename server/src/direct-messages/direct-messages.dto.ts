import { IsNotEmpty } from "class-validator"

export class CreateDirectMessageDto {
    @IsNotEmpty()
    content: string
}

export class UpdateDirectMessageDto {
    @IsNotEmpty()
    content: string
}