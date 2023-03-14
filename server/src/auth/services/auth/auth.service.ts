import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { comparePassword } from 'src/utils/bcrypt';

@Injectable()
export class AuthService {
    constructor(@Inject('USER_SERVICE') private readonly userService: UsersService) {}

    async validateUser(email: string, password: string) {
        const userDB = this.userService.findUserByEmail(email)
        console.log(userDB)
        if (userDB) {
            const matched = comparePassword(password, (await userDB).password)
            if (matched)
                return userDB
            else
                return null
        }
        else
            return null
    }
}
