import { defineConfig } from "cypress"

describe('login and register pages tests', () => {
    it('should redirect to login page, when not authorized', () => {
        cy.visit('/')
        cy.url().should('include', '/login')
    })

    it('should redirect to register page, when clicking on register hyperlink', () => {
        cy.visit('/login')
        cy.xpath('//a[contains(text(), "Register")]').click()
        cy.url().should('include', '/register')
    })

    it('should redirect to login page, when clicking on login hyperlink', () => {
        cy.visit('/register')
        cy.xpath('//a[contains(text(), "Log In")]').click()
        cy.url().should('include', '/login')
    })

    it('should redirect to login page, after successful registration', () => {
        cy.register('test@gmail.com', 'test', 'Password123!')
        cy.url().should('contain', '/login')
    })

    it('should redirect to home page, after successful login', () => {
        cy.visit('/login')
        cy.xpath('//input[@formcontrolname="email"]').type('test@gmail.com')
        cy.xpath('//input[@formcontrolname="password"]').type('password')
        cy.xpath('//button[@type="submit"]').click()
        cy.url().should('eq', `${Cypress.config().baseUrl}/(main:friends//secondary:directmessages)`)
    })

    it('should display validations messages, when register form is invalid', () => {
        cy.visit('/register')
        cy.xpath('//input[@type="checkbox"]').click()
        cy.xpath('//button[@type="submit"]').click()
        cy.contains('Email is required').should('be.visible')
        cy.contains('Username is required').should('be.visible')
        cy.contains('Password is required').should('be.visible')
        cy.xpath('//input[@formcontrolname="email"]').type('test')
        cy.contains('Please enter a valid email address').should('be.visible')
    })

    it('should return validation message, when login form is invalid', () => {
        cy.visit('/login')
        cy.xpath('//button[@type="submit"]').click()
        cy.contains('Email is required').should('be.visible')
        cy.contains('Password is required').should('be.visible')
        cy.contains('Email or Password is invalid').should('be.visible')
        cy.xpath('//input[@formcontrolname="email"]').type('test')
        cy.contains('Please enter a valid email address').should('be.visible')
    })
})