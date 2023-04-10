import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
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
        console.log((session as any).body)
        console.log(req.user)
        console.log(req.session)
        return req.isAuthenticated()
    }
}