import { Body, Controller, Get, Post, Req, Res, Session, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express'
import { AuthenticatedGuard, LocalAuthGuard } from 'src/auth/utils/local-guard';

@Controller('auth')
export class AuthController {

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(
        @Body() body: Record<string, any>,
        @Session() session: Record<string, any>,
        @Res() res: Response
    ) { 
        session.cookie.maxAge = body.rememberMe ? 2592000000 : null
        session.authenticated = true
        session.cookie.secure = true
        session.cookie.sameSite = 'none'
        res.status(200)
           .cookie('SESSIONID', session.id, {
                maxAge: session.cookie.maxAge,
                httpOnly: true,
                secure: true,
                sameSite: 'none'
           })
           .json(session)
    }

    @Get('')
    async getAuthSession(
        @Session() session: Record<string, any>
    ) {
        session.authenticated = true
        return session
    }

    //@UseGuards(AuthenticatedGuard)
    @Get('status')
    async getAuthStatus(
        @Req() req: Request,
        @Session() session: Record<string, any>
    ) {
        return req.session
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
