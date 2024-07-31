const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const API_KEY = process.env.SECRET_API_KEY;

exports.handler = async function(event, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: headers
        };
    }

    if (event.httpMethod === 'POST') {
        if (!event.body) {
            return {
                statusCode: 400,
                headers: headers,
                body: JSON.stringify({ error: 'Request body is missing' })
            };
        }

        let data;
        try {
            data = JSON.parse(event.body);
        } catch (error) {
            return {
                statusCode: 400,
                headers: headers,
                body: JSON.stringify({ error: 'Invalid JSON format' })
            };
        }

        if (data.apiKey !== API_KEY) {
            return {
                statusCode: 401,
                headers: headers,
                body: JSON.stringify({ error: 'Unauthorized' })
            };
        };

        const logData = {
            title: data.title,
            message: data.message,
            timestamp: data.timestamp,
            type: data.type
        };

        try {
            await client.connect();
            const database = client.db('CMDR');
            const collection = database.collection('logs');
            const result = await collection.insertOne(logData);
            return {
                statusCode: 201,
                headers: headers,
                body: JSON.stringify({ message: 'Log added', result })
            };
        } catch (error) {
            return {
                statusCode: 500,
                headers: headers,
                body: JSON.stringify({ error: error.message })
            };
        } finally {
            await client.close();
        }
    } else if (event.httpMethod === 'GET') {
        try {
            await client.connect();
            const database = client.db('CMDR');
            const collection = database.collection('logs');
            const logs = await collection.find().toArray();
            return {
                statusCode: 200,
                headers: headers,
                body: JSON.stringify(logs)
            };
        } catch (error) {
            return {
                statusCode: 500,
                headers: headers,
                body: JSON.stringify({ error: error.message })
            };
        } finally {
            await client.close();
        }
    } else {
        return {
            statusCode: 405,
            headers: headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
};
