const NetlifyAPI = require('netlify')

const client = new NetlifyAPI(process.env.NETLIFY_KEY)

exports.handler = async event => {
    let returnBody;
    const querystring = event.queryStringParameters;
    const email = querystring.email
    const name = querystring.name
    const form_id = '60a6fa5726224000072f2f58'
    const form_submissions = await client.listFormSubmissions({
        form_id: "60a6fa5726224000072f2f58",
    })
    for(let i = 0; i < form_submissions.length; i++) {
      if (form_submissions[i].email == email || form_submissions[i].data.email == email || form_submissions[i].name == name || form_submissions[i].data.name == name || form_submissions[i].data.first_name == name || form_submissions[i].data.last_name == name || form_submissions[i].data.summary == name || form_submissions[i].data.summary == email) {
         returnBody = true;
         break;
     } else {
         returnBody = false;
     }  
    }
    console.log(returnBody);
    return {
        statusCode: 200,
        body: String(returnBody),
    }
}