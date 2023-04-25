import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/entities/user";
import { FileService } from "src/utils/file-service/file.service";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { AppSettings } from "src/entities/app-settings";

@Module({
    imports: [TypeOrmModule.forFeature([
        User,
        AppSettings
    ])],
    controllers: [UsersController],
    providers: [UsersService, FileService]
})
export class UsersModule {}
