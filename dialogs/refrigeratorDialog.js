// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const {
    ChoiceFactory,
    ChoicePrompt,
    ComponentDialog,
    ConfirmPrompt,
    DialogSet,
    DialogTurnStatus,
    NumberPrompt,
    TextPrompt,
    WaterfallDialog
} = require('botbuilder-dialogs');

//Dependencies for adaptive cards
const {
    CardFactory
} = require('botbuilder');

const { SpecsFilterer } = require('../specsFilterer');

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

const REFRIGERATOR_DIALOG = 'refrigeratorDialog';

class RefrigeratorDialog extends ComponentDialog {
    constructor(userState) {
        super(REFRIGERATOR_DIALOG);
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));

        this.continueOption = 'Continue';
        this.doneOption = 'Done';
        this.helpOption = 'Help';
        this.specsOptions = [
            'Price', 
            'Color/Finish', 
            'Energy Star', 
            'Capacity', 
            'Water Filtration', 
            'Depth Type',
            'Warranty'
        ];
        this.maxIterations = 2;

        this.previousSpec = '';
        this.done = false;
        this.specsFilterer = new SpecsFilterer();

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.selectionStep.bind(this),
            this.loopStep.bind(this),
            this.getStep.bind(this),
            this.confirmStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;

        this.reset();
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */

    
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async reset() {
        this.availableOptions = this.specsOptions.slice();
        this.specHistory = {};
        this.done = false;
    }

    async selectionStep(step) {
        if (this.done) {
            this.reset();
        }

        const list = Object.keys(this.specHistory);
        this.availableOptions = this.availableOptions.filter(item => item !== list[list.length - 1]);

        let message = '';
        if (list.length === 0) {
            message = `Great! Finding the right refrigerator can be difficult. I can help with that.
            \r\n Pick a feature below that matters to you and I'll ask you a few questions to find the perfect fridge for you.`;
        } else {
            await step.context.sendActivities([
                { type: 'typing' },
                { type: 'delay', value: 2000 }
                ]);
            message = `Great choice! What else matters to you?`;
        }

        return await step.prompt(CHOICE_PROMPT, {
            prompt: message,
            retryPrompt: 'Please choose an option from the list.',
            choices: this.availableOptions
        });
    }

    async loopStep(step) {
        var result = step.result.value
        if (result !== this.doneOption) {
            this.previousSpec = result;
        } 
        
        if (result === 'Price') {
            return await this.priceStep(step);
        } else if (result === 'Color/Finish') {
            return await this.applianceColorStep(step);
        } else if (result === 'Energy Star') {
            return await this.energyStep(step);
        } else if (result === 'Water Filtration') {
            return await this.waterFilterStep(step);
        } else if (result === 'Capacity') {
            return await this.applicanceCapacityStep(step);
        } else if (result === 'Depth Type') {
            return await this.depthTypeStep(step);
        } else if (result === 'Warranty') {
            return await this.warrantyStep(step);
        } else if (result === this.doneOption) {
            this.done = true;
            return await this.getStep(step);
        } else {
            console.log('W H A T');
        }
    }

    async getStep(step) {
        const list = Object.keys(this.specHistory);
        const choice = step.result;

        this.specHistory[this.previousSpec] = choice.value;
        
        if (!this.done) {
            list.push(this.previousSpec);
        }
        
        if (list.length === this.specsOptions.length) {
            step.context.sendActivity({
                text: 'Looks like I am out of questions! I will go ahead and find a product for you.'
            });
            this.done = true;
            return await this.endStep(step);
        } else if (this.done || list.length >= this.maxIterations) {
            await step.context.sendActivities([
                { type: 'typing' },
                { type: 'delay', value: 2500 }
            ]);
            
            // If they're done, exit and return their list.
            return await step.prompt(CHOICE_PROMPT, {
                prompt: `Thank you. I\'ve got all the info I need to make a recommendation. \r\n Select "${this.doneOption}" if you\'re ready for your personalized fridge selection or "${this.continueOption}" to pick more features.`,
                retryPrompt: 'Please choose an option from the list.',
                choices: [this.continueOption, this.doneOption]
            });
        } else {
            // Otherwise, repeat this dialog, passing in the list from this iteration.
            return await step.replaceDialog(REFRIGERATOR_DIALOG, list);
        }
    }

    async confirmStep(step) {
        const list = Object.keys(this.specHistory);
        const choice = step.result.value;
        if (choice === this.continueOption) {
            this.done = false;
            return await step.replaceDialog(REFRIGERATOR_DIALOG, list);
        } else {
            this.done = true;
            return await this.endStep(step);
        }
    }

    async endStep(step) {
        this.specsFilterer.filterSpecs(this.specHistory);

        await step.context.sendActivities([
            {  type: 'typing' },
            { type: 'delay', value: 500 },
            { type: 'message', text: 'Beep boop... now finding your perfect frigid friend...' },
            { type: 'typing' },
            { type: 'delay', value: 4000 },
        ]);

        console.log(this.specHistory);
        if (this.specsFilterer.selectedProducts.length > 0) {
            var selectedProduct = await this.randomSampleProduct();
            var myCard = this.createACard(selectedProduct);
            step.context.sendActivity({
                text: 'Thanks for coming! Here is your recommended refrigerator:',
                attachments: [CardFactory.adaptiveCard(myCard)]
            });
        } else {
            step.context.sendActivity('Sorry, but no products matched your query.');
        }
        return await step.endDialog();
    }

    createACard(product) {
         return {    
            "type": "AdaptiveCard",
            "version": "1.0",
            "body": [
                {
                    "type": "ColumnSet",
                    "columns": [
                        {
                            "type": "Column",
                            "width": 2,
                            "items": [
                                {
                                    "type": "TextBlock",
                                    "weight": "bolder",
                                    "text": product.title
                                    
                                },
                                {
                                    "type": "TextBlock",
                                    "text": `$ ${product.price}`
                                },
                                {
                                    "type": "TextBlock",
                                    "text": product.url
                                }
                            ]
                        },
                        {
                            "type": "Column",
                            "width": 2,
                            "items": [
                                {
                                    "type": "Image",
                                    "url": product.img_url
                                }
                            ]
                        }
                    ]
                }
            ],
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json"
        }
    }

    async randomSampleProduct() {
        var randIdx = Math.floor(Math.random() * this.specsFilterer.selectedProducts.length);
        return this.specsFilterer.selectedProducts[randIdx];
    }

    async priceStep(step) {
        let result = await step.prompt(CHOICE_PROMPT, {
            prompt: "What is your price range for a new fridge?",
            choices: ChoiceFactory.toChoices(['Less than $500', '$500-$1000', '$1000-$2000', '$2000-$4000', '$4000+'])
        });
        return result
    }
    
    async energyStep(step) {
        let result = await step.prompt(CHOICE_PROMPT, {
            prompt: "Would you like your new fridge to be ENERGY STAR certified?",
            choices: ChoiceFactory.toChoices(['Yes', 'No'])
        });
        return result
    }

    async waterFilterStep(step) {
        let result = await step.prompt(CHOICE_PROMPT, {
            prompt: "Would you like your fridge to have built-in water filtration?",
            choices: ChoiceFactory.toChoices(['Yes', 'No', 'What is this?'])
        });
        return result;
    }

    async warrantyStep(step) {
        let result = await step.prompt(CHOICE_PROMPT, {
            prompt: 'What kind of warranty would you like?',
            choices: ChoiceFactory.toChoices([ '30-day', '90-day', '2-year', '1-year', '2-year limited', '1-year limited'])
        });
        return result
    }
    
    async applianceColorStep(step) {
        let result = await step.prompt(CHOICE_PROMPT, {
            prompt: 'What kind of appliance color / finish would you like?',
            choices: ChoiceFactory.toChoices(['Stainless steel', 'Matte black', 'Bisque/Biscuit', 'Custom panel ready', 'Black stainless steel', 'Bronze', 'Matte white', 'Slate', 'Matte black stainless steel', 'White', 'Stainless look', 'Black', 'Red', 'Black slate'])
        });
        return result
    }

    async applicanceCapacityStep(step) {
        let result = await step.prompt(CHOICE_PROMPT, {
            prompt: 'What capacity range would you like for your fridge?',
            choices: ChoiceFactory.toChoices(['5-8 cu ft', '8-12 cu ft', '12-16 cu ft', '16-20 cu ft', '20 cu ft +'])
        });
        return result
    }

    async depthTypeStep(step) {
        let result = await step.prompt(CHOICE_PROMPT, {
            prompt: 'What kind of depth type would you like?',
            choices: ChoiceFactory.toChoices(['Counter-Depth', 'Standard-Depth'])
        });
        return result
    }
}

module.exports.RefrigeratorDialog = RefrigeratorDialog;
