const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

require('events').EventEmitter.defaultMaxListeners = 0;
const web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/CampaignFactory.json');
const compiledCampaign = require('../ethereum/build/Campaign.json');

let accounts;
let factory;
let campaignAdress;
let campaign;



beforeEach(async () => {
    // Get a list of all accounts
    accounts = await web3.eth.getAccounts();
    // Use of the account to deploy the contract
    factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
        .deploy({ data: compiledFactory.bytecode })
        .send({ from: accounts[0], gas: '1000000'});

    await factory.methods.createCampaign('100').send({
        from: accounts[0],
        gas: '1000000'
    });

    [campaignAdress] = await factory.methods.getDeployedCampaigns().call();
    
    campaign = await new web3.eth.Contract(
        JSON.parse(compiledCampaign.interface),
        campaignAdress
    );

});



describe('Campaigns', () => {
    it('deploys a factory and a compaign', () => {
        assert.ok(factory.options.address);
        assert.ok(campaign.options.address);
    });
    it('marks caller as the campaign manager', async () => {
        const manager = await campaign.methods.manager().call();
        assert.equal(manager, accounts[0]);
    });
    it('can contribute and marked as approver', async () => {
        await campaign.methods.contribute().send({
            value:'200', 
            from: accounts[1]
        });
        const isContributor = await campaign.methods.approvers(accounts[1]).call();
        assert(isContributor);
    });

    it('require a minimum contribution', async () => {
        try{
            await campaign.methods.contribute().send({
                value:'100', 
                from: accounts[1]
            });
            throw(false);
        } catch(err) {
            assert(err);
        }
    });    
   
    it('allow manager to make a payment request', async () => {
        await campaign.methods
            .createRequest('battery', '100', accounts[1])
            .send({
                from: accounts[0], 
                gas: '1000000'
            });

        const request = await campaign.methods.requests(0).call();
        assert.equal('battery', request.description);
    });

    it('processes request', async () => {
        await campaign.methods.contribute().send({
            value: web3.utils.toWei('10', 'ether'), 
            from: accounts[0]
        });

        await campaign.methods
            .createRequest('battery', web3.utils.toWei('5', 'ether'), accounts[1])
            .send({
                from: accounts[0], 
                gas: '1000000'
            });

        await campaign.methods.approveRequest(0).send({
            from: accounts[0], 
            gas: '1000000'
        });

        await campaign.methods.finalizeRequest(0).send({
            from: accounts[0], 
            gas: '1000000'
        });

        let balance = await web3.eth.getBalance(accounts[1]);
        balance = web3.utils.fromWei(balance, 'ether');
        balance = parseFloat(balance);

        assert(balance > 104);
    });
});


