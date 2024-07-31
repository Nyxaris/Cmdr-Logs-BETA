const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    const cookies = event.headers.cookie;
    if (!cookies) {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: 'Unauthorized' })
        };
    }

    const token = cookies.split('; ').find(row => row.startsWith('access_token'));
    if (!token) {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: 'Unauthorized' })
        };
    }

    const accessToken = token.split('=')[1];

    try {
        const response = await fetch('https://discord.com/api/users/@me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Invalid token');
        }

        const userData = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify(userData)
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 401,
            body: JSON.stringify({ error: 'Unauthorized' })
        };
    }
};
