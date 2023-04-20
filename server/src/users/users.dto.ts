import { IsEmail, IsNotEmpty } from "class-validator"
import { IsStrongPassword } from "class-validator/types/decorator/decorators"

export class CreateUserDto {
    @IsNotEmpty()
    username: string

    @IsNotEmpty()
    @IsEmail()
    email: string
    
    //@IsStrongPassword()
    password: string   
}

export class UpdateUserDto {
    username: string
    email: string
    password: string
    phonenumber: string
    aboutMe: string
    appSettings: UpdateAppSettingsDto
}

export class UpdateAppSettingsDto {
    id: number
    inputSensitivity: number
    messageBadge: boolean
}