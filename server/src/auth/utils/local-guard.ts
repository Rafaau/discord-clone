import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthGuard } from "@nestjs/passport";
import { Request } from 'express'
import { Session } from "express-session";

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
    async canActivate(context: ExecutionContext) {
        const result = (await super.canActivate(context) as boolean)
        const request = context.switchToHttp().getRequest()
        await super.logIn(request)
        return result
    }
}

@Injectable()
export class AuthenticatedGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<any> {
        const req = context.switchToHttp().getRequest<Request>()
        const session = context.switchToHttp().getRequest<Session>()
        console.log(session.cookie)
        console.log(req.user)
        console.log(req.session)
        return req.isAuthenticated()
    }
}

@Injectable()
export class AuthGuardz implements CanActivate {
    constructor (private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest()
        const token = this.extractTokenFromHeader(req)
        if (!token)
            return false
        try {
            const payload = await this.jwtService.verifyAsync(
                token,
                { secret: 'secret' }
            )
            req.user = payload
        } catch {
            return false
        }
        return true
    }

    private extractTokenFromHeader(req: Request): string | undefined {
        const [type, token] = req.headers.authorization?.split(' ') ?? []
        return type === 'Bearer' ? token : undefined
    }
}