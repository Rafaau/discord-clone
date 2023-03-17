import { Body, Controller, Delete, Get, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, Res, UsePipes, ValidationPipe } from "@nestjs/common";
import { Response } from "express";
import { CreateChatMessageDto, UpdateChatMessageDto } from "./chat-messages.dto";
import { ChatMessagesService } from "./chat-messages.service";

@Controller('chatmessages')
export class ChatMessagesController {
    constructor(private readonly chatMessagesService: ChatMessagesService) {}

    @Post('channel=:chatChannelId/user=:userId')
    @UsePipes(new ValidationPipe())
    async createChatMessage(
        @Param('chatChannelId', ParseIntPipe) chatChannelId: number,
        @Param('userId', ParseIntPipe) userId: number,
        @Body() chatMessageDto: CreateChatMessageDto,
        @Res() response: Response 
    ) {
        try {
            response
                .status(HttpStatus.CREATED)
                .json(await this.chatMessagesService.createChatMessage(chatChannelId, userId, chatMessageDto))
        } catch (e) {
            response
                .status(e.status)
                .json({
                    statusCode: e.status,
                    message: e.message
                })
        }
    }

    @Get()
    async getChatMessagesFromChannel(
        @Query('filterByChannel', ParseIntPipe) filterByChannel: number,
        @Query('page', ParseIntPipe) page: number,
        @Res() response: Response
    ) {
        try {
            response
                .status(HttpStatus.OK)
                .json(await this.chatMessagesService.findChatMessagesByChannelId(filterByChannel, page))
        } catch (e) {
            response
                .status(e.status)
                .json({
                    statusCode: e.status,
                    message: e.message
                })
        }
    }

    @Patch(':id')
    async editChatMessage(
        @Param('id') id: number,
        @Body() messageDetails: UpdateChatMessageDto,
        @Res() response: Response
    ) {
        try {
            response
                .status(HttpStatus.OK)
                .json(await this.chatMessagesService.updateChatMessage(id, messageDetails))
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
    async deleteChatMessage(
        @Param('id') id: number,
        @Res() response: Response
    ) {
        try {
            response
                .status(HttpStatus.OK)
                .json(await this.chatMessagesService.deleteChatMessage(id))
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