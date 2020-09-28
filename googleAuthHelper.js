const configs = require('./configs.js');
const slackHelper = require('./slackHelper.js');
const redisHelper = require('./redisHelper.js');
const { google } = require('googleapis');


class GoogleAuthHelper {
    constructor() {
        this.oAuth2Client = new google.auth.OAuth2(
            configs.googleOAuth2.client_id,
            configs.googleOAuth2.client_secret,
            configs.googleOAuth2.redirect_url
        );

        this.tokenStore = {};
        this.refreshInterval = 45 * 60 * 1000;
        this.intervalFunc = null;
    }

    generateAuthUrl() {
        try {
            const scopes = ['https://www.googleapis.com/auth/androidpublisher'];
            return this.oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: scopes,
                approval_prompt: 'force'
            });
        }
        catch(error) {
            slackHelper.sendMessage(error);
        }
    }

    async getToken(code) {
        const refreshDate = new Date();
        try {
            const { tokens } = await this.oAuth2Client.getToken(code);
            console.log(`[${configs.nodeEnv}:${refreshDate}] - ${this.tokenStore.access_token} -> ${tokens.access_token}`);

            this.oAuth2Client.setCredentials(tokens);
            this.tokenStore = tokens;
            
            redisHelper.publish(tokens.access_token);
            redisHelper.set(tokens.access_token);
        }
        catch(error) {
            slackHelper.sendMessage(error);
        }
    }

    async refreshToken() {
        const refreshDate = new Date();
        try {
            const { tokens } = await this.oAuth2Client.refreshToken(this.tokenStore.access_token);
            console.log(`[${configs.nodeEnv}:${refreshDate}] - ${this.tokenStore.access_token} -> ${tokens.access_token}`);

            this.oAuth2Client.setCredentials(tokens);
            this.tokenStore = tokens;

            redisHelper.publish(tokens.access_token);
            redisHelper.set(tokens.access_token);
        }
        catch(error) {
            slackHelper.sendMessage(`[${configs.nodeEnv}:${refreshDate}] - ${error}`);
        }
    }

    startRefresh() {
        if(this.intervalFunc) {
            clearInterval(this.intervalFunc);
            this.intervalFunc = null;
        }
        
        this.intervalFunc = setInterval(this.refreshToken.bind(this), this.refreshInterval);
        
    }
}

module.exports = new GoogleAuthHelper()