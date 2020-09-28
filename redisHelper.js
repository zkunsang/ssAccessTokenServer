const ioredis = require('ioredis');
const configs = require('./configs.js');

const googleAuthChannel = "googleAuth"

class RedisHelper {
    constructor() {
        const { host, port } = configs.redis;
        this.redis = new ioredis({ host, port })
    }

    publish(refreshToken) {
        this.redis.publish(googleAuthChannel, refreshToken);
    }

    async set(accessToken) {
        await this.redis.set(googleAuthChannel, accessToken);
    }
}

module.exports = new RedisHelper();