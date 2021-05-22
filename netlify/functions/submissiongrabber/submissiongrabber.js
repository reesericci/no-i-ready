const NetlifyAPI = require('netlify')

const client = new NetlifyAPI(process.env.NETLIFY_KEY)

let submission_count;

exports.handler = async event => {
  const form = await client.listSiteForms({
    site_id: `${process.env.SITE_ID}`,
  })   
  for(let i = 0; i < form.length; i++) {
    if(form[i].id == "60a6fa5726224000072f2f58") {
      submission_count = form[i].submission_count;
      break;
    }
  } 
  console.log(submission_count);
  
  return {
    statusCode: 200,
    body: String(submission_count),
  }
}
