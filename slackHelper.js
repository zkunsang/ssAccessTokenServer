const configs = require('./configs');
const { IncomingWebhook } = require('@slack/webhook');


class SlackHelper {
    constructor() {
        this.slackConfig = configs.slack;
        this.webhook = new IncomingWebhook(this.slackConfig.webhookUrl);
    }

    async ready() {
        
    }

    sendMessage(message) {
        if (!this.slackConfig.useSlack) return;
        try {
            this.webhook.send(`[${process.env.NODE_ENV}]\n${message}`)
        }
        catch (err) {
            console.error('slack error', err);
        }
    }
}

module.exports = new SlackHelper();
