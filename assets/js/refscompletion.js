const queryString = require('query-string');
const request = require('request');
const Web3 = require('web3');

const URLS = {
    refComplete: '/api/ico/affiliate/complete',
    HOST: ''
};

window.addEventListener("load", function () {

    $.getJSON("/config.json", function (json) {
        if (json.HOST) {
            URLS.HOST = json.HOST;
            let params = queryString.parse(window.location.search);
            if (params.ref) {
                document.getElementById("ref").innerHTML = "Referral code: " + params.ref;
            }
            if (params.email) {
                document.getElementById("email").innerHTML = "Email: " + params.email;
            }
            if (params.token) {
                $('#sendButton').click(function () {
                    let address = document.getElementById("address").value;
                    let web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/JoIGnMxHRlKZg956R086"));
                    if (web3.isAddress(address)) {
                        completeRef((err, response, body) => {
                            console.log(response);
                            if (err) {
                                alert('There was an error, please try again');
                            } else {
                                if (response.body.success) {
                                    alert('Done! You will receive your reward shortly');

                                } else {
                                    alert('There was an error, please try again');
                                }
                            }
                        }, address, params.token);
                    } else {
                        alert('Invalid Address');
                    }
                });
            }
        } else {
            console.error("config.json must contain HOST variable");
        }
    }).fail(function () {
        console.error("Must have config.json file in root directoy");
    });
    //drawTable([{tx:1234,mtc:1000},{tx:4321,mtc:2000}]);
});

const completeRef = function (callback, address, token) {
    let url = URLS.HOST + URLS.refComplete;
    let method = 'PUT';
    let body = {address: address};
    makeRequest(url, method, body, token, callback);
};

const makeRequest = function (url, method, body, token, callback) {

    let options = {};
    options.url = url;
    options.method = method;
    options.json = true;

    options.headers = {
        'Content-type': 'application/json',
        'accept-language': 'en',
        'd-access-token': token
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