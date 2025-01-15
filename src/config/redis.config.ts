import { createClient } from 'redis';

const redisClient = createClient();

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
    console.error('Error connecting to Redis:', err);
});


redisClient
.connect()
.catch((err) => {
    console.error('Redis connection failed:', err);
});

export default redisClient;