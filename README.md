# Delilah-resto
Online ordering system

the projecto provides 4 endpoints:
* login: get the access token
* users: manage the user information
* products: manage the product information
* orders: manage the orders in the system

## Implementation:

* Node.js
* JSON Web Token (JWT)
* MySQL

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
