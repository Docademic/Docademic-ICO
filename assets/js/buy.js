/*const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/JoIGnMxHRlKZg956R086"));*/

const tokenAddress = "0xcd49A2c2FdB583647e48f61a2682864fA364D072";
const multiSigAddress = "0x0BB7D8331defC91494689dB93cDA8C325AFe3077";
const crowdSaleAddress = "0x23022508519EA24bCbBa4326992B095ABEC7c23d";
const contributors = new Set();
class Buy{
	
	constructor(web3, test) {
		this.test = test;
		this.web3 = web3;
		let version = web3.version.api;
		console.log(version); // "0.2.0"
		this.TokenContract = this.web3.eth.contract(TokenABI);
		this.token = this.TokenContract.at(tokenAddress);
		this.MultiSigContract = this.web3.eth.contract(MultiSigABI);
		this.multiSig = this.MultiSigContract.at(multiSigAddress);
		this.CrowdSaleContract = this.web3.eth.contract(CrowdSaleABI);
		this.crowdSale = this.CrowdSaleContract.at(crowdSaleAddress);
	}
	
	checkNetwork(cb) {
		this.web3.version.getNetwork((err, netId) => {
			let ok = false;
			if(netId === "1") ok = true;
			if(this.test) ok = !ok;
			cb(ok);
		})
	}
	
	getMTCBalance(cb){
		this.token.allowance(multiSigAddress, crowdSaleAddress,(error,result)=> {
			cb(error,result);
		});
	}
	
	watchMultiSigTransactionExecution(cb){
		let success = this.multiSig.Execution({},{fromBlock: 0, toBlock: 'latest'});
		let failure = this.multiSig.ExecutionFailure({},{fromBlock: 0, toBlock: 'latest'});
		success.watch(function(error, result){
			cb(error,result,"success");
		});
		failure.watch(function(error, result){
			cb(error,result,"failure");
		});
	}
	
	watchCrowdSaleFound(cb){
		let event = this.crowdSale.FundTransfer({},{fromBlock: 0, toBlock: 'latest'});
		event.watch(function(error, result){
			cb(error,result);
		});
	}
	
	printHexData(){
		console.log("Hex Data");
		let call = this.web3.sha3("approve(address,uint256)").substr(0,10);
		
		let to = this.paddingLeft("0x23022508519EA24bCbBa4326992B095ABEC7c23d".substr(2),'0',64);
		let amount = this.paddingLeft(this.web3.toHex(this.web3.toWei('350000000','finney')).substr(2),'0',64).toUpperCase();
		
		console.log(call);
		console.log(to);
		console.log(amount);
		console.log(call+to+amount);
	}
	
	paddingLeft(string,character, padding){
		while(string.length<padding){
			string = character+string;
		}
		return string;
	}
	
	buyMTC() {
		this.web3.eth.sendTransaction({
			to: crowdSaleAddress,
			value: this.web3.toWei('1.5','ether')
		},(err, results) => {
			console.log("BOUGHT");
			if(err)console.error(err);
			console.log(results);
		});
	}
	
}

window.addEventListener("load", function () {
	
	if (typeof web3 !== 'undefined') {
		let web = new Web3(web3.currentProvider);
		let buy = new Buy(web,true);
		//buy.printHexData();
		buy.checkNetwork(ok => {console.log(ok)});
		buy.getMTCBalance((e,r) => {
			let balance = web.fromWei(r,'finney');
			let initialSupply = web.toBigNumber(350000000);
			let sold = initialSupply.sub(balance);
			web.eth.getBalance(crowdSaleAddress,(e,re) => {
				console.log("BALANCE");
				console.log(web.fromWei(re,'ether').toString(10)+" eth");
				console.log(balance.toString(10)+ " tokens left");
				console.log(sold.toString(10)+ " tokens sold");
			});
			
		});
		/*buy.watchMultiSigTransactionExecution((err,results,type) => {
			console.log("EXECUTION "+ type);
			if(err)console.error(err);
			console.log(results);
		})*/
		buy.watchCrowdSaleFound((err,results) => {
			console.log("Found");
			if(err)console.error(err);
			let args = results.args;
			let eth = web.fromWei(args.amount,'ether');
			contributors.add(args.backer);
			console.log(args.backer + " " + eth.toString(10) + " eth");
		});
		setTimeout(()=> {
			console.log("Contributors");
			console.log(contributors);
		},5000)
		buy.buyMTC();
	} else {
		alert('No MetaMask user? You should consider trying MetaMask!')
		//window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
	}
	
	// Now you can start your app & access web3 freely:
	//startApp()
});

const TokenABI = [
	{
		"constant": false,
		"inputs": [
			{
				"name": "_spender",
				"type": "address"
			},
			{
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_from",
				"type": "address"
			},
			{
				"name": "_to",
				"type": "address"
			},
			{
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_spender",
				"type": "address"
			},
			{
				"name": "_subtractedValue",
				"type": "uint256"
			}
		],
		"name": "decreaseApproval",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_owner",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"name": "balance",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_to",
				"type": "address"
			},
			{
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_spender",
				"type": "address"
			},
			{
				"name": "_addedValue",
				"type": "uint256"
			}
		],
		"name": "increaseApproval",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_owner",
				"type": "address"
			},
			{
				"name": "_spender",
				"type": "address"
			}
		],
		"name": "allowance",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "spender",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	}
];
const MultiSigABI = [ { "constant": true, "inputs": [ { "name": "", "type": "uint256" } ], "name": "owners", "outputs": [ { "name": "", "type": "address", "value": "0x1a243fb648e173bd8408d97e727f1ff694ba0d5c" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "dailySpent", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "owner", "type": "address" } ], "name": "removeOwner", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "transactionId", "type": "uint256" } ], "name": "revokeConfirmation", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" } ], "name": "isOwner", "outputs": [ { "name": "", "type": "bool", "value": false } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "uint256" }, { "name": "", "type": "address" } ], "name": "confirmations", "outputs": [ { "name": "", "type": "bool", "value": false } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "ethDailyLimit", "outputs": [ { "name": "", "type": "uint256", "value": "1000000000000000000" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "pending", "type": "bool" }, { "name": "executed", "type": "bool" } ], "name": "getTransactionCount", "outputs": [ { "name": "count", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "transactionId", "type": "uint256" } ], "name": "getTransactionDescription", "outputs": [ { "name": "description", "type": "string", "value": "" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "lastDay", "outputs": [ { "name": "", "type": "uint256", "value": "17526" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "owner", "type": "address" } ], "name": "addOwner", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "transactionId", "type": "uint256" } ], "name": "isConfirmed", "outputs": [ { "name": "", "type": "bool", "value": false } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "transactionId", "type": "uint256" } ], "name": "getConfirmationCount", "outputs": [ { "name": "count", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "uint256" } ], "name": "transactions", "outputs": [ { "name": "destination", "type": "address", "value": "0x0000000000000000000000000000000000000000" }, { "name": "value", "type": "uint256", "value": "0" }, { "name": "data", "type": "bytes", "value": "0x" }, { "name": "description", "type": "string", "value": "" }, { "name": "executed", "type": "bool", "value": false } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getOwners", "outputs": [ { "name": "", "type": "address[]", "value": [ "0x1a243fb648e173bd8408d97e727f1ff694ba0d5c", "0x722bb9880e2011f4fc462731c038ff4555bd4b45", "0x4b07b99da4be0ef707e1c868a75f389785f28ebb" ] } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "from", "type": "uint256" }, { "name": "to", "type": "uint256" }, { "name": "pending", "type": "bool" }, { "name": "executed", "type": "bool" } ], "name": "getTransactionIds", "outputs": [ { "name": "_transactionIds", "type": "uint256[]", "value": [] } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "transactionId", "type": "uint256" } ], "name": "getConfirmations", "outputs": [ { "name": "_confirmations", "type": "address[]", "value": [] } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "transactionCount", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_required", "type": "uint256" } ], "name": "changeRequirement", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "transactionId", "type": "uint256" } ], "name": "confirmTransaction", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "MAX_OWNER_COUNT", "outputs": [ { "name": "", "type": "uint256", "value": "10" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "required", "outputs": [ { "name": "", "type": "uint256", "value": "2" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "owner", "type": "address" }, { "name": "newOwner", "type": "address" } ], "name": "replaceOwner", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "destination", "type": "address" }, { "name": "value", "type": "uint256" }, { "name": "description", "type": "string" }, { "name": "data", "type": "bytes" } ], "name": "submitTransaction", "outputs": [ { "name": "transactionId", "type": "uint256" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "transactionId", "type": "uint256" } ], "name": "executeTransaction", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "softEthTransfer", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "name": "_owners", "type": "address[]", "index": 0, "typeShort": "address", "bits": "[]", "displayName": "&thinsp;<span class=\"punctuation\">_</span>&thinsp;owners", "template": "elements_input_json", "value": [] }, { "name": "_required", "type": "uint256", "index": 1, "typeShort": "uint", "bits": "256", "displayName": "&thinsp;<span class=\"punctuation\">_</span>&thinsp;required", "template": "elements_input_uint", "value": "2" }, { "name": "_ethDailyLimit", "type": "uint256", "index": 2, "typeShort": "uint", "bits": "256", "displayName": "&thinsp;<span class=\"punctuation\">_</span>&thinsp;eth Daily Limit", "template": "elements_input_uint", "value": "1" } ], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "sender", "type": "address" }, { "indexed": true, "name": "transactionId", "type": "uint256" } ], "name": "Confirmation", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "sender", "type": "address" }, { "indexed": true, "name": "transactionId", "type": "uint256" } ], "name": "Revocation", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "transactionId", "type": "uint256" } ], "name": "Submission", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "transactionId", "type": "uint256" } ], "name": "Execution", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "transactionId", "type": "uint256" } ], "name": "ExecutionFailure", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "sender", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" } ], "name": "Deposit", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "owner", "type": "address" } ], "name": "OwnerAddition", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "owner", "type": "address" } ], "name": "OwnerRemoval", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "required", "type": "uint256" } ], "name": "RequirementChange", "type": "event" } ];
const CrowdSaleABI = [ { "constant": true, "inputs": [], "name": "deadline", "outputs": [ { "name": "", "type": "uint256", "value": "1514409599" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "beneficiary", "outputs": [ { "name": "", "type": "address", "value": "0x0bb7d8331defc91494689db93cda8c325afe3077" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "tokenReward", "outputs": [ { "name": "", "type": "address", "value": "0xcd49a2c2fdb583647e48f61a2682864fa364d072" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" } ], "name": "balanceOf", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "startTime", "outputs": [ { "name": "", "type": "uint256", "value": "1514323199" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "fundingGoal", "outputs": [ { "name": "", "type": "uint256", "value": "5000000000000000000" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "amountRaised", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "closeCrowdsale", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "price", "outputs": [ { "name": "", "type": "uint256", "value": "1200000000000000000" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "crowdsaleClosed", "outputs": [ { "name": "", "type": "bool", "value": false } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "safeWithdrawal", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "name": "ifSuccessfulSendTo", "type": "address", "index": 0, "typeShort": "address", "bits": "", "displayName": "if Successful Send To", "template": "elements_input_address", "value": "0x0BB7D8331defC91494689dB93cDA8C325AFe3077" }, { "name": "fundingGoalInEthers", "type": "uint256", "index": 1, "typeShort": "uint", "bits": "256", "displayName": "funding Goal In Ethers", "template": "elements_input_uint", "value": "5" }, { "name": "startTimeInSeconds", "type": "uint256", "index": 2, "typeShort": "uint", "bits": "256", "displayName": "start Time In Seconds", "template": "elements_input_uint", "value": "1514323199" }, { "name": "durationInMinutes", "type": "uint256", "index": 3, "typeShort": "uint", "bits": "256", "displayName": "duration In Minutes", "template": "elements_input_uint", "value": "1440" }, { "name": "szaboCostOfEachToken", "type": "uint256", "index": 4, "typeShort": "uint", "bits": "256", "displayName": "szabo Cost Of Each Token", "template": "elements_input_uint", "value": "1200" }, { "name": "addressOfTokenUsedAsReward", "type": "address", "index": 5, "typeShort": "address", "bits": "", "displayName": "address Of Token Used As Reward", "template": "elements_input_address", "value": "" } ], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "recipient", "type": "address" }, { "indexed": false, "name": "totalAmountRaised", "type": "uint256" } ], "name": "GoalReached", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "backer", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" }, { "indexed": false, "name": "isContribution", "type": "bool" } ], "name": "FundTransfer", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "totalAmountRaised", "type": "uint256" }, { "indexed": false, "name": "fundingGoalReached", "type": "bool" } ], "name": "CrowdsaleClose", "type": "event" } ]