# blog-api

Blog API is an API used to facilitate data between the Back-End as a proxy for the Database to the user on the Front-End. This application is to be used in conjunction with a Front-End. The API follows the practice of REST and is a RESTful API that will only receive and send JSON data. In addition, a full array of CRUD operations are permitted to be used within the API to modify data on the database through token/account authentication and account rights.

You can check the status of the API here: https://avd-blog-api.fly.dev/ <br>
Keep in mind this is an API not a Web Application, this blog API integrates with a Front-End to send and receive data.

Currently this Blog-API is used with two NextJS, React, and TypeScript front-ends, those can be found here:
- [Blog-CMS](https://github.com/DutsAndrew/blog-cms) (Content-Management-System) for authenticated users to perform CRUD operations on blog posts
- [Blog-Client](https://github.com/DutsAndrew/blog-client) a front-end application to interact with and view blog posts

Tools:
- TypeScript
- Node.js
- Express
- MongoDB
- Lots of libraries (check the package.json for more details)
