import { Body, Controller, Delete, Get, HttpStatus, NotFoundException, Param, Patch, Post, Query, Res, UploadedFile, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { FileService } from "src/utils/file-service/file.service";
import { MulterDiskUploadedFile } from "src/utils/file-service/multer-disk-uploaded-files";
import { CreateUserDto, UpdateUserDto } from "./users.dto";
import { UsersService } from "./users.service";
import * as fs from 'fs'
import { NotFoundError } from "rxjs";

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly fileService: FileService
    ) {}

    @Post()
    @UsePipes(new ValidationPipe())
    async createUser(
        @Body() createUserDto: CreateUserDto,
        @Res() response: Response
    ) {
        response
            .status(HttpStatus.CREATED)
            .json(await this.usersService.createUser(createUserDto))
    }

    @Get()
    async getUsers(@Res() response: Response) {
        response
            .status(HttpStatus.OK)
            .json(await this.usersService.findUsers())
    }

    @Get(':id')
    async getUserById(
        @Param('id') id: number,
        @Res() response: Response
    ) {
        try {
            response
                .status(HttpStatus.OK)
                .json(await this.usersService.findUserById(id))
        } catch (e) {
            response
                .status(e.status)
                .json({
                    statusCode: e.status,
                    message: e.message
                })
        }
    }

    @Get('byChatServer/:chatServerId')
    async getUsersByChatServer(
        @Param('chatServerId') chatServerId: number,
        @Res() response: Response
    ) {
        const users = await this.usersService.findUsersByServer(chatServerId)
        const owner: any = users.filter(x => x.managedChatServers.some(x => x.id == chatServerId))[0]
        if (users.length)
            owner.isOwner = true
        response
            .status(HttpStatus.OK)
            .json(users)
    }

    @Get(':id/friends')
    async getFriendsOfUser(
        @Param('id') id: number,
        @Res() response: Response
    ) {
        try {
            response
                .status(HttpStatus.OK)
                .json(await this.usersService.findFriendsOfUser(id))
        } catch (e) {
            response
                .status(e.status)
                .json({
                    statusCode: e.status,
                    message: e.message
                })
        }
    }

    @Get(':id/friendRequests')
    async getFriendRequestsOfUser(
        @Param('id') id: number,
        @Res() response: Response
    ) {
        try {
            response
                .status(HttpStatus.OK)
                .json(await this.usersService.findFriendRequestsOfUser(id))
        } catch (e) {
            response
                .status(e.status)
                .json({
                    statusCode: e.status,
                    message: e.message
                })
        }
    }

    @Get(':id/query')
    async checkIfPasswordDoesMatch(
        @Param('id') id: number,
        @Query('passwordToCheck') rawPassword: string,
        @Res() response: Response
    ) {
        try {
            response
                .status(200)
                .json(await this.usersService.checkIfPasswordDoesMatch(id, rawPassword))
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
    async updateUser(
        @Param('id') id: number,
        @Body() updateUserDto: UpdateUserDto,
        @Res() response: Response,
    ) {
        try {
            response
                .status(HttpStatus.OK)
                .json(await this.usersService.updateUser(id, updateUserDto))
        } catch (e) {
            response
                .status(e.status)
                .json({
                    statusCode: e.status,
                    message: e.message
                })
        }
    }

    @Patch(':firstUserId/addFriend/:secondUserId')
    async markUsersAsFriends(
        @Param('firstUserId') firstUserId: number,
        @Param('secondUserId') secondUserId: number,
        @Res() response: Response
    ) {
        try {
            response
                .status(HttpStatus.OK)
                .json(await this.usersService.markUsersAsFriends(firstUserId, secondUserId))
        } catch (e) {
            response
                .status(e.status)
                .json({
                    statusCode: e.status,
                    message: e.message
                })
        }
    }

    @Patch(':firstUserId/removeFriend/:secondUserId')
    async removeFriendship(
        @Param('firstUserId') firstUserId: number,
        @Param('secondUserId') secondUserId: number,
        @Res() response: Response
    ) {
        try {
            response
                .status(HttpStatus.OK)
                .json(await this.usersService.removeFriendshipBetweenUsers(firstUserId, secondUserId))
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
                `uploads/user-avatars`,
                `user-${id}`
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
            const fileStream = fs.createReadStream(`./uploads/user-avatars/${filename}`)
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
    async deleteUser(
        @Param('id') id: number,
        @Res() response: Response
    ) {
        try {
            response
                .status(HttpStatus.OK)
                .json(await this.usersService.deleteUser(id))
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