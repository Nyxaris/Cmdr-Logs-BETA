const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    const code = event.queryStringParameters.code;
    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;
    const redirectUri = 'YOUR_SITE_URL/.netlify/functions/callback';

    try {
        // Request to receive a token
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri,
            })
        });

        if (!tokenResponse.ok) {
            throw new Error(`Token request failed: ${tokenResponse.statusText}`);
        }

        const tokenData = await tokenResponse.json();

        // Request to receive user data
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
                authorization: `${tokenData.token_type} ${tokenData.access_token}`
            }
        });

        if (!userResponse.ok) {
            throw new Error(`User request failed: ${userResponse.statusText}`);
        }

        const userData = await userResponse.json();

        // Installing a cookie with a token
        return {
            statusCode: 302,
            headers: {
                'Set-Cookie': `access_token=${tokenData.access_token}; Path=/; Secure; SameSite=Lax`,
                'Location': 'YOUR_SITE_URL'
            }
        };
    } catch (error) {
        console.error('Error during OAuth callback:', error);
        return {
            statusCode: 500,
            body: 'Internal Server Error'
        };
    }
};
