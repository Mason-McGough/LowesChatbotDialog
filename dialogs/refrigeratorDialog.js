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

class RefrigeratorDialog extends ComponentDialog {
    constructor(userState) {
        super('refrigeratorDialog');

        this.userProfile = userState.createProperty(USER_PROFILE);

        this.addDialog(new TextPrompt(NAME_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT, this.agePromptValidator));

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.warrantyStep.bind(this),
            this.applianceColorStep.bind(this),
            this.depthTypeStep.bind(this),
            this.summaryStep.bind(this)
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

    async warrantyStep(step) {
        let result = await step.prompt(CHOICE_PROMPT, {
            prompt: 'What kind of warranty would you like?',
            choices: ChoiceFactory.toChoices(['90-day', '2-year', '1-year', '30-day', '2-year limited', '1-year limited'])
        });
        console.log(result);
        console.log(`SELECT * FROM dbo.products WHERE 'warranty' == ${ result }`);
        return result
    }
    
    async applianceColorStep(step) {
        step.values.warranty = step.result.value;
        let result = await step.prompt(CHOICE_PROMPT, {
            prompt: 'What kind of appliance color / finish would you like?',
            choices: ChoiceFactory.toChoices(['Stainless steel', 'Matte black', 'Bisque/Biscuit', 'Custom panel ready', 'Black stainless steel', 'Bronze', 'Matte white', 'Slate', 'Matte black stainless steel', 'White', 'Stainless look', 'Black', 'Red', 'Black slate'])
        });
        console.log(result);
        console.log(`SELECT * FROM dbo.products WHERE 'appliancecolorfinish' == ${ result }`);
        return result
    }

    async depthTypeStep(step) {
        let result = await step.prompt(CHOICE_PROMPT, {
            prompt: 'What kind of depth type would you like?',
            choices: ChoiceFactory.toChoices(['Counter-Depth', 'Standard-Depth'])
        });
        console.log(result);
        console.log(`SELECT * FROM dbo.products WHERE 'depthtype' == ${ result }`);
        return result
    }

    async summaryStep(step) {
        if (step.result) {
            // Get the current profile object from user state.
            const userProfile = await this.userProfile.get(step.context, new UserProfile());

            userProfile.warranty = step.values.warranty;
            console.log(userProfile.warranty);
            // userProfile.transport = step.values.transport;
            // userProfile.name = step.values.name;
            // userProfile.age = step.values.age;

            let msg = `I have ${ userProfile.warranty }.`;
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
