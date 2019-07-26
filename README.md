# Fridge Wizard: Product Recommendation ChatBot

## Overview

This project was developed at the Microsoft Hackathon 2019 by Lowe's and Lowe's Innovation Labs.

For first-time appliance buyers, a customer often does not know what to ask about a product. For instance, terms like "Energy Star Certified" or "standard-depth" vs. "counter-depth" can be confusing for someone who has never purchased a refrigerator before. That is where in-store associates will be of help, but can we bring that in-store associate experience to the website?

From a selection of 560 refrigerators using real data from www.lowes.com, this prototype guides the user through a series of questions to help recommend a refrigerator to first-time buyers. This project is based on the [Microsoft Bot Framework](https://dev.botframework.com) and [NodeJS](https://nodejs.org).

## How to Install

This project depends on NodeJS and a few packages. First install `nodejs` and `npm`.

### Ubuntu

On Ubuntu, this is easy with `apt`:

```bash
sudo apt-get install nodejs npm
```

Note that the Microsoft Bot Framework requires Node.js v10.x or greater. If the package manager installs an older version:

```bash
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Windows

On Windows, [download and install NodeJS](https://nodejs.org/en/download/) from the website.

### Install Dependencies

In `package.json`, there is a list of packages that this project depends on. First, navigate to the project directory where the `package.json` file is. From there, `npm` can install these for you automatically:

```bash
cd LowesChatbotDialog
npm install
```

## How to Run

To launch the web server, use the `npm start` command:

```bash
npm start
```

Now that the bot server is running, you can send and receive messages using the [Microsoft Bot Framework Emulator](https://github.com/microsoft/BotFramework-Emulator) as an interface.

1. [Download and run the emulator](https://github.com/Microsoft/BotFramework-Emulator/releases) to begin a session.
1. Next, select "Open Bot"
1. In the "Bot URL" option, add "http://127.0.0.1:3978/api/messages"
1. Select "Connect"
