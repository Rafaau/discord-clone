export class CreateMessageReactionDto {
    reaction: string & { length: 1 }
}