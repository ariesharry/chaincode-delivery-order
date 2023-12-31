const express = require('express');
const router = express.Router();
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const { buildCCPOrg1, buildCCPOrg2, buildWallet, prettyJSONString } = require('../../../../test-application/javascript/AppUtil.js');

const CONFIG = {
    channel: 'mychannel',
    chaincode: 'delivery-order',
    // func: 'AddFarmProfile',
    // evaluate: 'QueryFarmProfile',
    walletPaths: {
        Org1: '../../wallet/org1',
        Org2: '../../wallet/org2'
    }
};

async function invokeChaincode(org, user, func, args) {
    const ccp = org === 'Org1' ? buildCCPOrg1() : buildCCPOrg2();
    const walletPath = path.join(__dirname, CONFIG.walletPaths[org]);
    const wallet = await buildWallet(Wallets, walletPath);
    const gateway = new Gateway();

    try {
        await gateway.connect(ccp, {
            wallet,
            identity: user,
            discovery: { enabled: true, asLocalhost: true }
        });

        const network = await gateway.getNetwork(CONFIG.channel);
        const contract = network.getContract(CONFIG.chaincode);

        const result = await contract.submitTransaction(func, args);
        return { success: true, message: "Transaction executed successfully" };

    } finally {
        gateway.disconnect();
    }
}

router.post('/', async (req, res, next) => {
    const { org, user, func, args } = req.body;
    
     // Check if the function being called is 'RequestDO' and stringify the argument
     if (func === 'RequestDO' && args && args.length > 0) {
        try {
            args[0] = JSON.stringify(args[0]);
        } catch (e) {
            return res.status(400).json({ error: "Failed to stringify request details." });
        }
    }

    // Check if the function being called is 'AddFarmer' or 'UpdateFarmer' and handle the farms attribute
    if ((func === 'AddFarmer' || func === 'UpdateFarmer') && args && args.length > 6) {
        try {
            args[6] = JSON.stringify(args[6]);
        } catch (e) {
            return res.status(400).json({ error: "Failed to stringify farms attribute." });
        }
    }

    // Check if the function being called is 'AddCollector' or 'UpdateCollector' and handle the farms attribute
    if ((func === 'AddCollector' || func === 'UpdateCollector') && args && args.length > 8) {
        try {
            args[8] = JSON.stringify(args[8]);
        } catch (e) {
            return res.status(400).json({ error: "Failed to stringify farms attribute." });
        }
    }

    if ((func === 'Process' || func === 'Process') && args && args.length > 5) {
        try {
            args[3] = JSON.stringify(args[3]);
        } catch (e) {
            return res.status(400).json({ error: "Failed to stringify farms attribute." });
        }
    }

    try {
        const result = await invokeChaincode(org, user, func, args);
        res.json({ result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
