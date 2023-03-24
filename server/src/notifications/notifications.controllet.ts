import { Controller, Get, Param, Res } from "@nestjs/common/decorators";
import { HttpStatus } from "@nestjs/common/enums";
import { Response } from "express";
import { NotificationsService } from "./notifications.service";

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    @Get(':userId')
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