import { NotFoundException } from "@nestjs/common";
import { Injectable } from "@nestjs/common/decorators";
import { InjectRepository } from "@nestjs/typeorm";
import { ChatServer } from "src/entities/chat-server";
import { ChatServerInvitation } from "src/entities/chat-server-invitation";
import { generateUID } from "src/utils/short-uuid";
import { Repository } from "typeorm";

@Injectable()
export class ChatServerInvitationsService {
    constructor(
        @InjectRepository(ChatServerInvitation) private invitationRepository: Repository<ChatServerInvitation>,
        @InjectRepository(ChatServer) private chatServerRepository: Repository<ChatServer>
    ) {}

    async generateInvitation(chatServerId: number) {
        const chatServer = await this.chatServerRepository.findOneBy({ id: chatServerId })
        if (!chatServer) 
            throw new NotFoundException()
        const invitationDetails = {
            url: `http://localhost:4200/invitation?v=${generateUID()}`
        } 
        const newInvitation = this.invitationRepository.create({ ...invitationDetails, chatServer })
        await this.invitationRepository.save(newInvitation)
        return newInvitation
    }

    async findInvitationByUuid(uuid: string) {
        const url = `http://localhost:4200/invitation?v=${uuid}`
        const invitation = await this.invitationRepository.findOne({
            where: { url },
            relations: ['chatServer']
        })
        if (!invitation)
            throw new NotFoundException()
        return invitation
    }

    async findInvitationByChatServer(chatServerId: number) {
        const chatServer = await this.chatServerRepository.findOneBy({ id: chatServerId })
        if (!chatServer)
            throw new NotFoundException()
        const invitation = await this.invitationRepository.findOne({
            where: { chatServer: chatServer },
            order: { id: 'DESC' }
        })
        if (!invitation)
            throw new NotFoundException()
        return invitation
    }
}