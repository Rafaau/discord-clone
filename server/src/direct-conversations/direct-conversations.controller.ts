import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { CreateDirectConversationDto } from "./direct-conversations.dto";
import { DirectConversationsService } from "./direct-conversations.service";
import { AuthenticatedGuard } from "src/auth/utils/local-guard";

@Controller('directconversations')
export class DirectConversationsController {
    constructor(private readonly directConversationsService: DirectConversationsService) {}

    @Post()
    @UseGuards(AuthenticatedGuard)
    async createDirectConversation(
        @Body() createDirectConversationDto: CreateDirectConversationDto,
        @Res() response: Response
    ) {
        try {
            const conversation = await this.directConversationsService
                .createDirectConversation(createDirectConversationDto)
            conversation.users[0].id != createDirectConversationDto.users[1].id ? 
                conversation.users = [conversation.users[1], conversation.users[0]]
            : null
            response
                .status(HttpStatus.CREATED)
                .json(conversation)
        } catch (e) {
            response
                .status(e.status)
                .json({
                    statusCode: e.status,
                    message: e.message
                })
        }
    }

    @Get('user/:userId')
    @UseGuards(AuthenticatedGuard)
    async getConversationsOfUser(
        @Param('userId') userId: number,
        @Res() response: Response
    ) {
        try {
            const conversations = await this.directConversationsService.findConversationsOfUser(userId)
            conversations.forEach((conversation) => {
                conversation.users[0].id != userId ? 
                    conversation.users = [conversation.users[1], conversation.users[0]]
                : null
            })
            response
                .status(HttpStatus.OK)
                .json(conversations)
        } catch (e) {
            response
                .status(e.status)
                .json({
                    statusCode: e.status,
                    message: e.message
                })
        }
    }

    @Get(':id')
    @UseGuards(AuthenticatedGuard)
    async getConversation(
        @Param('id') id: number,
        @Res() response: Response
    ) {
        try {
            response
                .status(HttpStatus.OK)
                .json(await this.directConversationsService.findConversationById(id))
        } catch (e) {
            response
                .status(e.status)
                .json({
                    statusCode: e.status,
                    message: e.message
                })
        }
    }

    @Delete(':id')
    @UseGuards(AuthenticatedGuard)
    async deleteDirectConversation(
        @Param('id') id: number,
        @Res() response: Response
    ) {
        try {
            response
                .status(HttpStatus.OK)
                .json(await this.directConversationsService.deleteDirectConversation(id))
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