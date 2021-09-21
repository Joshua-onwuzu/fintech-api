const axios = use('axios');



const paystackTransferHandler = async (userName,userAccount,userBank,amount)=>{
    try{
        const userData = {
            type : "nuban",
            name : userName,
            account_number : userAccount,
            bank_code : userBank,
            currency : "NGN"
         }
        const paystackResponse = await axios.post('https://api.paystack.co/transferrecipient',userData,{headers});
        
        const recipientId = paystackResponse.data.data.recipient_code ;
        const transferData = {
            source: "balance", 
            reason: "withdrawal", 
            amount : amount, 
            recipient : recipientId

        }
        try {

            const transferResponse = await axios.post('https://api.paystack.co/transfer',transferData,{headers});

            return transferResponse.data
            
        } catch (err) {
            console.log(err.data)
        }

        
    } catch (err){
        console.log(err.data)
    }
}

module.exports = paystackTransferHandler ;