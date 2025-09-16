// netlify/functions/api.js
exports.handler = async (event, context) => {
  const url = `https://inventory-management-sbm.up.railway.app${event.path.replace('/.netlify/functions/api', '')}`;
  
  try {
    const response = await fetch(url, {
      method: event.httpMethod,
      headers: event.headers,
      body: event.body
    });
    
    const data = await response.text();
    return {
      statusCode: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: data
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({error: 'Server error'})
    };
  }
};