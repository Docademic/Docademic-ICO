/**
 * Created by Erik on 30/1/2017.
 */

window.addEventListener("load", function () {
    // Access the form element...
    if (window.location.href.includes('confirm')) {
        //console.log('In Confirm');
        let token = window.location.search.replace('?', '');
        //console.log(token);
        confirmUser(token);
    } else {
        //console.log('In Index');
        var form = document.getElementById("suscribeForm");
        // ...and take over its submit event.
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            subscribeUser(form.elements["name"].value, form.elements["email"].value);
        });
    }
});

const URLS = {
    subscribe: '/api/ico/subscribe',
    confirm: '/api/ico/confirm/',
    HOST: 'https://labs.docademic.com:3020'
};

const request = require('request');

subscribeUser = (name, email) => {
    let body = {
        name: name,
        email: email
    };
    subscribe((err, response, body) => {
        console.log(err);
        console.log(response);
        console.log(body);
        if (err) {
            console.error(err.message);
        } else {
            if (body.success) {
                alert(body.message);
            } else {
                alert(body.message);
            }
        }
    }, body);
};

confirmUser = (token) => {
    confirm((err, response, body) => {
        if (err) {
            console.error(err.message);
        } else {
            if (body.success) {
                alert(body.message);
            } else {
                alert(body.message);
            }
        }
    }, token);
};

subscribe = function (callback, body) {
    let url = URLS.HOST + URLS.subscribe;
    let method = 'POST';
    this.makeRequest(url, method, body, callback);
};

confirm = function (callback, token) {
    let url = URLS.HOST + URLS.confirm + token;
    let method = 'GET';
    this.makeRequest(url, method, null, callback);
};

makeRequest = function (url, method, body, callback) {

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


