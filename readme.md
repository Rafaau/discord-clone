# Discord-clone

**Discord-clone** is a feature-rich application that aims to replicate the functionality of the popular chat platform, **Discord**. This project is built using **Angular** for the client-side, **NestJS** with **TypeORM** for the server-side, and **MySQL** for the database layer.
~~The current implementation focuses on text-based communication, with plans to add voice chat in the future.~~ 
The current implementation includes a basic text-based communication system and has also introduced a simple voice chat using WebRTC.


## Features

Discord-clone offers a range of features found in the original Discord app, including:
- Chat server, category, and channel creation
- Role management for server members
- Server invitations
- Private messaging
- Friend invites and management
- User avatar and description
- Emoji support and message reactions
- GIF support in messages
- YouTube video sharing
- Mentioning users in messages
- Replying to specific messages
- Notifications
- Socket.IO implementation for real-time communication
- Basic frontend caching with HTTP Interceptors
- Mobile screen support (untested)

## Testing
Server-side tests are implemented using the **Jest** testing library, while E2E tests for the frontend are conducted using **Cypress**. 

## Deployment
The client-side of the application is deployed on **Vercel**, while the server-side and the database are hosted on **Railway.app**. To experience the Discord-clone app in action, please follow the link below:
[Discord-clone Demo](https://discord-clone-rafaau.vercel.app/)
> **Note:** Your browser may flag the site as potentially unsafe, but rest assured, the application does not use any real data. You can log in with the provided credentials in the dropdown in the login page or create an account using a fake email address.
## Screenshots

![alt text](https://imgur.com/FfEiW7L.jpg)
![alt text](https://imgur.com/SPVCv7R.jpg)
![alt text](https://imgur.com/qTkIgwl.jpg)
![alt text](https://imgur.com/5aPkGEs.jpg)

Feel free to explore the codebase and contribute to the project if you have any idead or improvements, or use it as a starting point for your own unique chat application.
