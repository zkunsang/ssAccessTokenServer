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

        // 45 * 60 * 1000
        this.tokenStore = {};
        this.refreshInterval = configs.app.refreshInterval;
        this.intervalFunc = null;
        this.refresh_token = null;
        this.access_token = null;
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
            console.log(`[${configs.nodeEnv}:${refreshDate}]${tokens.access_token}`);

            this.oAuth2Client.setCredentials(tokens);

            if(tokens.refresh_token) {
                this.refresh_token = tokens.refresh_token;
                redisHelper.setRefreshToken(this.refresh_token);
            }
            
            this.access_token = tokens.access_token;

            redisHelper.publish(this.access_token);
            redisHelper.setAccessToken(this.access_token);
        }
        catch(error) {
            slackHelper.sendMessage(error);
        }
    }

    async refreshToken() {
        const refreshDate = new Date();
        try {
            const { tokens } = await this.oAuth2Client.refreshToken(this.refresh_token);
            console.log(`[${configs.nodeEnv}][${refreshDate}][${this.refresh_token}] - ${this.access_token} -> ${tokens.access_token}`);

            this.oAuth2Client.setCredentials(tokens);
            this.access_token = tokens.access_token;

            redisHelper.publish(this.access_token);
            redisHelper.setAccessToken(this.access_token);
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

    async init() {
        this.refresh_token = await redisHelper.getRefreshToken();
        this.access_token = await redisHelper.getAccessToken();

        if(!this.refresh_token || !this.access_token) {
            slackHelper.sendMessage(`[${configs.nodeEnv}][${new Date()}] - need auth request`);
            return;
        }

        this.startRefresh();
    }
}

module.exports = new GoogleAuthHelper()