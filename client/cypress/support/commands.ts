/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

declare namespace Cypress {
    interface Chainable {
      register: (
        email: string,
        username: string,
        password: string
      ) => Cypress.Chainable
      login: (
        email: string,
        password: string
      ) => Cypress.Chainable
    }
  }

Cypress.Commands.add('register', (
    email: string, 
    username: string, 
    password: string
) => {
    cy.visit('/register')
    cy.xpath('//input[@formcontrolname="email"]').type(email)
    cy.xpath('//input[@formcontrolname="username"]').type(username)
    cy.xpath('//input[@formcontrolname="password"]').type(password)
    cy.xpath('//input[@type="checkbox"]').click()
    cy.xpath('//button[@type="submit"]').click()
})

Cypress.Commands.add('login', (
    email: string,
    password: string
) => {
    cy.visit('/login')
    cy.xpath('//input[@formcontrolname="email"]').type(email)
    cy.xpath('//input[@formcontrolname="password"]').type(password)
    cy.xpath('//button[@type="submit"]').click()
})