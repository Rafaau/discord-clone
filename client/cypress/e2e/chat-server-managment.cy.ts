describe('chat server management tests', () => {
    beforeEach(() => {
        cy.login('test@gmail.com', 'password')
        cy.xpath('//chat-server-avatar').first().click()
    })

    it('should not display member, after kicking member', () => {
        cy.xpath('//div[contains(@class, "single-member")]').last().rightclick()
        cy.xpath('//div[contains(@class, "member-option-warn")]').click()
        cy.xpath('//div[contains(text(), "TestUser3")]').should('not.exist')
    })

    it('should display chat channel, after creating chat channel', () => {
        cy.xpath('//mat-icon[contains(text(), "add") and contains(@mattooltip, "Create Channel")]').click()
        cy.xpath('//input[@formcontrolname="name"]').filter(':visible').type('TestChatChannel3')
        cy.xpath('//span[contains(text(), "Create Channel")]').click()
        cy.contains('TestChatChannel3').should('be.visible')
    })

    it.only('should display new order of chat channels, after drag and drop chat channel', () => {
        //cy.get('#channel-1').realMouseDown().realMouseMove(0, 100).realMouseUp()
        // const dataTransfer = new DataTransfer()
        // cy.get('#channel-1').trigger('dragstart', { dataTransfer }).realSwipe
        // cy.get('#channel-2').trigger('drop', { dataTransfer })
        //cy.get('#channel-1').first().drag('#channel-2')
    })
})