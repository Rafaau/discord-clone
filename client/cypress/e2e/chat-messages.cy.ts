describe('chat messages tests', () => {
    beforeEach(() => {
        cy.login('test@gmail.com', 'password')
        cy.xpath('//chat-server-avatar').first().click()
    })

    it('should redirect to first channel of chat server, after clicking on chat server icon', () => {
        cy.url().should('contain', 'chatserver')
        cy.url().should('contain', 'channel')
        cy.contains('This is the start of the #TestChatChannel1 channel').should('be.visible')
    })

    it('should redirect to channel, after clicking on channel', () => {
        cy.xpath('//div[contains(@class, "chat-channel")]').last().click()
        cy.url().should('contain', 'channel=2')
    })

    it('should display message, after sending message', () => {
        cy.xpath('//textarea').type('Test message')
        cy.realPress('Enter')
        cy.xpath('//message-content').last().scrollIntoView()
        cy.contains('Test message').should('be.visible')
    })

    it('should display gif, after sending gif', () => {
        cy.xpath('//div[contains(@class, "gif-picker")]').click()
        cy.xpath('//div[contains(@class, "single-gif")]').first().click()
        cy.xpath('//message-content').last().scrollIntoView()
        cy.xpath('//img[contains(@class, "gif-img")]').should('be.visible')
    })

    it('should display emoji, after sending emoji', () => {
        cy.xpath('//div[contains(@class, "picker-input")]').first().click()
        cy.xpath('//button[contains(@aria-label, "👍, +1, thumbsup")]').first().click()
        cy.xpath('//message-content').last().scrollIntoView()
        cy.realPress('Enter')
        cy.contains('👍').should('be.visible')
    })

    it('should not display message, after deleting message', () => {
        cy.xpath('//textarea').type('Test message to delete')
        cy.realPress('Enter')
        cy.contains('Test message to delete').should('be.visible')
        cy.xpath('//message-content').last().realHover()
        cy.xpath('//i[contains(@class, "fa-trash-can")]').last().click()
        cy.xpath('//button[@color="warn"]').click()
        cy.contains('Test message to delete').should('not.exist')
    })

    it('should display updated message, after editing message', () => {
        cy.xpath('//textarea').type('Test message to edit')
        cy.realPress('Enter')
        cy.contains('Test message to edit').should('be.visible')
        cy.xpath('//message-content').last().realHover()
        cy.xpath('//i[contains(@class, "fa-pen")]').last().click()
        cy.xpath('//textarea').first().clear().type('Edited message')
        cy.realPress('Enter')
        cy.xpath('//message-content').last().scrollIntoView()
        cy.contains('Edited message').should('be.visible')
    })

    it('should display reaction, after send reaction', () => {
        cy.xpath('//textarea').type('Test message to reaction')
        cy.realPress('Enter')
        cy.contains('Test message to reaction').should('be.visible')
        cy.xpath('//message-content').last().realHover()
        cy.xpath('//i[contains(@class, "fa-face-grin-beam")]').last().click()
        cy.xpath('//button[contains(@aria-label, "👍, +1, thumbsup")]').first().click()
        cy.xpath('//message-content').last().scrollIntoView()
        cy.xpath('//div[contains(@class, "single-reaction") and contains(text(), "👍")]').should('be.visible')
    })

    it('should display message, after reply to message', () => {
        cy.xpath('//textarea').type('Test message to reply')
        cy.realPress('Enter')
        cy.contains('Test message to reply').should('be.visible')
        cy.xpath('//message-content').last().realHover()
        cy.xpath('//i[contains(@class, "fa-reply")]').last().click()
        cy.xpath('//textarea').first().type('Answer')
        cy.realPress('Enter')
        cy.xpath('//message-content').last().scrollIntoView()
        cy.contains('Answer').should('be.visible')
    })

    it('should display mentioned user, after sending message with mention', () => {
        cy.xpath('//textarea').type('@TestUser2')
        cy.realPress('Enter')
        cy.xpath('//message-content').last().scrollIntoView()
        cy.xpath('//span[contains(@class, "mention-highlight")]').should('be.visible')
    })

    it('should hide members list, after clicking on members list button', () => {
        cy.xpath('//mat-icon[contains(text(), "people")]').click()
        cy.xpath('//div[contains(@class, "members-container")]').should('not.exist')
    })

    it('should display member details, after clicking on member', () => {
        cy.xpath('//div[contains(@class, "single-member")]').last().click()
        cy.contains('ROLE').should('be.visible')
    })

    it('should redirect to conversation, after sending private message', () => {
        cy.xpath('//div[contains(@class, "single-member")]').last().click()
        cy.xpath('//input').type('Test private message')
        cy.realPress('Enter')
        cy.url().should('contain', 'conversation')
        cy.contains('Test private message').should('be.visible')
    })
})