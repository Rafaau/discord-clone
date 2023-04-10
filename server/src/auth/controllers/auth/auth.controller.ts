import { Body, Controller, Get, Post, Req, Res, Session, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express'
import { AuthenticatedGuard, LocalAuthGuard } from 'src/auth/utils/local-guard';

@Controller('auth')
export class AuthController {

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(
        @Body() body: Record<string, any>,
        @Session() session: Record<string, any>
    ) { 
        session.cookie.maxAge = body.rememberMe ? 2592000000 : null
        return session
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
        @Session() session: Record<string, any>
    ) {
        return req.user;
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
