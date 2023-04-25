import { Controller, Get, Param, Res, UseGuards } from "@nestjs/common/decorators";
import { HttpStatus } from "@nestjs/common/enums";
import { Response } from "express";
import { NotificationsService } from "./notifications.service";
import { AuthenticatedGuard } from "src/auth/utils/local-guard";

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    @Get(':userId')
    @UseGuards(AuthenticatedGuard)
    async getUnreadNotificationsForUser(
        @Param('userId') userId: number,
        @Res() response: Response
    ) {
        try {
            response
                .status(HttpStatus.OK)
                .json(await this.notificationsService.getUnreadNotificationsForUser(userId))
        } catch (e) {
            response
                .status(e.status)
                .json({
                    statusCode: e.status,
                    message: e.message
                })
        }
    }
}