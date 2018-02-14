/*const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/JoIGnMxHRlKZg956R086"));*/
const URLS = {
    buyIntent: '/api/ico/order/intent',
    metamaskOrder: '/api/ico/order/metamask',
    shapeshiftOrder: '/api/ico/order/shapeshift',
    HOST: ''
};

sendGAEvent = (event) => {
    ga('send', 'event', event);
};

const MESSAGES = {
    shiftDisclaimer: "When paying through ShapeShift you agree to the following: <a href=\"https://info.shapeshift.io/sites/default/files/ShapeShift_Terms_Conditions%20v1.1.pdf\">ShapeShiftTerms and Conditions</a> Also, we're adding a fixed fee of 0.001 ETH (approximately 1 $USD) to the amount you specify in ETH to cover transaction gas used to deliver tokens to your Ether Address. After your purchase you will receive an email from ShapeShift with your receipt and an email from Docademic with instructions for setting your Ether Address, so please make sure you have access to the email address you provided. Your tokens will be delivered to your ether address after the Crowdsale has ended. We Recommend you provide a Return Address in case the ShapeShift transaction fails, this is NOT the address where you will receive your tokens.",
    shiftEmailReq: 'Please provide a valid email address before proceeding',
    shiftAmountReq: 'Please provide a valid ETH amount before proceeding'
};

const request = require('request');
const Web3R = require('web3');
const queryString = require('query-string');

const tokenAddress = "0x905E337c6c8645263D3521205Aa37bf4d034e745";
const multiSigAddress = "0x7A46C781b593068d5e987b191e9c2f7413E22aEE";
const crowdSaleAddress = "0x0E8160745966D2109c568230Ef515B0ddDea1599";
const contributors = new Set();
let web3R;
class Buy {

    constructor(web3, test) {
        this.test = test;
        this.web3 = web3;
        let version = web3.version.api;
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
            if (netId === "1") ok = true;
            if (this.test) ok = !ok;
            cb(ok);
        })
    }

    getMTCBalance(cb) {
        this.token.allowance(multiSigAddress, crowdSaleAddress, (error, result) => {
            cb(error, result);
        });
    }

    watchMultiSigTransactionExecution(cb) {
        let success = this.multiSig.Execution({}, {fromBlock: 0, toBlock: 'latest'});
        let failure = this.multiSig.ExecutionFailure({}, {fromBlock: 0, toBlock: 'latest'});
        success.watch(function (error, result) {
            cb(error, result, "success");
        });
        failure.watch(function (error, result) {
            cb(error, result, "failure");
        });
    }

    watchCrowdSaleFound(cb) {
        let event = this.crowdSale.FundTransfer({}, {fromBlock: 0, toBlock: 'latest'});
        event.watch(function (error, result) {
            cb(error, result);
        });
    }

    /*printHexData(){
        console.log("Hex Data");
        let call = this.web3.sha3("approve(address,uint256)").substr(0,10);

        let to = this.paddingLeft("0x23022508519EA24bCbBa4326992B095ABEC7c23d".substr(2),'0',64);
        let amount = this.paddingLeft(this.web3.toHex(this.web3.toWei('350000000','finney')).substr(2),'0',64).toUpperCase();

        console.log(call);
        console.log(to);
        console.log(amount);
        console.log(call+to+amount);
    }*/

    paddingLeft(string, character, padding) {
        while (string.length < padding) {
            string = character + string;
        }
        return string;
    }

}

window.addEventListener("load", function () {


    $.getJSON("/config.json", function (json) {
        if (json.HOST) {
            URLS.HOST = json.HOST;
            let params = queryString.parse(window.location.search);
            if (params.ref) {
                setRefText(params.ref);
            }
        } else {
            console.error("config.json must contain HOST variable");
        }
    }).fail(function () {
        console.error("Must have config.json file in root directoy");
    });

    var fStep = $('#first-step')
    $('#first-step-submit').click(function (e) {
        e.preventDefault();
        var checkboxes = fStep.find('.input-container input');
        var empty = false;
        checkboxes.each(function () {
            if (!$(this).is(":checked")) {
                empty = true;
                return false;
            }
        });
        if (empty !== true) {
            if (grecaptcha.getResponse()) {
                fStep.addClass('inactive');
                $('#second-step').addClass('show');
                sendGAEvent(GAEvents.disclaimerSubmit);
            } else {
                grecaptcha.reset();
            }
        }
    });

    if (typeof web3 !== 'undefined') {
        let web = new Web3(web3.currentProvider);
        if (web.eth.defaultAccount) {
            //buy.printHexData();
            let buy = new Buy(web, false);
            buy.checkNetwork(ok => {
                if (ok) {
                    showBuyModule(true, '');
                } else {
                    showBuyModule(false, 'Connected to an unknown network');
                }
            });
        } else {
            showBuyModule(false, 'There was an error retrieving your Metamask Account ¿Perhaps you need to set your password?');
        }
    } else {
        showBuyModule(false, 'We noticed that you don\'t have Metamask Installed, check out the FAQ section to get help on how to install Metamask');
        //alert('No MetaMask user? You should consider trying MetaMask!')
        //window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

    let web3RI = new Web3R(new Web3R.providers.HttpProvider("https://mainnet.infura.io/JoIGnMxHRlKZg956R086"));
	web3R = web3RI;
    initStats(web3RI);

    let buyButton = document.getElementById("buyButton");
    buyButton.addEventListener("click", () => {
        let email = document.getElementById("email").value;
        let amount = parseFloat(document.getElementById("amount").value);
        if (amount > 0) {
            initBuy(new Web3(web3.currentProvider), amount);
        }
    });

    let amountInput = document.getElementById("amount");
    amountInput.addEventListener("keyup", (e) => {
        let val = (e.target.value * (1/0.000035)) * 1.2;
        if (e.target.value && e.target.value > 0) {
            //setBuyButtonText('~'+val.toFixed(4));
            document.getElementById("buyButton").disabled = false;
            document.getElementById("buyButton").className = "btn green";
        } else {
            setBuyButtonText(0);
            document.getElementById("buyButton").disabled = true;
            document.getElementById("buyButton").className = "btn green inactive";
        }
    });
    amountInput.addEventListener("change", (e) => {
        let val = (e.target.value * (1/0.000035)) * 1.2;
        if (e.target.value && e.target.value > 0) {
            //setBuyButtonText('~'+val.toFixed(4));
            document.getElementById("buyButton").disabled = false;
            document.getElementById("buyButton").className = "btn green";
        } else {
            setBuyButtonText(0);
            document.getElementById("buyButton").disabled = true;
            document.getElementById("buyButton").className = "btn green inactive";
        }
    });

    /*
    let ethInput = document.getElementById("calc-eth");
    let mtcInput = document.getElementById("calc-mtc");
    ethInput.addEventListener("keyup", (e) => {
        if (e.target.value && e.target.value > 0) {
            setMTCBoxText(e.target.value);
        }
    });
    ethInput.addEventListener("change", (e) => {
        if (e.target.value && e.target.value > 0) {
            setMTCBoxText(e.target.value);
        }
    });

    mtcInput.addEventListener("keyup", (e) => {
        if (e.target.value && e.target.value > 0) {
            setEthBoxText(e.target.value);
        }
    });
    mtcInput.addEventListener("change", (e) => {
        if (e.target.value && e.target.value > 0) {
            setEthBoxText(e.target.value);
        }
    });*/

    let copy = $('.copy button');
    copy.click(function () {
        let copyText = $('.copy input');
        copyText.select();
        document.execCommand("copy");
        copy.addClass('copied').text('copied!');
        sendGAEvent(GAEvents.directIntent);
        let email = document.getElementById("email").value;
        if (email && validateEmail(email)) {
            let body = {email: email};
            if (document.getElementById("ref").value) body['ref'] = document.getElementById("ref").value;
            buyIntent((e, r, b) => {
            }, body);
        }
    });

    let shapeTab = $('#shapeshift-tab');
    shapeTab.click(function () {
        let email = document.getElementById("email").value;
        if (email && validateEmail(email)) {
            showShapeModule(true, MESSAGES.shiftDisclaimer);
            /*let body = {email: email};
            buyIntent(() => {
            }, body);*/
        } else {
            showShapeModule(false, MESSAGES.shiftEmailReq);
        }
    });

    let emailInput = document.getElementById("email");
    emailInput.addEventListener("keydown", (event) => {
        if (event.target.value && validateEmail(event.target.value)) {
            showShapeModule(true, MESSAGES.shiftDisclaimer);
            if (document.getElementById('pills-contact').className.includes('active')) {
                /*buyIntent(() => {
                }, {email: event.target.value})*/
            }
        } else {
            showShapeModule(false, MESSAGES.shiftEmailReq);
        }
    });

    emailInput.addEventListener("input", (event) => {
        if (event.target.value && validateEmail(event.target.value)) {
            showShapeModule(true, MESSAGES.shiftDisclaimer);
            if (document.getElementById('pills-contact').className.includes('active')) {
                /*buyIntent(() => {
                }, {email: event.target.value})*/
            }
        } else {
            showShapeModule(false, MESSAGES.shiftEmailReq);
        }
    });
    // Now you can start your app & access web3 freely:
    //startApp()
});


enableSubmitButton = (enable) => {
    document.getElementById('first-step-submit').disabled = !enable;
    if(enable) $("#first-step-submit").removeClass('inactive');
};

captchaCheck = () => {
    checkStepOne();
};

checkStepOne = () => {
    let c1 = document.getElementById('check1').checked;
    let c2 = document.getElementById('check2').checked;
    let c3 = document.getElementById('g-recaptcha-response').value;
    enableSubmitButton(c1 && c2 && c3);
};


retrieveEmail = () => {
    return document.getElementById('email').value;
};

retrieveRef = () => {
    return document.getElementById('ref').value;
};

replaceUrl = (show) => {
    let iFrameID = document.getElementById('shiftFrame');
    if (show) {
        if (!iFrameID.src.includes('shifty/index.html')) {
            iFrameID.src = './shifty/index.html';
        }
    } else {
        iFrameID.src = '';
    }
};

iframeLoaded = () => {
    let iFrameID = document.getElementById('shiftFrame');
    if (iFrameID) {
        // here you can make the height, I delete it first, then I make it again
        iFrameID.height = "";
        iFrameID.height = iFrameID.contentWindow.document.body.scrollHeight + "px";
    }
};

Eth2MTC = (eth) => {
    return (eth * 1000) * 1.2;
};

MTC2Eth = (mtc) => {
    return (mtc / 1000) / 1.2;
};

setEthBoxText = (mtc) => {
    let ethInput = document.getElementById("calc-eth");
    ethInput.value = MTC2Eth(mtc);
};

setMTCBoxText = (eth) => {
    let mtcInput = document.getElementById("calc-mtc");
    mtcInput.value = Eth2MTC(eth);
};

resetForm = () => {
    document.getElementById("email").value = '';
    document.getElementById("ref").value = '';
    document.getElementById("amount").value = '';
    grecaptcha.reset();
};

setRefText = (text) => {
    let refInput = document.getElementById("ref");
    refInput.value = text;
};

setBuyButtonText = (value) => {
    let buyButton = document.getElementById("buyButton");
    if (value) {
        buyButton.innerHTML = "Buy " + value + " MTC";
    } else {
        buyButton.innerHTML = "Buy";
    }
};

var progress = $('.progress-bar');
var targetCap = $('#target-cap');

let getBalance = (web)=>{
	web.eth.getBalance(crowdSaleAddress, (e, re) => {
		let eth = web.fromWei(re, 'ether');
        let ethCount = eth.c[0];
        let ethTarget = 525;
        let targetText = '<strong>Soft cap:</strong> <span >525 ETH</span>';
        function percentHtml(){
            let percent = Math.floor(ethCount * 100 / ethTarget);
            progress.html(percent+'%').css('width', percent+'%').attr('aria-valuenow', percent);
            targetCap.html(targetText);
        }
        if(ethCount < ethTarget){
            percentHtml();
        } else{
            ethTarget = 2100;
            targetText = '<strong>Hard cap:</strong> <span >2100 ETH</span>';
            percentHtml();
        }
		setEthText(web.fromWei(re, 'ether').toString(10));
		//setMTCText(sold.toString(10));
		//console.log(web.fromWei(re, 'ether').toString(10) + " eth");
		//console.log(balance.toString(10) + " tokens left");
		//console.log(sold.toString(10) + " tokens sold");
	});
}

initStats = (web) => {
    let buy = new Buy(web, true);
    buy.getMTCBalance((e, r) => {
        let balance = web.fromWei(r, 'ether');
        let initialSupply = web.toBigNumber(90000000);
        let sold = initialSupply.sub(balance);
        getBalance(web);
        setInterval(()=>{
	        getBalance(web);
        },5000);
        

    });
    /*buy.watchMultiSigTransactionExecution((err,results,type) => {
        console.log("EXECUTION "+ type);
        if(err)console.error(err);
        console.log(results);
    })*/
    buy.watchCrowdSaleFound((err, results) => {
        if (err) {
            console.error(err)
        } else {
            let args = results.args;
            let eth = web.fromWei(args.amount, 'ether');
            contributors.add(args.backer);
            //console.log(args.backer + " " + eth.toString(10) + " eth");
        }
        ;
    });
    //buy.buyMTC();
};

initBuy = (web3, amount) => {

    let email = document.getElementById('email').value
    if (email && validateEmail(email)) {
        buyIntent(() => {
        }, {email: email});
    }

    sendGAEvent(GAEvents.metamaskIntent);
	
    web3.eth.sendTransaction({
        to: crowdSaleAddress,
        value: web3.toWei(amount, 'ether')
    }, (err, results) => {
        if (!err) {
	        let eventData = Object.assign({},GAEvents.metamaskOrder);
	        eventData.eventValue = web3R.toWei(amount, 'finney');
	        sendGAEvent(eventData);
            let body = {};
            body['address'] = web3.eth.accounts[0];
            body['amount'] = amount;
            if (document.getElementById('email').value) {
                body['email'] = document.getElementById('email').value;
            }
            if (document.getElementById('ref').value) {
                body['ref'] = document.getElementById('ref').value;
            }
            body['tx'] = results;
            metamaskOrder(() => {
            }, body)
        } else {
            console.error(err);
        }
    });
};

validateEmail = (email) => {
    let re = /^(([^<>()s[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
};

setEthText = (text) => {
    document.getElementById('ether-text').innerHTML = text;
};

setMTCText = (text) => {
    document.getElementById('mtc-text').innerHTML = text;
};

showBuyModule = (show, message) => {
    if (show) {
        document.getElementById("messageDiv").className += 'hidden-input';
    } else {
        document.getElementById("buyForm").className += ' hidden-input';
        document.getElementById('message').innerHTML = message;
    }
};

showShapeModule = (show, message) => {
    if (show) {
        document.getElementById("buyForm2").className = 'mt-3';
        document.getElementById('message2').className = 'green';
        document.getElementById('message2').innerHTML = message;
        replaceUrl(true);
    } else {
        document.getElementById("buyForm2").className = 'mt-3 hidden-input';
        document.getElementById('message2').className = 'red';
        document.getElementById('message2').innerHTML = message;
        replaceUrl(false);
    }
};

showShiftAmountError = () => {
    document.getElementById('message2').className = 'red';
    document.getElementById('message2').innerHTML = MESSAGES.shiftAmountReq;
    setTimeout(() => {
        document.getElementById('message2').className = 'green';
        document.getElementById('message2').innerHTML = MESSAGES.shiftDisclaimer;
    }, 5000)
};

sendShapeshiftOrder = (tx, amount) => {
    let body = {tx: tx, amount: amount, email: document.getElementById('email').value};
    let ref = document.getElementById('ref').value;
    if (ref) {
        body['ref'] = ref;
    }
    shapeshiftOrder(() => {

    }, body);
	let eventData = Object.assign({},GAEvents.shapeshiftOrder);
	eventData.eventValue = web3R.toWei(amount, 'finney');
    sendGAEvent(eventData);
};

sendShapeshiftIntent = (amount) => {
    let email = document.getElementById("email").value;
    if (email && validateEmail(email)) {
        buyIntent(() => {
        }, {email});
    }
    sendGAEvent(GAEvents.shapeshiftIntent);
};

const buyIntent = function (callback, body) {
    let url = URLS.HOST + URLS.buyIntent;
    let method = 'POST';
    makeRequest(url, method, body, callback);
};

const metamaskOrder = function (callback, body) {
    let url = URLS.HOST + URLS.metamaskOrder;
    let method = 'POST';
    makeRequest(url, method, body, callback);
};

const shapeshiftOrder = function (callback, body) {
    let url = URLS.HOST + URLS.shapeshiftOrder;
    let method = 'POST';
    makeRequest(url, method, body, callback);
};

const makeRequest = function (url, method, body, callback) {

    let options = {};
    options.url = url;
    options.method = method;
    options.json = true;

    options.headers = {
        'Content-type': 'application/json',
        'accept-language': 'en'
    };

    if (body) options.body = body;

    request(options, function (err, response, body) {

        if (response && response.statusCode === 401) {
            window.location.href = '/'
        } else {
            callback(err, response, body);
        }
    });
};

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

const MultiSigABI = [{
    "constant": true,
    "inputs": [{"name": "", "type": "uint256"}],
    "name": "owners",
    "outputs": [{"name": "", "type": "address", "value": "0x1a243fb648e173bd8408d97e727f1ff694ba0d5c"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "dailySpent",
    "outputs": [{"name": "", "type": "uint256", "value": "0"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "owner", "type": "address"}],
    "name": "removeOwner",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "transactionId", "type": "uint256"}],
    "name": "revokeConfirmation",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": true,
    "inputs": [{"name": "", "type": "address"}],
    "name": "isOwner",
    "outputs": [{"name": "", "type": "bool", "value": false}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [{"name": "", "type": "uint256"}, {"name": "", "type": "address"}],
    "name": "confirmations",
    "outputs": [{"name": "", "type": "bool", "value": false}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "ethDailyLimit",
    "outputs": [{"name": "", "type": "uint256", "value": "1000000000000000000"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [{"name": "pending", "type": "bool"}, {"name": "executed", "type": "bool"}],
    "name": "getTransactionCount",
    "outputs": [{"name": "count", "type": "uint256", "value": "0"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [{"name": "transactionId", "type": "uint256"}],
    "name": "getTransactionDescription",
    "outputs": [{"name": "description", "type": "string", "value": ""}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "lastDay",
    "outputs": [{"name": "", "type": "uint256", "value": "17526"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "owner", "type": "address"}],
    "name": "addOwner",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": true,
    "inputs": [{"name": "transactionId", "type": "uint256"}],
    "name": "isConfirmed",
    "outputs": [{"name": "", "type": "bool", "value": false}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [{"name": "transactionId", "type": "uint256"}],
    "name": "getConfirmationCount",
    "outputs": [{"name": "count", "type": "uint256", "value": "0"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [{"name": "", "type": "uint256"}],
    "name": "transactions",
    "outputs": [{
        "name": "destination",
        "type": "address",
        "value": "0x0000000000000000000000000000000000000000"
    }, {"name": "value", "type": "uint256", "value": "0"}, {
        "name": "data",
        "type": "bytes",
        "value": "0x"
    }, {"name": "description", "type": "string", "value": ""}, {"name": "executed", "type": "bool", "value": false}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "getOwners",
    "outputs": [{
        "name": "",
        "type": "address[]",
        "value": ["0x1a243fb648e173bd8408d97e727f1ff694ba0d5c", "0x722bb9880e2011f4fc462731c038ff4555bd4b45", "0x4b07b99da4be0ef707e1c868a75f389785f28ebb"]
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [{"name": "from", "type": "uint256"}, {"name": "to", "type": "uint256"}, {
        "name": "pending",
        "type": "bool"
    }, {"name": "executed", "type": "bool"}],
    "name": "getTransactionIds",
    "outputs": [{"name": "_transactionIds", "type": "uint256[]", "value": []}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [{"name": "transactionId", "type": "uint256"}],
    "name": "getConfirmations",
    "outputs": [{"name": "_confirmations", "type": "address[]", "value": []}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "transactionCount",
    "outputs": [{"name": "", "type": "uint256", "value": "0"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "_required", "type": "uint256"}],
    "name": "changeRequirement",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "transactionId", "type": "uint256"}],
    "name": "confirmTransaction",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "MAX_OWNER_COUNT",
    "outputs": [{"name": "", "type": "uint256", "value": "10"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "required",
    "outputs": [{"name": "", "type": "uint256", "value": "2"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "owner", "type": "address"}, {"name": "newOwner", "type": "address"}],
    "name": "replaceOwner",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "destination", "type": "address"}, {"name": "value", "type": "uint256"}, {
        "name": "description",
        "type": "string"
    }, {"name": "data", "type": "bytes"}],
    "name": "submitTransaction",
    "outputs": [{"name": "transactionId", "type": "uint256"}],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "transactionId", "type": "uint256"}],
    "name": "executeTransaction",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "_to", "type": "address"}, {"name": "_value", "type": "uint256"}],
    "name": "softEthTransfer",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [{
        "name": "_owners",
        "type": "address[]",
        "index": 0,
        "typeShort": "address",
        "bits": "[]",
        "displayName": "&thinsp;<span class=\"punctuation\">_</span>&thinsp;owners",
        "template": "elements_input_json",
        "value": []
    }, {
        "name": "_required",
        "type": "uint256",
        "index": 1,
        "typeShort": "uint",
        "bits": "256",
        "displayName": "&thinsp;<span class=\"punctuation\">_</span>&thinsp;required",
        "template": "elements_input_uint",
        "value": "2"
    }, {
        "name": "_ethDailyLimit",
        "type": "uint256",
        "index": 2,
        "typeShort": "uint",
        "bits": "256",
        "displayName": "&thinsp;<span class=\"punctuation\">_</span>&thinsp;eth Daily Limit",
        "template": "elements_input_uint",
        "value": "1"
    }], "payable": false, "stateMutability": "nonpayable", "type": "constructor"
}, {"payable": true, "stateMutability": "payable", "type": "fallback"}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "name": "sender", "type": "address"}, {
        "indexed": true,
        "name": "transactionId",
        "type": "uint256"
    }],
    "name": "Confirmation",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "name": "sender", "type": "address"}, {
        "indexed": true,
        "name": "transactionId",
        "type": "uint256"
    }],
    "name": "Revocation",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "name": "transactionId", "type": "uint256"}],
    "name": "Submission",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "name": "transactionId", "type": "uint256"}],
    "name": "Execution",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "name": "transactionId", "type": "uint256"}],
    "name": "ExecutionFailure",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "name": "sender", "type": "address"}, {
        "indexed": false,
        "name": "value",
        "type": "uint256"
    }],
    "name": "Deposit",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "name": "owner", "type": "address"}],
    "name": "OwnerAddition",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "name": "owner", "type": "address"}],
    "name": "OwnerRemoval",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": false, "name": "required", "type": "uint256"}],
    "name": "RequirementChange",
    "type": "event"
}];
const CrowdSaleABI = [{
    "constant": true,
    "inputs": [],
    "name": "deadline",
    "outputs": [{"name": "", "type": "uint256", "value": "1514409599"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "beneficiary",
    "outputs": [{"name": "", "type": "address", "value": "0x0bb7d8331defc91494689db93cda8c325afe3077"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "tokenReward",
    "outputs": [{"name": "", "type": "address", "value": "0xcd49a2c2fdb583647e48f61a2682864fa364d072"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [{"name": "", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256", "value": "0"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "startTime",
    "outputs": [{"name": "", "type": "uint256", "value": "1514323199"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "fundingGoal",
    "outputs": [{"name": "", "type": "uint256", "value": "5000000000000000000"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "amountRaised",
    "outputs": [{"name": "", "type": "uint256", "value": "0"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [],
    "name": "closeCrowdsale",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "price",
    "outputs": [{"name": "", "type": "uint256", "value": "1200000000000000000"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "crowdsaleClosed",
    "outputs": [{"name": "", "type": "bool", "value": false}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [],
    "name": "safeWithdrawal",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [{
        "name": "ifSuccessfulSendTo",
        "type": "address",
        "index": 0,
        "typeShort": "address",
        "bits": "",
        "displayName": "if Successful Send To",
        "template": "elements_input_address",
        "value": "0x0BB7D8331defC91494689dB93cDA8C325AFe3077"
    }, {
        "name": "fundingGoalInEthers",
        "type": "uint256",
        "index": 1,
        "typeShort": "uint",
        "bits": "256",
        "displayName": "funding Goal In Ethers",
        "template": "elements_input_uint",
        "value": "5"
    }, {
        "name": "startTimeInSeconds",
        "type": "uint256",
        "index": 2,
        "typeShort": "uint",
        "bits": "256",
        "displayName": "start Time In Seconds",
        "template": "elements_input_uint",
        "value": "1514323199"
    }, {
        "name": "durationInMinutes",
        "type": "uint256",
        "index": 3,
        "typeShort": "uint",
        "bits": "256",
        "displayName": "duration In Minutes",
        "template": "elements_input_uint",
        "value": "1440"
    }, {
        "name": "szaboCostOfEachToken",
        "type": "uint256",
        "index": 4,
        "typeShort": "uint",
        "bits": "256",
        "displayName": "szabo Cost Of Each Token",
        "template": "elements_input_uint",
        "value": "1200"
    }, {
        "name": "addressOfTokenUsedAsReward",
        "type": "address",
        "index": 5,
        "typeShort": "address",
        "bits": "",
        "displayName": "address Of Token Used As Reward",
        "template": "elements_input_address",
        "value": ""
    }], "payable": false, "stateMutability": "nonpayable", "type": "constructor"
}, {"payable": true, "stateMutability": "payable", "type": "fallback"}, {
    "anonymous": false,
    "inputs": [{"indexed": false, "name": "recipient", "type": "address"}, {
        "indexed": false,
        "name": "totalAmountRaised",
        "type": "uint256"
    }],
    "name": "GoalReached",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": false, "name": "backer", "type": "address"}, {
        "indexed": false,
        "name": "amount",
        "type": "uint256"
    }, {"indexed": false, "name": "isContribution", "type": "bool"}],
    "name": "FundTransfer",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": false, "name": "totalAmountRaised", "type": "uint256"}, {
        "indexed": false,
        "name": "fundingGoalReached",
        "type": "bool"
    }],
    "name": "CrowdsaleClose",
    "type": "event"
}]