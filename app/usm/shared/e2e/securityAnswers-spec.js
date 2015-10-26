
var LoginPage = require('../../shared/e2e/loginPage');
var MenuPage = require('../../shared/e2e/menuPage');
var Panel = require('./panel');

describe('Test the panel of changing the Security Answer', function() {
    var menuPage = new MenuPage();
    var loginPage = new LoginPage();

    //Variables panel Change Security answer
    var securityAnswerPanel = new Panel();

    //Test data
    var question1 = 'What is your favourite movie?';
    var answer1 = 'White';
    var question2 = 'What was the name of your first pet?';
    var answer2 = 'Churrina';
    var question3 = 'What was the model of your first car?';
    var answer3 = 'Seat Panda';
    var password = 'password';

    // Methods
    var setChangeSecurityAnswers = function (question1, answer1, question2, answer2, question3, answer3, password) {

        securityAnswerPanel.setSelectValue('challenge1', question1);
        securityAnswerPanel.setFieldValue('response1', answer1);

        securityAnswerPanel.setSelectValue('challenge2', question2);
        securityAnswerPanel.setFieldValue('response2', answer2);

        securityAnswerPanel.setSelectValue('challenge3', question3);
        securityAnswerPanel.setFieldValue('response3', answer3);

        securityAnswerPanel.applyCurrentPassword(password)

    };


    beforeEach(function () {

        loginPage.visit();
        loginPage.login('usm_admin', 'password',"USM-UserManager - (no scope)");

        // select users from menu
        menuPage.clickUsers();


    });

    it('should test change of questions/answers of a user with success', function () {

        //Open the panel
        menuPage.clickChangeSecurityQuestions();

        //Fill out the panel
        setChangeSecurityAnswers(question1, answer1, question2, answer2, question3, answer3, password);

        securityAnswerPanel.clickSaveButtonSuccess();

    });

    it('should test an error message for repeting questions of a user', function () {

        //Open the panel
        menuPage.clickChangeSecurityQuestions();

        //Fill out the panel
        setChangeSecurityAnswers(question1, answer1, question1, answer2, question3, answer3, password);

        securityAnswerPanel.clickSaveButton();

        securityAnswerPanel.getPanelMessage().then(function (name) {
            expect(name).toBe('The same question cannot be used multiple times');
        });

    });

    it('should test an error message for answers shorter than 3 chrs', function () {

        //Open the panel
        menuPage.clickChangeSecurityQuestions();

        //Fill out the panel
        setChangeSecurityAnswers(question1, answer1, question2, 'AA', question3, answer3, password);

        securityAnswerPanel.clickSaveButton();

        securityAnswerPanel.getPanelMessage().then(function (name) {
            expect(name).toBe('setChallenge.response2 is too short (min 3)');
        });

    });

    afterEach(function () {

        loginPage.gotoHome();

        // logout
        menuPage.clickLogOut();

        browser.executeScript('window.sessionStorage.clear();');
        browser.executeScript('window.localStorage.clear();');
    });

});
