# About this is a fork from the Example SkyDB App
The motivation here was to simply demonstrate that Cirrus can be used in a browser with react. Additionally, it could be used to connect with multiple databases, and to resolve data from them. In this example the query is simple and just retrieves all data. It saves data into the database, but will only permanently persist local actions by design.

# Example SkyDB App

Current main branch is deployed to https://siasky.net/EABO8WM06s4wSBbEeB2ssBtV7sxQL1qnpE-3d_yoZAxxhg/ called Notes to Self and Notes from others.

## Running this version
To run this simply use the app as you did before note the additionally history section and the origin keys. If you'd like to try pulling data from another db and running it with Cirrus. Simply include the origin string in the optional public key field and you should retrieve the data from that db. 

## Available Scripts

_Install dependencies with `yarn` before trying to execute any of the commands._

In the project directory, you can run:

- `yarn start`: start the project in development mode (open [http://localhost:3000](http://localhost:3000) to view it in the browser)
- `yarn test`: launch test runner in the interactive watch mode
- `yarn build`: build the app for production to the `build` folder

## Deploying to Skynet

1. run `yarn build` to build the app for production
2. visit [siasky.net](https://siasky.net) and click on "Do you want to upload entire directory?" to switch to directory upload mode
3. drag the `build` folder over the upload area (or click "Browse" and select the directory from the file browser window)

To learn more about Skynet, visit [siasky.net](https://siasky.net) official webpage.
