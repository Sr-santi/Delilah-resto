# Delilah-resto
Online ordering system

the project provides 4 endpoints:
* login: get the access token
* users: manage the user information
* products: manage the product information
* orders: manage the orders in the system

## Implementation:

* Node.js (express)
* JSON Web Token (JWT)
* MySQL (sequalize)

## Instructions to use this project:

### Necessary programs:
- [Visual Studio Code](https://code.visualstudio.com/): LTS
- [node.js](https://nodejs.org/es/): Version 14.17.6 LTS
- [mySQL](https://dev.mysql.com/downloads/mysql/): Version 8.0.26

You need to firstly install Node.JS:
* Windows: go to official project page and download the [latest stable version](https://nodejs.org/en/download/)
* Linux: npm and Node.js binary distributions are available  in Debian and Ubuntu based linux distributions 
* macOS: 
```
curl "https://nodejs.org/dist/latest/node-${VERSION:-$(wget -qO- https://nodejs.org/dist/latest/ | sed -nE 's|.*>node-(.*)\.pkg</a>.*|\1|p')}.pkg" > "$HOME/Downloads/node-latest.pkg" && sudo installer -store -pkg "$HOME/Downloads/node-latest.pkg" -target "/"
```
clone repository with git command
with HTTPS:
```
$ git clone https://github.com/Sr-santi/Delilah-resto.git
```
with SSH:
```
$ git clone git@github.com:Sr-santi/Delilah-resto.git
```

### install dependencies
run this command to install all the packages needed in the project:
```
$ npm i
```

## Import database to Workbench

- Create a connection, stablish the connection name , password, user and port of use default values
- Click in _server_ tag, choose _data import_ option
- In the _data import window_ , select _Import from Self-contained File_ option in _Import Options_ field.
- In _Default Schema to be imported To_ field , select a _Default Target Schema_ or create one (recommendation: create a Schema named delilahresto)
- Click in _start import_ button.

## database connection:
_Open your database manager, in this case will be used Workbench:_
- modify the file actions in the route _/src/database/actions.js

```
const database = new Sequelize('mysql://user:password@hosting:port/DB_name'); //actual value
```

enter your credentials:
- Change the value user with your data base user.
- Change the value password with your data base connection password
- Change the value hosting with localhost or your cloud service hosting
- Change the value port with 3306 (default port) or your data base connection port.
- Change the value DB_name with delilahresto or the name you configured in Workbench

## Init server
run the next command in your console:
```
$ npm start
```
