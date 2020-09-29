const ioredis = require('ioredis');
const configs = require('./configs.js');

const googleAuthChannel = 'googleAuth';
const accessTokenKey = 'googleAuth';

const refreshTokenKey = 'refreshToken';

class RedisHelper {
    constructor() {
        const { host, port } = configs.redis;
        this.redis = new ioredis({ host, port })
    }

    publish(accessToken) {
        this.redis.publish(googleAuthChannel, accessToken);
    }

    async setAccessToken(accessToken) {
        await this.redis.set(accessTokenKey, accessToken);
    }
    
    async getAccessToken() {
        return await this.redis.get(accessTokenKey);
    }

    async setRefreshToken(refreshToken) {
        await this.redis.set(refreshTokenKey, refreshToken);
    }

    async getRefreshToken() {
        return await this.redis.get(refreshTokenKey);
    }
}

module.exports = new RedisHelper();