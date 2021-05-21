const NetlifyAPI = require('netlify')

const client = new NetlifyAPI(process.env.NETLIFY_KEY)

exports.handler = async event => {
  const form = await client.listSiteForms({
    site_id: `${process.env.SITE_ID}`,
  })   
  return {
    statusCode: 200,
    body: String(form[0].submission_count),
  }
}
