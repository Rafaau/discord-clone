describe('user settings tests', () => {
    beforeEach(() => {
        cy.login('test@gmail.com', 'password')
    })

    it('should display user settings page', () => {
        cy.xpath('//i[contains(@mattooltip, "User Settings")]').click()
        cy.contains('USER SETTINGS').should('be.visible')
    })

    it('should display Profiles view, when clicking on Profiles tab', () => {
        cy.xpath('//i[contains(@mattooltip, "User Settings")]').click()
        cy.xpath('//div[contains(text(), "Profiles")]').click()
        cy.contains('PREVIEW').should('be.visible')
    })

    it('should display updated username, after changing username', () => {
        cy.xpath('//i[contains(@mattooltip, "User Settings")]').click()
        cy.xpath('//button[contains(@class, "action-btn")]').first().click()
        cy.xpath('//input[contains(@formcontrolname, "username")]').clear().type('UpdatedUsername')
        cy.xpath('//i[contains(@class, "fa-check")]').click()
        cy.xpath('//div[contains(text(), "UpdatedUsername")]').should('be.visible')
    })

    it('should display updated email, after changing email', () => {
        cy.xpath('//i[contains(@mattooltip, "User Settings")]').click()
        cy.xpath('//button[contains(@class, "action-btn")]').eq(1).click()
        cy.xpath('//input[contains(@formcontrolname, "email")]').clear().type('updated@gmail.com')
        cy.xpath('//i[contains(@class, "fa-check")]').click()
        cy.xpath('//div[contains(text(), "updated@gmail.com")]').should('be.visible')
    })

    it('should display updated phone number, after changing phone number', () => {
        cy.xpath('//i[contains(@mattooltip, "User Settings")]').click()
        cy.xpath('//button[contains(@class, "action-btn")]').last().click()
        cy.xpath('//input[contains(@formcontrolname, "phoneNumber")]').clear().type('501848654')
        cy.xpath('//i[contains(@class, "fa-check")]').click()
        cy.xpath('//div[contains(text(), "501848654")]').should('be.visible')
    })

    it.only('should change password, when provided old password matches', () => {
        cy.xpath('//i[contains(@mattooltip, "User Settings")]').click()
        cy.xpath('//span[contains(text(), "Change Password")]').click()
        cy.xpath('//input[contains(@formcontrolname, "oldPassword")]').click().type('password')
        cy.xpath('//input[contains(@formcontrolname, "newPassword")]').click().type('newPassword')
        cy.xpath('//input[contains(@formcontrolname, "confirmNewPassword")]').click().type('newPassword')
        cy.xpath('//span[contains(text(), "Done")]').click()
        cy.xpath('//span[contains(text(), "Change Password")]').click()
        cy.xpath('//input[contains(@formcontrolname, "oldPassword")]').click().type('newPassword')
        cy.xpath('//input[contains(@formcontrolname, "newPassword")]').click().type('password')
        cy.xpath('//input[contains(@formcontrolname, "confirmNewPassword")]').click().type('password')
        cy.xpath('//span[contains(text(), "Done")]').click()
    })
})