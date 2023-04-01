import { first } from "cypress/types/lodash"

describe('direct messages tests', () => {
    beforeEach(() => {
        cy.login('test@gmail.com', 'password')
    })

    it('should redirect to conversation, after clicking on TestUser2', () => {
        cy.xpath('//div[contains(@class, "single-conversation")]').first().click()
        cy.url().should('contain', 'conversation')
        cy.contains('This is the beginning of your direct message history with @TestUser2').should('be.visible')
    })

    it('should display message, after sending message', () => {
        cy.xpath('//div[contains(@class, "single-conversation")]').first().click()
        cy.xpath('//textarea').type('Test message')
        cy.realPress('Enter')
        cy.contains('Test message').should('be.visible')
    })

    it('should display gif, after sending gif', () => {
        cy.xpath('//div[contains(@class, "single-conversation")]').first().click()
        cy.xpath('//div[contains(@class, "gif-picker")]').click()
        cy.xpath('//div[contains(@class, "single-gif")]').first().click()
        cy.xpath('//img[contains(@class, "gif-img")]').should('be.visible')
    })

    it('shoudl display emoji, after sending emoji', () => {
        cy.xpath('//div[contains(@class, "single-conversation")]').first().click()
        cy.xpath('//div[contains(@class, "picker-input")]').first().click()
        cy.xpath('//button[contains(@aria-label, "👍, +1, thumbsup")]').first().click()
        cy.realPress('Enter')
        cy.contains('👍').should('be.visible')
    })

    it('should not display message, after deleting message', () => {
        cy.xpath('//div[contains(@class, "single-conversation")]').first().click()
        cy.xpath('//textarea').type('Test message to delete')
        cy.realPress('Enter')
        cy.contains('Test message to delete').should('be.visible')
        cy.xpath('//message-content').last().realHover()
        cy.xpath('//i[contains(@class, "fa-trash-can")]').last().click()
        cy.xpath('//button[@color="warn"]').click()
        cy.contains('Test message to delete').should('not.exist')
    })

    it('should display updated message, after editing message', () => {
        cy.xpath('//div[contains(@class, "single-conversation")]').first().click()
        cy.xpath('//textarea').type('Test message to edit')
        cy.realPress('Enter')
        cy.contains('Test message to edit').should('be.visible')
        cy.xpath('//message-content').last().realHover()
        cy.xpath('//i[contains(@class, "fa-pen")]').last().click()
        cy.xpath('//textarea').first().clear().type('Edited message')
        cy.realPress('Enter')
        cy.xpath('//div[contains(@class, "messages-wrapper")]').scrollTo('bottom')
        cy.contains('Edited message').should('be.visible')
    })

    it('should display reaction, after sending reaction', () => {
        cy.xpath('//div[contains(@class, "single-conversation")]').first().click()
        cy.xpath('//textarea').type('Test message to react')
        cy.realPress('Enter')
        cy.contains('Test message to react').should('be.visible')
        cy.xpath('//message-content').last().realHover()
        cy.xpath('//i[contains(@class, "fa-face-grin-beam")]').last().click()
        cy.xpath('//button[contains(@aria-label, "👍, +1, thumbsup")]').first().click()
        cy.contains('👍').should('be.visible')
    })

    it('should display message, after reply on another message', () => {
        cy.xpath('//div[contains(@class, "single-conversation")]').first().click()
        cy.xpath('//textarea').type('Test message to reply')
        cy.realPress('Enter')
        cy.contains('Test message to reply').should('be.visible')
        cy.xpath('//message-content').last().realHover()
        cy.xpath('//i[contains(@class, "fa-reply")]').last().click()
        cy.contains('Replying to TestUser1').should('be.visible')
        cy.xpath('//textarea').type('Answer')
        cy.realPress('Enter')
        cy.contains('Answer').should('be.visible')
        cy.xpath('//div[contains(text(), "Test message to reply")]').should((messages) => {
            expect(messages).to.have.length(2)
        })
    })

    it('should display mentioned user, after sending message with mention', () => {
        cy.xpath('//div[contains(@class, "single-conversation")]').first().click()
        cy.xpath('//textarea').type('@TestUser2')
        cy.realPress('Enter')
        cy.xpath('//span[contains(@class, "mention-highlight")]').should('be.visible')
    })
})