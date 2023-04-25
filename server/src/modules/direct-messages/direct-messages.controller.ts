import { Body, Controller, Delete, Get, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, Res, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { Response } from "express";
import { CreateDirectMessageDto, UpdateDirectMessageDto } from "./direct-messages.dto";
import { DirectMessagesService } from "./direct-messages.service";
import { AuthenticatedGuard } from "src/auth/utils/local-guard";

@Controller('directmessages')
export class DirectMessagesControler {
    constructor(private readonly directMessagesService: DirectMessagesService) {}

    @Post('conversation=:conversationId/sender=:userId')
    @UsePipes(new ValidationPipe())
    @UseGuards(AuthenticatedGuard)
    async createDirectMessage(
        @Param('conversationId') conversationId: number,
        @Param('userId') userId: number,
        @Body() createDirectMessageDto: CreateDirectMessageDto,
        @Res() response: Response 
    ) {
        try {
            response
                .status(HttpStatus.CREATED)
                .json(
                    await this.directMessagesService.createDirectMessage(
                        conversationId, 
                        userId, 
                        createDirectMessageDto
                    )
                )
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
    @UseGuards(AuthenticatedGuard)
    async getDirectMessagesByConversation(
        @Query('conversation', ParseIntPipe) conversation: number,
        @Query('page', ParseIntPipe) page: number,
        @Res() response: Response
    ) {
        try {
            response
                .status(HttpStatus.OK)
                .json(await this.directMessagesService.findDirectMessagesByConversation(conversation, page))
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
    async getSingleDirectMessage(
        @Param('id') id: number,
        @Res() response: Response
    ) {
        try {
            response
                .status(HttpStatus.OK)
                .json(await this.directMessagesService.getSingleDirectMessage(id))
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
    @UsePipes(new ValidationPipe())
    @UseGuards(AuthenticatedGuard)
    async updateDirectMessage(
        @Param('id') id: number,
        @Body() messageDetails: UpdateDirectMessageDto,
        @Res() response: Response
    ) {
        try {
            response
                .status(HttpStatus.OK)
                .json(await this.directMessagesService.updateDirectMessage(id, messageDetails))
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
    async deleteDirectMessage(
        @Param('id') id: number,
        @Res() response: Response
    ) {
        try {
            response
                .status(HttpStatus.OK)
                .json(await this.directMessagesService.deleteDirectMessage(id))
        } catch(e) {
            response
                .status(e.status)
                .json({
                    statusCode: e.status,
                    message: e.message
                })
        }
    }
}
