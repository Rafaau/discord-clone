import { Body, Controller, Get, Inject, Post, Req, Res, Session, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express'
import { AuthService } from 'src/auth/services/auth/auth.service';
import { AuthenticatedGuard, LocalAuthGuard } from 'src/auth/utils/local-guard';

@Controller('auth')
export class AuthController {
    constructor(
        @Inject('AUTH_SERVICE') private readonly authService: AuthService
    ) {}

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(
        @Body() body: Record<string, any>,
        @Session() session: Record<string, any>
    ) { 
        return this.authService.signIn(
            body.username, 
            body.password, 
            body.rememberMe
        )
    }

    @Get('')
    async getAuthSession(
        @Session() session: Record<string, any>
    ) {
        session.authenticated = true
        return session
    }

    @UseGuards(AuthenticatedGuard)
    @Get('status')
    async getAuthStatus(
        @Req() req: Request,
    ) {
        return req.user
    }

    @Get('logout')
    async logout(@Req() req: Request) {
        req.session.destroy((err) => {
            if (err) {
                console.log(err)
            }
        })
        return {
            message: 'Logged out'
        }
    }
}
