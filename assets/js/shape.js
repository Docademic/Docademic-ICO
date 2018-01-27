const request = require('request');
const queryString = require('query-string');

$(document).ready(function () {
    $('#email').val(queryString.parse(window.location.search).email);
    $('#txid').val(queryString.parse(window.location.search).tx);
    $('#send-button').click(function () {
        if (document.getElementById('address').value && document.getElementById('conf-address').value) {
            if (document.getElementById('address').value === document.getElementById('conf-address').value) {
                validateAddress(document.getElementById('address').value, (e, r, b) => {
                    if (r.body.isValid) {
                        complete(document.getElementById('address').value, (e, r, b) => {
                            if (r.body.success) {
                                showMessage(true, 'Congratulations! You have completed your MTC purchase, we\'ll send your tokens to the address you provided after the Crowdsale has ended (28/02/2018)');
                                setTimeout(() => {
                                    window.location.href = '/';
                                }, 5000);
                            } else {
                                showMessage(false, r.body.message);
                            }
                        });
                    } else {
                        showMessage(false, r.body.error);
                    }
                });
            } else {
                showMessage(false, 'The Addresses do not match');
            }
        } else {
            showMessage(false, 'Please fill out all the fields');
        }
    });
});

const showMessage = (success, message) => {
    document.getElementById("messageDiv").className = '';
    success ? document.getElementById('message').className = 'green' : document.getElementById('message').className = 'red';
    document.getElementById('message').innerHTML = message;
    setTimeout(() => {
        document.getElementById("messageDiv").className = 'hidden-input';
    }, 3000);
};

const validateAddress = function (address, callback) {
    request({
        url: 'https://shapeshift.io/validateAddress/' + address + '/ETH', method: 'GET',
    }, function (e, r, b) {
        if (r && r.statusCode === 401) {
            window.location.href = '/'
        } else {
            callback(e, r, b);
        }
    });
};

const complete = function (address, callback) {
    request({
        url: 'https://labs.docademic.com:3020/api/ico/shapeshift/address', method: 'POST', json: true, headers: {
            'Content-type': 'application/json',
            'accept-language': 'en',
            'd-access-token': queryString.parse(window.location.search).token
        },
        body:{address}
    }, function (e, r, b) {
        if (r && r.statusCode === 401) {
            window.location.href = '/'
        } else {
            callback(e, r, b);
        }
    });
};