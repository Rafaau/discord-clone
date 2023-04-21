import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { comparePassword } from 'src/utils/bcrypt';

@Injectable()
export class AuthService {
    constructor(
        @Inject('USER_SERVICE') private readonly userService: UsersService,
        private readonly jwtService: JwtService
    ) {}

    async validateUser(email: string, password: string) {
        const userDB = this.userService.findUserByEmail(email)
        if (userDB) {
            const matched = comparePassword(password, (await userDB).password)
            if (matched) {
                return userDB
            }
            else
                return null
        }
        else
            return null
    }

    async signIn(email: string, password: string, rememberMe: boolean) {
        const user = await this.userService.findUserByEmail(email)
        if (user) {
            const matched = comparePassword(password, user.password)
            if (matched) {
                const payload = {
                    id: user.id, 
                    email: user.email, 
                    username: user.username,
                    roles: user.roles,
                }
                return {
                    access_token: await this.jwtService.signAsync(payload, {
                        expiresIn: rememberMe ? '30d' : '1d'
                    })
                }
            }
            else
                throw new UnauthorizedException()
        }
    }
}
