const { RTMClient, WebClient } = require('@slack/client');
const privateReplies = require('./privateReplies');

const ALERT_CHANNEL_NAME = "server"; // Channel in which to post messages about excessive server disk usage

async function getIdOfChannel(channelName) {
    const token = process.env.SLACK_TOKEN;
    const web = new WebClient(token);
    let channels;
    try {
        const response = await web.channels.list();
        channels = response.channels;
    } catch (error) {
        console.error(error);
        return null;
    }
    
    const alertChannel = channels.find(channel => channel.name === channelName);
    if (alertChannel) {
        return alertChannel.id;
    } else {
        return null;
    }
}

async function setUpBot() {
    const token = process.env.SLACK_TOKEN;
    const alertChannelId = await getIdOfChannel(ALERT_CHANNEL_NAME);
    if (alertChannelId) {
        console.log("[INFO] Found channel in which to post alerts");
    } else {
        console.warn("[WARN] Could not find channel in which to post alerts");
    }

    const rtm = new RTMClient(token);
    rtm.on('message', message => {
        if ( // Skip messages that are from a bot or my own user ID
            (message.subtype && message.subtype === 'bot_message') ||
            (!message.subtype && message.user === rtm.activeUserId)
        ) {
            return;
        }

        if (message.channel === alertChannelId) {

        } else {
            privateReplies.replyMessage(message, rtm);
        }
    });

    rtm.start();
}

setUpBot();