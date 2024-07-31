const fetch = require('node-fetch');

const STAFF_IDS = process.env.STAFF_IDS.split(',');

exports.handler = async function (event, context) {
    const token = event.headers.authorization && event.headers.authorization.split(' ')[1];

    if (!token) {
        return {
            statusCode: 403,
            body: JSON.stringify({ message: 'Forbidden' })
        };
    }

    try {
        const response = await fetch('https://discord.com/api/users/@me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            return {
                statusCode: 403,
                body: JSON.stringify({ message: 'Forbidden' })
            };
        }

        const userData = await response.json();

        if (!STAFF_IDS.includes(userData.id)) {
            return {
                statusCode: 403,
                body: JSON.stringify({ message: 'Forbidden' })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Authorized' })
        };

    } catch (error) {
        console.error('Error checking token:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' })
        };
    }
};
