import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Res, UsePipes, ValidationPipe } from "@nestjs/common";
import { Response } from "express";
import { CreateChatServerDto, UpdateChatServerDto } from "./chat-servers.dto";
import { ChatServersService } from "./chat-servers.service";


@Controller('chatservers')
export class ChatServersController {
    constructor(private readonly chatServersService: ChatServersService) {}

    @Post(':userId')
    @UsePipes(new ValidationPipe())
    async createChatServer(
        @Param('userId') userId: number,
        @Body() createChatServerDto: CreateChatServerDto,
        @Res() response: Response
    ) {
        try {
            response
                .status(HttpStatus.CREATED)
                .json(await this.chatServersService.createChatServer(userId, createChatServerDto))
        } catch(e) {
            response
                .status(e.status)
                .json({
                    statusCode: e.status,
                    message: e.message
                })
        }
    }

    @Get()
    async getChatServers(@Res() response: Response) {
        response
            .status(HttpStatus.OK)
            .json(await this.chatServersService.getAllChatServers())
    }

    @Get(':id')
    async getChatServer(
        @Param('id') id: number,
        @Res() response: Response
    ) {
        try {
            response
                .status(HttpStatus.OK)
                .json(await this.chatServersService.getChatServerById(id))
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
    async getUserChatServers(
        @Param('userId') userId: number,
        @Res() response: Response
    ) {
        response
            .status(HttpStatus.OK)
            .json(await this.chatServersService.getChatServersByUserId(userId))
    }

    @Patch(':chatServerId/adduser/:userId')
    async addUserToChatServer(
        @Param('chatServerId') chatServerId: number,
        @Param('userId') userId: number,
        @Res() response: Response
    ) {
        try {
            response
                .status(HttpStatus.OK)
                .json(await this.chatServersService.addMemberToChatServer(userId, chatServerId))
        } catch (e) {
            response
                .status(e.status)
                .json({
                    statusCode: e.status,
                    message: e.message
                })
        }
    }

    @Patch(':chatServerId/removeuser/:userId')
    async removeMemberFromChatServer(
        @Param('chatServerId') chatServerId: number,
        @Param('userId') userId: number,
        @Res() response: Response
    ) {
        try {
            response
                .status(HttpStatus.OK)
                .json(await this.chatServersService.removeMemberFromChatServer(userId, chatServerId))
        } catch (e) {
            response
                .status(e.status)
                .json({
                    statusCode: e.status,
                    message: e.message
                })
        }
    }

    @Patch(':chatServerId')
    @UsePipes(new ValidationPipe())
    async updateChatServer(
        @Param('chatServerId') id: number,
        @Body() serverDetails: UpdateChatServerDto,
        @Res() response: Response
    ) {
        try {
            response
                .status(HttpStatus.OK)
                .json(await this.chatServersService.updateChatServer(id, serverDetails))
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
    async deleteChatServer(
        @Param('id') id: number,
        @Res() response: Response
    ) {
        try {
            response
                .status(HttpStatus.OK)
                .json(await this.chatServersService.deleteChatServer(id))
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