import { Body, Controller, Get, Post, Req, Session, UseGuards } from '@nestjs/common';
import { Request } from 'express'
import { AuthenticatedGuard, LocalAuthGuard } from 'src/auth/utils/local-guard';

@Controller('auth')
export class AuthController {

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(
        @Session() session: Record<string, any>
    ) { 
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
    async getAuthStatus(@Req() req: Request) {
        return req.user;
    }
}
