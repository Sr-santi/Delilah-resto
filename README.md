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

## database connection:
send a message to santiriosolaya@gmail.com requesting database access.
* you must send your public ip address

note: remember, your public ip address changes always you stablish a new connection in your network
the database is hosting in google cloud.

## Init server
run the next command in your console:
```
$ npm start
```
