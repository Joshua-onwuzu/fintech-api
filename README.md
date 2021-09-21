## Fintech-api

This is a simple financial technology RESTful api

### Features
* User can create an account
* Users can fund their account using their bank details
* Users can transfer funds to another user
* Users can add beneficiary (bank to withdraw to)
* Users can withdraw funds to beneficiary

## API Documentation
The Api Documentation for this project can be found on [api documentation](https://documenter.getpostman.com/view/17600868/UUxuiV9r) . 

### Getting started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes

#### Prerequisites
You need to have Mysql, Nodejs, and Npm installed on your local machine

#### Installing
* Clone the repository ```https://github.com/Joshua-onwuzu/fintech-api.git ```
* Navigate to the location of the folder and run ```npm install ``` to install dependencies
* Rename ```.env.example ``` to ```.env ``` 
* Set the .env DB_CONNECTION to mysql
* Set the DB_USER and DB_PASSWORD variables to your mysql username and password
* Create a database in mysql using ``` CREATE DATABASE example ``` and set the DB_DATABASE variable in the .env file to the name of the database
* Run ``` adonis migration:run ``` to save table and column to the database
* Run adonis server --dev to start the server

### Test Bank
Use the following bank details to test the fund, withdrawal, and the add beneficiary endpoints
##### Bank : 057
##### Account_number : 0000000000
##### Otp : 123456


