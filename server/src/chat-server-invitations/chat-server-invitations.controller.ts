import { Controller, Get, HttpStatus, Param, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ChatServerInvitationsService } from './chat-server-invitations.service';
import { AuthenticatedGuard } from 'src/auth/utils/local-guard';

@Controller('invitations')
export class ChatServerInvitationsController { 
    constructor(
        private readonly invitationService: ChatServerInvitationsService
    ) {}

    @Post(':chatServerId')
    @UseGuards(AuthenticatedGuard)
    async createChatServerInvitation(
        @Param('chatServerId') chatServerId: number,
        @Res() response: Response
    ) {
        try {
            response
                .status(HttpStatus.CREATED)
                .json(await this.invitationService.generateInvitation(chatServerId))
        } catch (e) {
            response
                .status(e.status)
                .json({
                    statusCode: e.status,
                    message: e.message
                })
        }
    }

    @Get(':uuid')
    @UseGuards(AuthenticatedGuard)
    async getChatServerInvitation(
        @Param('uuid') uuid: string,
        @Res() response: Response
    ) {
        try {
            response
                .status(HttpStatus.OK)
                .json(await this.invitationService.findInvitationByUuid(uuid))
        } catch (e) {
            response
                .status(e.status)
                .json({
                    statusCode: e.status,
                    message: e.message
                })
        }
    }

    @Get('/bychatserver/:chatServerId')
    @UseGuards(AuthenticatedGuard)
    async getInvitationByChatServer(
        @Param('chatServerId') chatServerId: number,
        @Res() response: Response
    ) {
        try {
            response
                .status(HttpStatus.OK)
                .json(await this.invitationService.findInvitationByChatServer(chatServerId))
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
