const queryString = require('query-string');
const request = require('request');

const URLS = {
    refData: '/api/ico/referral/{ref}',
    HOST: ''
};

window.addEventListener("load", function () {

    $.getJSON("/config.json", function (json) {
        if (json.HOST) {
            URLS.HOST = json.HOST;
            let params = queryString.parse(window.location.search);
            if (params.ref) {
                setRefText(params.ref);
                refData((e,r,b) => {
                    console.log(b);
                    drawTable(b.data.orders);
                }, params.ref);
            }
        } else {
            console.error("config.json must contain HOST variable");
        }
    }).fail(function () {
        console.error("Must have config.json file in root directoy");
    });
    //drawTable([{tx:1234,mtc:1000},{tx:4321,mtc:2000}]);
});

setRefText = (text) => {
    let refInput = document.getElementById("ref");
    refInput.value = text;
};

drawTable = (data) => {

    let container = document.createElement('div');
    container.className = 'col-md-10 mt-4';

    let row = document.createElement('div');
    row.className = 'row table-header';

    let txLabelContainer = document.createElement('div');
    txLabelContainer.className = 'col-md-7';
    let mtcLabelContainer = document.createElement('div');
    mtcLabelContainer.className = 'col-md-5';

    let txP = document.createElement('p');
    txP.innerHTML = 'TxHash';
    txLabelContainer.appendChild(txP);

    let mtcP = document.createElement('p');
    mtcP.innerHTML = 'MTC';
    mtcLabelContainer.appendChild(mtcP);

    row.appendChild(txLabelContainer);
    row.appendChild(mtcLabelContainer);

    container.appendChild(row);

    let idx = 0;
    let sum = 0;
    data.forEach((entry, index) => {
        idx = index;

        let row = document.createElement('div');
        index % 2 !== 0 ? row.className = 'row colored-entry':row.className = 'row table-entry';

        let txContainer = document.createElement('div');
        txContainer.className = 'col-md-7';
        let mtcContainer = document.createElement('div');
        mtcContainer.className = 'col-md-5';

        let txP = document.createElement('p');
        txP.innerHTML = entry.tx;
        txContainer.appendChild(txP);
        let mtcP = document.createElement('p');
        entry.mtc ? mtcP.innerHTML = entry.mtc : mtcP.innerHTML = 'pending...';
        if(entry.mtc)sum+=entry.mtc;
        mtcContainer.appendChild(mtcP);

        row.appendChild(txContainer);
        row.appendChild(mtcContainer);

        container.appendChild(row);
    });

    let row2 = document.createElement('div');
    //idx % 2 === 0 ? row2.className = 'row table-entry':row2.className = 'row';
    row2.className = 'row table-bottom';
    let txContainer2 = document.createElement('div');
    txContainer2.className = 'col-md-7';
    let mtcContainer2 = document.createElement('div');
    mtcContainer2.className = 'col-md-5';
    let txP2 = document.createElement('p');
    txP2.innerHTML = 'subtotal';
    txContainer2.appendChild(txP2);
    let mtcP2 = document.createElement('p');
    mtcP2.innerHTML = sum;
    mtcContainer2.appendChild(mtcP2);
    row2.appendChild(txContainer2);
    row2.appendChild(mtcContainer2);
    container.appendChild(row2);

    let bonus = sum*0.05;
    let row3 = document.createElement('div');
    //idx % 2 === 0 ? row2.className = 'row table-entry':row2.className = 'row';
    row3.className = 'row table-header';
    let txContainer3 = document.createElement('div');
    txContainer3.className = 'col-md-7';
    let mtcContainer3 = document.createElement('div');
    mtcContainer3.className = 'col-md-5';
    let txP3 = document.createElement('p');
    txP3.innerHTML = 'bonus';
    txContainer3.appendChild(txP3);
    let mtcP3 = document.createElement('p');
    mtcP3.innerHTML = ''+bonus;
    mtcContainer3.appendChild(mtcP3);
    row3.appendChild(txContainer3);
    row3.appendChild(mtcContainer3);
    container.appendChild(row3);

    document.getElementById("table-container").appendChild(container);
};

const refData = function (callback, ref) {
    let url = URLS.HOST + URLS.refData.replace('{ref}',ref);
    let method = 'GET';
    makeRequest(url, method, '', callback);
};

const makeRequest = function (url, method, body, callback) {

    let options = {};
    options.url = url;
    options.method = method;
    options.json = true;

    options.headers = {
        'Content-type': 'application/json',
        'accept-language': 'en',
        '':''
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