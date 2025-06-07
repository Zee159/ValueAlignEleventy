/**
 * Newsletter Subscription API Handler
 * 
 * This is a serverless function that would handle newsletter subscriptions
 * when deployed to a platform like Netlify or Vercel.
 * 
 * For production, this would connect to a database or newsletter service API.
 */

// Example integration with newsletter services
// const mailchimp = require('@mailchimp/mailchimp_marketing');
// const SibApiV3Sdk = require('sib-api-v3-sdk'); // Sendinblue

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }

  try {
    // Parse the incoming request body
    const data = JSON.parse(event.body);
    
    // Validate email
    if (!data.email || !isValidEmail(data.email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          success: false, 
          message: 'Valid email address is required' 
        })
      };
    }

    // In production, you would connect to your newsletter service here
    // Examples for common services:
    
    // 1. Mailchimp Example
    /*
    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMP_API_KEY,
      server: process.env.MAILCHIMP_SERVER_PREFIX
    });

    const listId = process.env.MAILCHIMP_LIST_ID;
    const response = await mailchimp.lists.addListMember(listId, {
      email_address: data.email,
      status: "pending", // Double opt-in
      merge_fields: {
        FNAME: data.firstName || "",
        LNAME: data.lastName || ""
      }
    });
    */

    // 2. SendinBlue / Brevo Example
    /*
    const apiInstance = new SibApiV3Sdk.ContactsApi();
    const apiKey = apiInstance.authentications['apiKey'];
    apiKey.apiKey = process.env.SENDINBLUE_API_KEY;
    
    const createContact = new SibApiV3Sdk.CreateContact();
    createContact.email = data.email;
    createContact.listIds = [parseInt(process.env.SENDINBLUE_LIST_ID)];
    
    await apiInstance.createContact(createContact);
    */

    // 3. Database Example
    /*
    const { Client } = require('pg');
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    await client.connect();
    
    const result = await client.query(
      'INSERT INTO newsletter_subscribers (email, created_at) VALUES ($1, $2) RETURNING id',
      [data.email, new Date()]
    );
    
    await client.end();
    */

    // For now, just simulate successful subscription
    console.log(`Newsletter subscription: ${data.email}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Thank you for subscribing to our newsletter!' 
      })
    };
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        message: 'An error occurred while processing your subscription. Please try again.' 
      })
    };
  }
};

// Email validation helper
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
