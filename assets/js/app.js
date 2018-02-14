/**
 * Created by Erik on 30/1/2017.
 */
const URLS = {
    subscribe: '/api/ico/subscribe',
    subscribeBounty: '/api/ico/affiliate',
    confirm: '/api/ico/confirm/',
    HOST: ''
};

const request = require('request');
const queryString = require('query-string');

const resetForm = () => {
    var form = document.getElementById("suscribeForm");
    form.elements["name"].value = '';
    form.elements["email"].value = '';
    form.elements["ref"].value = '';
    form.elements["g-recaptcha-response"].value = '';
    grecaptcha.reset();
};

const resetBountyForm = () => {
    var form = document.getElementById("suscribeBountyForm");
    form.elements["name"].value = '';
    form.elements["email"].value = '';
    form.elements["g-recaptcha-response"].value = '';
    grecaptcha.reset();
};

const hideLightbox = () => {
    document.getElementById("register-modal").className =
        document.getElementById("register-modal").className.replace
        (/(?:^|\s)show(?!\S)/g, '');
    hideTextMessage();
};

const hideTextMessage = () => {
    if (document.getElementById("message").className.includes('green')) {
        document.getElementById("message").className =
            document.getElementById("message").className.replace
            (/(?:^|\s)green(?!\S)/g, '');
    }

    if (document.getElementById("message").className.includes('red')) {
        document.getElementById("message").className =
            document.getElementById("message").className.replace
            (/(?:^|\s)red(?!\S)/g, '');
    }
};

const hideBountyTextMessage = () => {
    if (document.getElementById("bountyMessage").className.includes('green')) {
        document.getElementById("bountyMessage").className =
            document.getElementById("bountyMessage").className.replace
            (/(?:^|\s)green(?!\S)/g, '');
    }

    if (document.getElementById("bountyMessage").className.includes('red')) {
        document.getElementById("bountyMessage").className =
            document.getElementById("bountyMessage").className.replace
            (/(?:^|\s)red(?!\S)/g, '');
    }
};

const showTextMessage = (color, messsage) => {
    document.getElementById("message").className += color;
    document.getElementById('messageText').innerHTML = messsage;
};

const showBountyTextMessage = (color, messsage) => {
    document.getElementById("bountyMessage").className += color;
    document.getElementById('bountyMessageText').innerHTML = messsage;
};

const hideReferrerInput = () => {
    document.getElementById("referrer").className =
        document.getElementById("referrer").className.replace
        (/(?:^|\s)input-animated mt-3(?!\S)/g, '');
    document.getElementById("referrer").className += 'hidden-input';
};

const subscribeUser = (name, email, captcha) => {

    if (name && email && captcha) {
        let body = {
            name: name,
            email: email,
            captcha: captcha
        };

        let params = queryString.parse(window.location.search);

        if (params.ref) {
            body['ref'] = params.ref;
        } else {
            let form = document.getElementById("suscribeForm");
            if (form.elements["ref"].value) body['ref'] = form.elements["ref"].value;
        }

        console.log(body);
        subscribe((err, response, body) => {
            if (err) {
                console.error(err.message);
            } else {
                if (body.success) {
                    showTextMessage('green', body.message);
                    setTimeout(function () {
                        hideLightbox();
                        resetForm();
                    }, 3000);

                } else {
                    showTextMessage('red', body.message);
                    grecaptcha.reset();
                    setTimeout(function () {
                        hideTextMessage();
                    }, 2000);

                }
            }
        }, body);
    } else {
        showTextMessage('red', 'Please fill out all fields');
        grecaptcha.reset();
        setTimeout(function () {
            hideTextMessage();
        }, 2000);
    }
};

const subscribeBountyUser = (name, email, captcha) => {

    if (name && email && captcha) {
        let body = {
            name: name,
            email: email,
            captcha: captcha
        };

        console.log(body);
        subscribeBounty((err, response, body) => {
            if (err) {
                console.error(err.message);
            } else {
                if (body.success) {
                    showBountyTextMessage('green', body.message);
                    setTimeout(function () {
                        hideLightbox();
                        resetBountyForm();
                    }, 3000);

                } else {
                    showBountyTextMessage('red', body.message);
                    grecaptcha.reset();
                    setTimeout(function () {
                        hideBountyTextMessage();
                    }, 2000);

                }
            }
        }, body);
    } else {
        showBountyTextMessage('red', 'Please fill out all fields');
        grecaptcha.reset();
        setTimeout(function () {
            hideBountyTextMessage();
        }, 2000);
    }
};

const confirmUser = (token) => {
    let title = $("#title");
    let success = $("#success-card");
    let error = $("#error-card");
    let errorText = $("#error-text");
    confirm((err, response, body) => {
        if (err) {
            console.error(err.message);
        } else {
            if (body.success) {
                title.html("Thanks " + body.data.user.name + "!");
                success.show();

            } else {
                title.html("Oops, something went wrong");
                errorText.html(body.message);
                error.show();
            }
        }
    }, token);
};

const subscribe = function (callback, body) {
    let url = URLS.HOST + URLS.subscribe;
    let method = 'POST';
    makeRequest(url, method, body, callback);
};

const subscribeBounty = function (callback, body) {
    let url = URLS.HOST + URLS.subscribeBounty;
    let method = 'POST';
    makeRequest(url, method, body, callback);
};

const confirm = function (callback, token) {
    let url = URLS.HOST + URLS.confirm + token;
    let method = 'GET';
    makeRequest(url, method, null, callback);
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

window.addEventListener("load", function () {
    // Access the form element...

    $.getJSON("/config.json", function (json) {
        if (json.HOST) {
            URLS.HOST = json.HOST;
            if (window.location.href.includes('confirm')) {
                let token = window.location.search.replace('?', '');
                confirmUser(token);
            } else {
	            let params = queryString.parse(window.location.hash);
	            console.log(params);
	            if(params.subscribe===null)$('#register-button').click();
	            if(params.bounty===null)$('#bounty-button').click();
            }
        } else {
            console.error("config.json must contain HOST variable");
        }
    }).fail(function () {
        console.error("Must have config.json file in root directoy");
    });
});

$(document).ready(function () {
    $('#register-button').click(function () {
        console.log('register');
        $.ajax({
            url: "/register.html",
            success: function (response) {
                $('#modal-card').html(response);
                let params = queryString.parse(window.location.search);
                if (params.ref) {
                    hideReferrerInput();
                }

                var form = document.getElementById("suscribeForm");
                // ...and take over its submit event.
                form.addEventListener("submit", function (event) {
                    event.preventDefault();
                    subscribeUser(form.elements["name"].value, form.elements["email"].value, form.elements["g-recaptcha-response"].value);
                });

                // input animated
                $('.input-animated input').focus(function () {
                    $(this).parent().addClass('active');
                });
            }
        });
    });

    $('#bounty-button').click(function () {
        console.log('bounty');
        $.ajax({
            url: "/bounty.html",
            success: function (response) {
                $('#modal-card').html(response);
                var bountyForm = document.getElementById("suscribeBountyForm");
                // ...and take over its submit event.
                bountyForm.addEventListener("submit", function (event) {
                    event.preventDefault();
                    subscribeBountyUser(bountyForm.elements["name"].value, bountyForm.elements["email"].value, bountyForm.elements["g-recaptcha-response"].value);
                });

                // input animated
                $('.input-animated input').focus(function () {
                    $(this).parent().addClass('active');
                });
            }
        });
    });
});


