import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Permission } from "src/typeorm/permission";

@Module({
    imports: [TypeOrmModule.forFeature([
        Permission
    ])]
})
export class PermissionsModule {}