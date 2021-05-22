const NetlifyAPI = require('netlify')

const client = new NetlifyAPI(process.env.NETLIFY_KEY)

exports.handler = async event => {
    const comments = await client.listFormSubmissions({
        form_id: '60a9524a3c519d00078231f6',
    }) 

    const comments_json = JSON.stringify(comments);

    return {
        statusCode: 200,
        body: comments_json,
    }
} 
