const nodeEnv = process.env.NODE_ENV;
const googleOAuth2 = require(`./configs/${nodeEnv}/googleOAuth2.json`);
const slack = require(`./configs/${nodeEnv}/slack.json`);
const redis = require(`./configs/${nodeEnv}/redis.json`);

module.exports = {
    nodeEnv, 
    googleOAuth2,
    slack,
    redis,
}