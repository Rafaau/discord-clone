import { HttpStatus, ValidationPipe } from "@nestjs/common";
import { Body, Controller, Delete, Get, Param, Post, Res, UseGuards, UsePipes } from "@nestjs/common/decorators";
import { Response } from "express";
import { CreateChatCategoryDto, CreateChatChannelDto } from "./chat-channels.dto";
import { ChatChannelsService } from "./chat-channels.service";
import { AuthenticatedGuard } from "src/auth/utils/local-guard";

@Controller('chatchannels')
export class ChatChannelsController {
    constructor(private readonly chatChannelsService: ChatChannelsService) {}

    @Post(':chatCategoryId')
    @UsePipes(new ValidationPipe())
    @UseGuards(AuthenticatedGuard)
    async createChatChannel(
        @Param("chatCategoryId") chatCategoryId: number,
        @Body() createChatChannelDto: CreateChatChannelDto,
        @Res() response: Response
    ) {
        try {
            response
                .status(HttpStatus.CREATED)
                .json((await this.chatChannelsService.createChatChannel(chatCategoryId, createChatChannelDto)).newChatChannel)
        } catch (e) {
            response
                .status(e.status)
                .json({
                    statusCode: e.status,
                    message: e.message
                })
        }
    }

    @Post('category/:chatServerId')
    @UsePipes(new ValidationPipe())
    @UseGuards(AuthenticatedGuard)
    async createChatCategory(
        @Param('chatServerId') chatServerId: number,
        @Body() createChatCategoryDto: CreateChatCategoryDto,
        @Res() response: Response
    ) {
        try {
            response
                .status(HttpStatus.CREATED)
                .json((await this.chatChannelsService.createChatCategory(chatServerId, createChatCategoryDto)).newChatCategory)
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
    async getChatChannel(
        @Param('id') id: number,
        @Res() response: Response
    ) {
        try {
            response
                .status(HttpStatus.OK)
                .json(await this.chatChannelsService.findChatChannelById(id))
        } catch (e) {
            response
                .status(e.status)
                .json({
                    statusCode: e.status,
                    message: e.message
                })
        }
    }

    @Delete('category/:id')
    @UseGuards(AuthenticatedGuard)
    async deleteChatCategory(
        @Param('id') id: number,
        @Res() response: Response
    ) {
        try {
            response
                .status(HttpStatus.OK)
                .json(await this.chatChannelsService.deleteChatCategory(id))
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