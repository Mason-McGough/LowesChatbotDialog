// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const restify = require('restify');
const path = require('path');

// Import required bot services. See https://aka.ms/bot-services to learn more about the different part of a bot.
const { BotFrameworkAdapter, ConversationState, MemoryStorage, UserState } = require('botbuilder');

// Import our custom bot class that provides a turn handling function.
const { DialogAndWelcomeBot } = require('./bots/dialogAndWelcomeBot');
const { RefrigeratorDialog } = require('./dialogs/refrigeratorDialog');

// Read environment variables from .env file
const ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE });

// Create the adapter. See https://aka.ms/about-bot-adapter to learn more about using information from
// the .bot file when configuring your adapter.
const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Catch-all for errors.
adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    console.error(`\n [onTurnError]: ${ error }`);
    // Send a message to the user
    await context.sendActivity(`Oops. Something went wrong!`);
    // Clear out state
    await conversationState.delete(context);
};

// Define the state store for your bot.
// See https://aka.ms/about-bot-state to learn more about using MemoryStorage.
// A bot requires a state storage system to persist the dialog and user state between messages.
const memoryStorage = new MemoryStorage();

// Create conversation state with in-memory storage provider.
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);

// Create the main dialog.
const dialog = new RefrigeratorDialog(userState);
const bot = new DialogAndWelcomeBot(conversationState, userState, dialog);

// Create HTTP server.
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log(`\n${ server.name } listening to ${ server.url }.`);
    console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator.`);
});

// Listen for incoming requests.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Route the message to the bot's main handler.
        await bot.run(context);
    });
});

var staticDir = __dirname + '/interface';
console.log(staticDir);
server.get('/*', restify.plugins.serveStatic({
    directory: staticDir,
    default: '/index.html'
}));

server.post('/submit-message', (req, res) => {
    console.log(req.body.text);
    setTimeout(function() {
        var data = {
            text: 'Hi, ' + req.body.text + '!',
            products: [
                { id: 0, title: 'Samsung 4.5-cu ft High Efficiency Stackable Front-Load Washer (Merlot) ENERGY STAR', src: 'https://mobileimages.lowes.com/product/converted/887276/887276250946lg.jpg', price: '$649.00'}, 
                { id: 1, title: 'Samsung 4.5-cu ft High Efficiency Stackable Front-Load Washer (Merlot) ENERGY STAR', src: 'https://mobileimages.lowes.com/product/converted/887276/887276250946lg.jpg', price: '$649.00'}, 
                { id: 2, title: 'Samsung 4.5-cu ft High Efficiency Stackable Front-Load Washer (Merlot) ENERGY STAR', src: 'https://mobileimages.lowes.com/product/converted/887276/887276250946lg.jpg', price: '$649.00'}, 
                { id: 3, title: 'Samsung 4.5-cu ft High Efficiency Stackable Front-Load Washer (Merlot) ENERGY STAR', src: 'https://mobileimages.lowes.com/product/converted/887276/887276250946lg.jpg', price: '$649.00'}, 
                { id: 4, title: 'Samsung 4.5-cu ft High Efficiency Stackable Front-Load Washer (Merlot) ENERGY STAR', src: 'https://mobileimages.lowes.com/product/converted/887276/887276250946lg.jpg', price: '$649.00'}, 
                { id: 5, title: 'Samsung 4.5-cu ft High Efficiency Stackable Front-Load Washer (Merlot) ENERGY STAR', src: 'https://mobileimages.lowes.com/product/converted/887276/887276250946lg.jpg', price: '$649.00'}, 
                { id: 6, title: 'Samsung 4.5-cu ft High Efficiency Stackable Front-Load Washer (Merlot) ENERGY STAR', src: 'https://mobileimages.lowes.com/product/converted/887276/887276250946lg.jpg', price: '$649.00'}
            ]
        }
        res.send(data);
    }, 1000); // setTimeout to create artificial delay
});
