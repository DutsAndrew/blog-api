# blog-api

Blog API is an API used to facilitate data between a MongoDB NoSQL database and two different Front-End Applications. The API follows RESTFUL API practices--it will only receive and send JSON data. Authenticated users can perform a full array of CRUD operations.

Both Front-End Applications can be accessed here:
- [Blog-Client](https://dutsandrew-blog-client.vercel.app/)
- [Blog-CMS](https://dutsandrew-blog-cms.vercel.app/)

You can check the status of the API here: https://avd-blog-api.fly.dev/ <br>
Keep in mind this is an API not a Web Application, this blog API integrates with a Front-End to send and receive data.

Currently this Blog-API is used with two NextJS, React, and TypeScript front-ends, those Github Repos can be found here:
- [Blog-CMS](https://github.com/DutsAndrew/blog-cms) (Content-Management-System) - for authenticated users to perform CRUD operations on blog posts
- [Blog-Client](https://github.com/DutsAndrew/blog-client) - a front-end application to interact with and view blog posts

Tools:
- TypeScript
- Node.js
- Express
- MongoDB
- Lots of libraries (check the package.json for more details)
