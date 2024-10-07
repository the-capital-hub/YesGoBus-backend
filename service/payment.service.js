import axios from "axios";
import crypto from 'crypto';

const sendRequest = async (url, method, headers, data) => {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await axios({
        method: method,
        url: url,
        headers: headers,
        data: data,
      });
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNRESET' && attempt < 2) {
        console.log(`Network error, retrying... Attempt ${attempt + 1}`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
      } else {
        console.error(`Request failed after ${attempt + 1} attempts:`, error.message);
        throw error; // Re-throw the error if not retryable or max attempts reached
      }
    }
  }
};


function generateId(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export const initiatePayment = async (args) => {
  const merchantTransactionId = generateId(18);
  const merchantUserId = generateId(10);
  const { amount, redirectUrl } = args;

  const payload = {
     "merchantId": process.env.MERCHANT_ID,
    // "merchantId" : "PGTESTPAYUAT",
    //"merchantId": "PGTESTPAYUAT86",
    "merchantTransactionId": merchantTransactionId,
    "merchantUserId": merchantUserId,
    "amount": amount * 100,
    "redirectUrl": redirectUrl,
    "redirectMode": "REDIRECT",
    "callbackUrl": `https://apis.yesgobus.com/api/payment/checkPaymentStatus/${merchantTransactionId}`,
    "paymentInstrument": {
      "type": "PAY_PAGE"
    }
  };

  const payloadString = JSON.stringify(payload);
  const base64Payload = Buffer.from(payloadString).toString('base64');
  const requestData = {
    request: base64Payload
  };

  const apiEndpoint = "/pg/v1/pay";
   const saltKey = process.env.SALT_KEY;
//const saltKey = "96434309-7796-489d-8924-ab56988a6076";
//const saltKey = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
  const saltIndex = process.env.SALT_INDEX;

  const concatenatedData = base64Payload + apiEndpoint + saltKey;
  const sha256Hash = crypto.createHash('sha256');
  const checksum = sha256Hash.update(concatenatedData).digest('hex');
  const xVerify = checksum.toString() + "###" + saltIndex;

  const headers = { 
    accept: "application/json",
    'Content-Type': 'application/json',
    'X-VERIFY': xVerify,
  };

 // const url = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";
   const url = "https://api.phonepe.com/apis/hermes/pg/v1/pay";

  try {
    const response = await sendRequest(url, "POST", headers, requestData);
    console.log('Response:', response);
    return response;
  } catch (error) {
    console.error('Error initiating payment:', error);
    throw error; // Rethrow or handle the error as needed
  }
};


export const checkPaymentStatus = async (args) => {
  const merchantId = process.env.MERCHANT_ID;
  const { merchantTransactionId } = args;
  //const merchantId = "PGTESTPAYUAT86"
  //const saltKey = "96434309-7796-489d-8924-ab56988a6076"
  const requestData = {};
  const apiEndpoint = `/pg/v1/status/${merchantId}/${merchantTransactionId}`;
  const saltKey = process.env.SALT_KEY;
  const saltIndex = process.env.SALT_INDEX;
  const concatenatedData = apiEndpoint + saltKey;
  const sha256Hash = crypto.createHash('sha256');
  const checksum = sha256Hash.update(concatenatedData).digest('hex');
  const xVerify = checksum.toString() + "###" + saltIndex;

  const headers = {
    'Content-Type': 'application/json',
    'X-VERIFY': xVerify,
    'X-MERCHANT-ID': merchantId,
  };
  const url = `https://api.phonepe.com/apis/hermes${apiEndpoint}`;
  //const url = `https://api-preprod.phonepe.com/apis/pg-sandbox${apiEndpoint}`;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await sendRequest(url, "GET", headers, requestData);
      if (response.success) {
        return response;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      if (error.message.includes('TRANSACTION_NOT_FOUND') && attempt < 2) {
        console.log(`Retrying... Attempt ${attempt + 1}`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
      } else {
        throw error; // If it's not a TRANSACTION_NOT_FOUND or last attempt, throw the error
      }
    }
  }
};

//payment refund
export const refundPayment = async (args) => {
  const { amount, merchantTransactionId } = args;
  const newMerchantId = `R${merchantTransactionId}`;
  const payload = {
    "merchantId": process.env.MERCHANT_ID,
    "originalTransactionId": merchantTransactionId,
    "merchantTransactionId": newMerchantId,
    "amount": amount * 100,
    "callbackUrl": "https://webhook.site/callback-url",
  };

  const payloadString = JSON.stringify(payload);
  const base64Payload = Buffer.from(payloadString).toString('base64');
  const requestData = {
    request: base64Payload
  }

  const apiEndpoint = "/pg/v1/refund";
  const saltKey = process.env.SALT_KEY;
  const saltIndex = process.env.SALT_INDEX;

  const concatenatedData = base64Payload + apiEndpoint + saltKey;
  const sha256Hash = crypto.createHash('sha256');
  const checksum = sha256Hash.update(concatenatedData).digest('hex');
  const xVerify = checksum.toString() + "###" + saltIndex;

  const headers = {
    'Content-Type': 'application/json',
    'X-VERIFY': xVerify,
  };
  // const url = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/refund";
  const url = "https://api.phonepe.com/apis/hermes/pg/v1/refund";

  return sendRequest(url, "POST", headers, requestData);
};
