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
const { UserProfile } = require('../userProfile');

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const NAME_PROMPT = 'NAME_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
const USER_PROFILE = 'USER_PROFILE';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

const REFRIGERATOR_DIALOG = 'refrigeratorDialog';

class RefrigeratorDialog extends ComponentDialog {
    constructor(userState) {
        super(REFRIGERATOR_DIALOG);

        this.userProfile = userState.createProperty(USER_PROFILE);

        this.addDialog(new TextPrompt(NAME_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT, this.agePromptValidator));

        this.previousSpec = '';
        this.specHistory = {};
        this.doneOption = 'Done';
        this.specsSelected = 'value-specsSelected';
        this.specsOptions = [
            'Price', 
            'Color/Finish', 
            'Energy Star', 
            'Capacity', 
            'Water Filtration', 
            'Depth Type',
            'Warranty',
            'Help'
        ];
        this.specsOptions.push(this.doneOption);
        this.maxIterations = 3;

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.selectionStep.bind(this),
            this.loopStep.bind(this),
            this.getStep.bind(this),
            this.confirmStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
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

    async selectionStep(step) {
        const list = Array.isArray(step.options) ? step.options : [];
        step.values[this.specsSelected] = list;

        let message = '';
        if (list.length === 0) {
            message = `Choose an option, or \`${ this.doneOption }\` to finish.`;
        } else {
            message = `Anything else? (Choose \`${ this.doneOption }\` to finish.)`;
        }

        this.specsOptions = this.specsOptions.filter(item => item !== list[list.length - 1]);

        return await step.prompt(CHOICE_PROMPT, {
            prompt: message,
            retryPrompt: 'Please choose an option from the list.',
            choices: this.specsOptions
        });
    }

    async loopStep(step) {
        this.previousSpec = step.result.value;
        if (this.previousSpec === 'Price') {
            return await this.priceStep(step);
        } else if (this.previousSpec === 'Color/Finish') {
            return await this.applianceColorStep(step);
        } else if (this.previousSpec === 'Energy Star') {
            return await this.energyStep(step);
        } else if (this.previousSpec === 'Water Filtration') {
            return await this.waterFilterStep(step);
        } else if (this.previousSpec === 'Capacity') {
            return await this.applicanceCapacityStep(step);
        } else if (this.previousSpec === 'Depth Type') {
            return await this.depthTypeStep(step);
        } else if (this.previousSpec === 'Warranty') {
            return await this.warrantyStep(step);
        } else {
            console.log('W H A T');
        }
    }

    async getStep(step) {
        const list = step.values[this.specsSelected];
        const choice = step.result;
        const done = choice.value === this.doneOption;
        this.specHistory[this.previousSpec] = choice.value;
        
        if (!done) {
            list.push(this.previousSpec);
        }

        if (done || list.length >= this.maxIterations) {
            // If they're done, exit and return their list.
            return await step.prompt(CHOICE_PROMPT, {
                prompt: 'Thank you. Here are some products I found using the answers you provided. Would you like to continue?',
                retryPrompt: 'Please choose an option from the list.',
                choices: ['Continue', 'I\'m done']
            });
        } else {
            // Otherwise, repeat this dialog, passing in the list from this iteration.
            return await step.replaceDialog(REFRIGERATOR_DIALOG, list);
        }
    }

    async confirmStep(step) {
        const list = step.values[this.specsSelected];
        const choice = step.result.value;
        if (choice === 'Continue') {
            return await step.replaceDialog(REFRIGERATOR_DIALOG, list);
        } else {
            return await this.endStep(step);
        }
    }

    async endStep(step) {
        step.context.sendActivity('Thanks for coming!');
        return await step.endDialog();
    }

    async priceStep(step) {
        let result = await step.prompt(CHOICE_PROMPT, {
            prompt: "What is your price range for a new fridge?",
            choices: ChoiceFactory.toChoices(['Less than $500', '$500-$1000', '$1000-$2000', '$2000-$4000', '$400+'])
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

    async summaryStep(step) {
        if (step.result) {
            // Get the current profile object from user state.
            const userProfile = await this.userProfile.get(step.context, new UserProfile());

            userProfile.price = step.values.price;
            console.log(userProfile.price);
            userProfile.energyStar = step.values.energyStar;
            console.log(userProfile.energyStar);
            userProfile.color = step.values.color;
            console.log(userProfile.color);
            userProfile.filter = step.values.filters;
            console.log(userProfile.filter);
            userProfile.depth = step.values.depth;
            console.log(userProfile.depth);
            userProfile.capacity = step.values.capacity;

            // userProfile.transport = step.values.transport;
            // userProfile.name = step.values.name;
            // userProfile.age = step.values.age;

            let msg = `I have ${ userProfile.price } as your price range  \r\n ${ userProfile.color } as your selected color, and ${ userProfile.depth } as your depth. \r\n You said ${ userProfile.energyStar } to Energy Star certification. Your chosen capacity is: ${ userProfile.capacity }`;
            // let msg = `I have ${ userProfile.transport }, ${ userProfile.name } and ${ userProfile.age }.`;

            await step.context.sendActivity(msg);
        } else {
            await step.context.sendActivity('Thanks. Your profile will not be kept.');
        }

        // WaterfallStep always finishes with the end of the Waterfall or with another dialog, here it is the end.
        return await step.endDialog();
    }

    async agePromptValidator(promptContext) {
        // This condition is our validation rule. You can also change the value at this point.
        return promptContext.recognized.succeeded && promptContext.recognized.value > 0 && promptContext.recognized.value < 150;
    }
}

module.exports.RefrigeratorDialog = RefrigeratorDialog;
