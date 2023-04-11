import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Res, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { FileService } from "src/utils/file-service/file.service";
import { MulterDiskUploadedFile } from "src/utils/file-service/multer-disk-uploaded-files";
import { CreateChatServerDto, UpdateChatServerDto } from "./chat-servers.dto";
import { ChatServersService } from "./chat-servers.service";
import * as fs from 'fs'
import { AuthenticatedGuard } from "src/auth/utils/local-guard";


@Controller('chatservers')
export class ChatServersController {
    constructor(
        private readonly chatServersService: ChatServersService,
        private readonly fileService: FileService
    ) {}

    @Post(':userId')
    @UsePipes(new ValidationPipe())
    @UseGuards(AuthenticatedGuard)
    async createChatServer(
        @Param('userId') userId: number,
        @Body() createChatServerDto: CreateChatServerDto,
        @Res() response: Response
    ) {
        try {
            response
                .status(HttpStatus.CREATED)
                .json(await this.chatServersService.createChatServer(userId, createChatServerDto))
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
    async getChatServers(@Res() response: Response) {
        response
            .status(HttpStatus.OK)
            .json(await this.chatServersService.getAllChatServers())
    }

    @Get(':id')
    @UseGuards(AuthenticatedGuard)
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
    @UseGuards(AuthenticatedGuard)
    async getUserChatServers(
        @Param('userId') userId: number,
        @Res() response: Response
    ) {
        response
            .status(HttpStatus.OK)
            .json(await this.chatServersService.getChatServersByUserId(userId))
    }

    @Patch(':chatServerId/adduser/:userId')
    @UseGuards(AuthenticatedGuard)
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
    @UseGuards(AuthenticatedGuard)
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
    @UseGuards(AuthenticatedGuard)
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

    @Post(':id/uploadAvatar')
    @UseInterceptors(FileInterceptor('avatar'))
    async uploadAvatar(
        @Param('id') id: number,
        @UploadedFile() file: MulterDiskUploadedFile,
        @Res() response: Response
    ) {
        console.log(file)
        try {
            const filename = await this.fileService.saveFile(
                file,
                `uploads/chat-server-avatars`,
                `chat-server-${id}`
            )
            response
                .status(HttpStatus.CREATED)
                .json({
                    filename: filename
                })
        } catch (e) {
            response
                .status(e.status)
                .json({
                    statusCode: e.status,
                    message: e.message
                })
        }
    }

    @Get('/getAvatar/:filename')
    async getAvatar(
        @Param('filename') filename: string,
        @Res() response: Response
    ) {
        try {
            const fileStream = fs.createReadStream(`./uploads/chat-server-avatars/${filename}`)
            fileStream.on('error', () => {
                response
                    .status(HttpStatus.OK)
                    .json({
                        statusCode: 404,
                        message: "Not found but it's okay."
                    })
            })
            fileStream.pipe(response)
            response
                .set({
                    'Content-Type': `image/${filename.split('.')[1]}`
                })
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