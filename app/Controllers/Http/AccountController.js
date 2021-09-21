'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with accounts
 */

const Account = use('App/Models/Account')
const paystackFundHandler = use('./paystackHander/paystackHandler')

const Database = use('Database')
const Hash = use('Hash')
class AccountController {
  /**
   * Show a list of all accounts.
   * GET accounts
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, view }) {
      try{
          const {email, name,password} = request.post();

          if (!email || !name || !password){
              response.status(400);
              return {
                  status : "fail",
                  message : "all basic information required"
              }
          }

          const isEmail = await Account
          .query()
          .where('email', email)
          .orWhereNull('email')
          .first();

          if (isEmail !==null){
              response.status(400);

              return {
                status : "fail",
                message : "email address already exists"
              }
          }
          const userPassword = await Hash.make(password)
              
          const createAccount = await Account.create({
              email : email,
              name  : name,
              password : userPassword,
              account_balance : 0
          })

          return {
            status : "success",
            user_id : createAccount.id,
            message : "account has been created successfully"
          }

      } catch (err) {
        console.log(err)
        response.status(500);
        return {
          status : "fail",
          message : "failed to create account"
        }
    }
   }

  /**
   * Render a form to be used for creating a new account.
   * GET accounts/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async fund ({ request, response, params }) {
    
    try{
      const {amount,bank,account_number,otp} = request.post();
      
      if (!amount || !bank || !account_number || !otp){
        response.status(400);
        return {
            status : "fail",
            message : "all field required"
        }
      }

      const id = await Account.find(params.userId);
      if (id == null){
        response.status(400);
        return {
            status : "fail",
            message : "user not found"
        }
      }

      const userEmail = id?.$attributes.email;
          
      const bankDetail = {
          email : userEmail,
          amount : amount,
          bank :{
              code : bank,
              account_number : account_number
          },
          birthday: "1995-12-23"
      }

      const paystack = await paystackFundHandler(bankDetail,otp)
      
      if (paystack){
          const fundedAmount = paystack.data.amount ;
          const fundedEmail = paystack.data.customer.email ;
          
          response.status(200);
          return {
              status : "success",
              amount : fundedAmount,
              email : fundedEmail,
              message : "successfully funded your account"
          }
      }else {
          response.status(400)
          return {
              status : "fail",
              message : "invalid bank info"
          }
      }
  } catch (err){
      console.log(err)
  }
  }

  /**
   * Create/save a new account.
   * POST accounts
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async transfer ({ request, response, params }) {
    try {
      const {email, amount,password} = request.post();
      
      const id = await Account.find(params.userId);


      const userPassword = id?.$attributes.password ;
      if (!email || !amount || !password){
        response.status(400);
        return {
          status : "fail",
          message : "fill out all neccessary information"
        }
      }
      if(id == null){
        response.status(400)
        return {
            status : "fail",
            message : "invalid user id"
        }
      }
      if (await Hash.verify(password,userPassword)){

        const getBalance = id?.$attributes.account_balance;

        const checkRecieverEmail = await Account
        .query()
        .where('email', email)
        .orWhereNull('email')
        .first();

        if(checkRecieverEmail == null){
          response.status(400)
          return {
              status : "fail",
              message : `can't transfer to non users`
          }
        }

        if(getBalance < amount){
          response.status(400);
          return {
            status : "fail",
            message : "insufficient account"
          }
        }
        const newBalance = parseInt(getBalance)  - parseInt(amount) ;

        

        await Database.table('accounts').where("id",userId).update('account_balance',newBalance)

            const recieverBalance = checkRecieverEmail?.$original.account_balance;

            const newRecieverBal = parseInt(amount)  + parseInt(recieverBalance);
        try{
            
            await Database.table('accounts').where("email",email).update('account_balance',newBalance)
            
            response.status(200);
            return {
                status : "success",
                amount : amount,
                email : email,
                message : `transfer successful`
            }
        } catch(err){
            response.status(500);

            return {
                status : "fail",
                message : "internal server error"
            }
        }
    } else {
        response.status(400);
        return {
            status : "fail",
            message : "incorrect password"
        }
    }

    } catch (err){
        console.log(err)
    }
  }

  /**
   * Display a single account.
   * GET accounts/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async beneficiary ({ params, request, response}) {
    try {
      const {account_number, bank,password} = request.post();

      const id = await Account.find(params.userId);
      if (!account_number || !bank || !password){
        response.status(400);
        return {
          status : "fail",
          message : "fill out all neccessary information"
        }
      }
      if(id == null){
        response.status(400);

        return {
          status : "fail",
          message : "user not found"
        }
      }

      const userPassword = id?.$attributes.password;
      
      const isSame = await Hash.verify(password, userPassword);
      console.log(isSame)
      if (isSame) {
          
          await Database.table('accounts').where("id",params.userId).update('account_number',account_number)
          
          await Database.table('accounts').where("id",params.userId).update('bank',bank)
          response.status(200)
          return {
              status : "success",
              account_name : bank,
              account_number : account_number,
              message : "successfully added beneficiary"
          }
        } else {
            response.status(400);
            return {
                status : "fail",
                message : "incorrect password"
            }
        }
  } catch (err){
      console.log(err)
  }
  }

  /**
   * Render a form to update an existing account.
   * GET accounts/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async withdrawal ({ params, request, response }) {
    const id = await Account.find(params.userId);

    const {amount, password} = request.post();
    if (id == null){
      response.status(400);
      return {
          status : "fail",
          message : "user not found"
      }
    }
    const userPassword = id?.$attributes.password;

    const userName = id?.$attributes.name;
    if(!amount || !password){
      response.status(400);
      return {
          status : "fail",
          message : "amount and password required"
      }
    }
    if (await Hash.verify(userPassword, password)){

      const userBalance = id?.$attributes.account_balance ;
      if(userBalance < amount){
        response.status(400);
        return {
            status : "fail",
            message : "insufficient account balance"
        }
      }
      const userAccount = id?.$attributes.account_number ;

      const userBank = id?.$attributes.bank ;

      const userEmail = id?.$attributes.email ;
      if (userAccount == null){
        response.status(400);
        return {
            status : "fail",
            message : "user beneficiary account not found"
        }
      }
      const paystack = await paystackTransferHandler(userName, userAccount,userBank, amount);

      if(paystack){
          return {
              status : "success",
              account : userAccount,
              email : userEmail,
              amount : amount,
              message : "transaction pending"
          }
      } else{
          response.status(400);
          return{
              status : "fail",
              message : "could not resolve account"
          }
      }

    } else {
        response.status(400);
        return {
            status : "fail",
            message : "Incorrect password"
        }
    }
  }

  /**
   * Update account details.
   * PUT or PATCH accounts/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async notification ({ request, response }) {
    const event = request.post().event

    if(event == "transfer.success"){
        try{
          const userName = request.post().data.recipient.name
          const amount = request.post().data.amount
          const userData = await Account
          .query()
          .where('name', userName)
          .orWhereNull('name')
          .first();
          const userBalance =  userData?.$attributes.account_balance
           
          const newBalance = parseInt(userBalance) - parseInt(amount) ;
          
          await Database.table('accounts').where("name",userName).update('account_balance',newBalance);
          
          response.status(200)
        } catch (err){
          console.log(err)
        }

    }

    if(event == "charge.success"){
        try{
          response.status(200)
          const userEmail = request.post().data.customer.email
          
          const userData = await Account
          .query()
          .where('email', userEmail)
          .orWhereNull('email')
          .first();
          const amount = request.post().data.amount
          
          const userBalance =  userData?.$attributes.account_balance ; 
          
          const newBalance = parseInt(userBalance) + parseInt(amount) ;

          await Database.table('accounts').where("email",userEmail).update('account_balance',newBalance)
          
        }catch (err){
          console.log(err);
        }
    }
  }

  /**
   * Delete a account with id.
   * DELETE accounts/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */

}

module.exports = AccountController
