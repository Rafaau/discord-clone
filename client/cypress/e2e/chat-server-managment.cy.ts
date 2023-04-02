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
        cy.xpath('//input[@formcontrolname="name"]').filter(':visible').click().type('TestChatChannel3')
        cy.xpath('//span[contains(text(), "Create Channel")]').click()
        cy.contains('TestChatChannel3').should('be.visible')
    })

    it('should display new order of chat channels, after drag and drop chat channel', () => {
        //cy.get('#channel-1').realMouseDown().realMouseMove(0, 100).realMouseUp()
        // const dataTransfer = new DataTransfer()
        // cy.get('#channel-1').trigger('dragstart', { dataTransfer }).realSwipe
        // cy.get('#channel-2').trigger('drop', { dataTransfer })
        //cy.get('#channel-1').first().drag('#channel-2')
    })

    it('should delete chat channel, after clicking on delete chat channel button', () => {
        cy.xpath('//mat-icon[contains(text(), "add") and contains(@mattooltip, "Create Channel")]').click()
        cy.xpath('//input[@formcontrolname="name"]').filter(':visible').click().type('ChatChannelToDelete')
        cy.xpath('//span[contains(text(), "Create Channel")]').click()
        cy.contains('ChatChannelToDelete').should('be.visible')
        cy.xpath('//div[contains(@class, "chat-channel")]').last().realHover()
        cy.xpath('//i[contains(@class, "fa-gear") and contains(@mattooltip, "Edit Channel")]').last().click()
        cy.xpath('//div[contains(text(), "Delete Channel")]').click()
        cy.contains('ChatChannelToDelete').should('not.exist')
    })

    it('should display new category, after creating new category', () => {
        cy.xpath('//mat-icon[contains(text(), "keyboard_arrow_down")]').first().click()
        cy.xpath('//div[contains(text(), "Create Category")]').click()
        cy.xpath('//input[@formcontrolname="name"]').filter(':visible').click().type('TestChatCategory2')
        cy.xpath('//span[contains(text(), "Create Category")]').click()
        cy.contains('TESTCHATCATEGORY2').should('be.visible')
    })

    it('should display invitation, after sending invitation link', () => {
        cy.xpath('//mat-icon[contains(text(), "keyboard_arrow_down")]').first().click()
        cy.xpath('//div[contains(text(), "Invite People")]').click()
        cy.xpath('//div[contains(@class, "invitation-link")]')
            .invoke('text')
            .then((text) => {
                cy.xpath('//mat-icon[contains(text(), "close")]').first().click()
                cy.xpath('//textarea').first().type(text.slice(0, -7)) // SLICE COPY SPAN
                cy.realPress('Enter')
                cy.contains("YOU'VE BEEN INVITED TO JOIN A SERVER")
            })
    })

    it('should display updated server name, after editing server name', () => {
        cy.xpath('//mat-icon[contains(text(), "keyboard_arrow_down")]').first().click()
        cy.xpath('//div[contains(text(), "Server Settings")]').click()
        cy.xpath('//input').filter(':visible').click().type('Updated')
        cy.xpath('//button[contains(text(), "Save Changes")]').click()
        cy.xpath('//div[contains(@class, "close-btn")]').first().click()
        cy.contains('TestChatServer1Updated').should('be.visible')
    })

    it('should display role view, after clicking on role view button', () => {
        cy.xpath('//mat-icon[contains(text(), "keyboard_arrow_down")]').first().click()
        cy.xpath('//div[contains(text(), "Server Settings")]').click()
        cy.xpath('//div[contains(text(), "Roles")]').click()
        cy.contains('Use roles to group your server members and assign permissions').should('be.visible')
    })

    it('should display extended role view, after clicking on role', () => {
        cy.xpath('//mat-icon[contains(text(), "keyboard_arrow_down")]').first().click()
        cy.xpath('//div[contains(text(), "Server Settings")]').click()
        cy.xpath('//div[contains(text(), "Roles")]').click()
        cy.xpath('//td[contains(@class, "role-name")]').first().click()
        cy.contains('EDIT ROLE').should('be.visible')
    })

    it('should display updated role name, after editing role name', () => {
        cy.xpath('//mat-icon[contains(text(), "keyboard_arrow_down")]').first().click()
        cy.xpath('//div[contains(text(), "Server Settings")]').click()
        cy.xpath('//div[contains(text(), "Roles")]').click()
        cy.xpath('//div[contains(text(), "Member")]').first().click()
        cy.xpath('//input').filter(':visible').click().clear().type('Updated')
        cy.xpath('//button[contains(text(), "Save Changes")]').click()
        cy.xpath('//div[contains(@class, "back-to-roles-btn")]').first().click()
        cy.contains('Updated').should('be.visible')
    })

    it('should not be able to send messages, after changing permissions', () => {
        const changePermissions = () => {
            cy.xpath('//mat-icon[contains(text(), "keyboard_arrow_down")]').first().click()
            cy.xpath('//div[contains(text(), "Server Settings")]').click()
            cy.xpath('//div[contains(text(), "Roles")]').click()
            cy.xpath('//div[contains(text(), "Owner")]').first().click()
            cy.xpath('//div[contains(text(), "Permissions")]').first().click()
            cy.xpath('//button[contains(@role, "switch")]').eq(1).click()
            cy.xpath('//button[contains(text(), "Save Changes")]').click()
        }
        changePermissions()
        cy.xpath('//div[contains(@class, "close-btn")]').first().click()
        cy.xpath('//textarea').first().should('be.disabled')
        changePermissions()
    })

    it('should display new role, after creating new role', () => {
        cy.xpath('//mat-icon[contains(text(), "keyboard_arrow_down")]').first().click()
        cy.xpath('//div[contains(text(), "Server Settings")]').click()
        cy.xpath('//div[contains(text(), "Roles")]').click()
        cy.xpath('//div[contains(text(), "Owner")]').first().click()
        cy.xpath('//mat-icon[contains(text(), "add")]').filter(':visible').click()
        cy.contains('new role').should('be.visible')
    })

    it('should not display role, after deleting role', () => {
        cy.xpath('//mat-icon[contains(text(), "keyboard_arrow_down")]').first().click()
        cy.xpath('//div[contains(text(), "Server Settings")]').click()
        cy.xpath('//div[contains(text(), "Roles")]').click()
        cy.xpath('//div[contains(text(), "Owner")]').first().click()
        cy.xpath('//mat-icon[contains(text(), "add")]').filter(':visible').click()
        cy.xpath('//input').filter(':visible').click().clear().type('RoleToDelete')
        cy.xpath('//button[contains(text(), "Save Changes")]').click()
        cy.xpath('//div[contains(@class, "single-role") and contains(text(), "RoleToDelete")]').rightclick()
        cy.xpath('//div[contains(@class, "role-option warn")]').first().click()
        cy.contains('RoleToDelete').should('not.exist')
    })

    it('should add member to list, after assigning member to role', () => {
        cy.xpath('//mat-icon[contains(text(), "keyboard_arrow_down")]').first().click()
        cy.xpath('//div[contains(text(), "Server Settings")]').click()
        cy.xpath('//div[contains(text(), "Roles")]').click()
        cy.xpath('//div[contains(text(), "Owner")]').first().click()
        cy.xpath('//mat-icon[contains(text(), "add")]').filter(':visible').click()
        cy.xpath('//div[contains(text(), "Manage Members")]').first().click()
        cy.xpath('//span[contains(text(), "Add Members")]').first().click()
        cy.xpath('//div[contains(@class, "single-user")]').first().click()
        cy.xpath('//button[contains(@class, "submit-btn")]').first().click()
        cy.xpath('//div[contains(@class, "user-name") and contains(text(), "TestUser1")]').should('be.visible')
    })

    it('should display chat server, after creating new chat server', () => {
        cy.xpath('//div[contains(@mattooltip, "Add a Server")]').click()
        cy.xpath('//div[contains(@class, "dialog-tab")]').click()
        cy.xpath('//input').filter(':visible').click().type('NewChatServer')
        cy.xpath('//span[contains(text(), "Create")]').click()
        cy.xpath('//div[contains(@ng-reflect-message, "NewChatServer")]').should('be.visible')
    })
})