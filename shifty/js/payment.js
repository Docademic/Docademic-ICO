jQuery( document ).ready(function( $ ) {
	//Public Key -- fd785c3d671e9a346e817a5ef606a6b317b7ceb0ddb1fb6132725842034efbbfd20cdb75a8d792a77c41e3f4278fd6bcd3f57dd6b30a24cf7fd6db2cd86f1309

    var ssio_protocol = "https://";
    var SITE = ssio_protocol + "shapeshift.io";
    var outputData = '';
    var output = 'ETH';
    var depoMin = 0;
    var started = false;
    var coin = '';

/*    if((typeof env != "undefined") && (env == "development"))
    {
        SITE = "";
    }
*/
    var email = document.getElementById('email');
    email.value = parent.retrieveEmail();
    email.readOnly = true;
    adjustIframe();

    function adjustIframe () {
        parent.iframeLoaded();
    }

    function getUrlParameter(sParam)
    {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++)
        {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == sParam)
            {
                return sParameterName[1];
            }
        }
    }

    var apiKey = 'd25c4906c1d15c6bb782f37e067cffdefac1d2f0beaa6c05e073fe78e80d884acea07200503ab09a2093a184e13bb968abe5336a32bdcd3950d6e478fb75b4ec';
    var destination = getUrlParameter('destination');
    // todo: change destination address for the shiftsale address
    var destination = '0x6b1fB08639aCEc6ED415BaCaB6453B523AEc7D4B';
    //pre_amount = getUrlParameter('amount');
    var pre_amount = '';
    //apiKey = getUrlParameter('apiKey');
    if(destination) {
        $('#withdraw-address').val(destination);
    }
    if(pre_amount) {
        $('#amount').val(pre_amount);
    }

    if(getUrlParameter('output')) {
        output = getUrlParameter('output');
        var split = output.split(',');

	        if(split.length > 1) {
		        output = split[0];
	            $('.other-dropdown').show();
	        } else {
		        $('.other-dropdown').hide();
	        }
    }

    if(output!==''){
        $('#amount').attr('placeholder', 'Amount ' + output);
    }

    $('.ssio-currency-dropdown').val('---');


    function round(value, exp) {
        if (typeof exp === 'undefined' || +exp === 0)
            return Math.round(value);

        value = +value;
        exp  = +exp;

        if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0))
            return NaN;

        // Shift
        value = value.toString().split('e');
        value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp)));

        // Shift back
        value = value.toString().split('e');
        return +(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp));
    }


    var spinner = '<div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>';
    var deposit_type = '';
    var altcoin_deposit_limit = ''; // defined here (globally) because it is used in a bunch of places
    function getCoins(callback) {
        $.getJSON( SITE + "/getcoins", function( data ) {
            crypto_data = data;
            callback(crypto_data);
        });

    }

    function show_error(msg) {
        // At any point in the process, if the shapeshift api returns any kind of error,
        // this text gets placed into the page.
		if(!started) {
        	alert(msg);
        }
    }


    function send_success_email(email, txid) {
        $.post(SITE+"/mail", {
            email: email,
            txid: txid
        }).done(function (response) {
            console.log("sent email", response);
            if(response.error) {
                var to_display = response.error;
            } else {
                var to_display = response.email.message;
            }
            //$('#shapeshift-lens-modal .ssio-email-status-msg').text(to_display);
        }).error(function(response) {

            if(response.error == "I'm busy right now, sorry.") {
                // iterate while busy signal until the email gets successfully sent.
                setTimeout(function() {
                    send_success_email(email, txid);
                }, 3000);
            }
        });

    }


    function getRates(rate_pair) {
        $('.ssio-limit, .ssio-exchange-rate').fadeIn();
        var altcoin_symbol = rate_pair;
        var pair = altcoin_symbol.toUpperCase() + '_' + output;

        $(".exchange-rate p").html(spinner);
        $(".deposit-limit p").html(spinner);
		$(".min-limit p").html(spinner);
        $('#shapeshift-lens-modal .ssio-more-options').show();

        $.get(SITE+"/rate/" + pair, function(response) {
            if(response.error) {
                show_error("ShapeShift API returned an error: " + response.error);
                return;
            }
            var rate = parseFloat(response.rate);
            var formatted_rate = rate.toFixed(8);
            if(altcoin_symbol == 'BTC') {
                formatted_rate = rate.toFixed(4);
            } else if(altcoin_symbol == 'NBT') {
                formatted_rate = rate.toFixed(4);
            } else {
                formatted_rate = rate.toFixed(8);
            }
            $(".exchange-rate p").text("1 " + altcoin_symbol.toUpperCase() + ' = ' + formatted_rate + ' ' + output);
            

            $.get(SITE+"/limit/" + pair, function(response) {
                if(response.error) {
                    show_error(response.error);
                    return;
                }
                var btc_deposit_limit = response.limit;
                altcoin_deposit_limit = parseFloat(btc_deposit_limit).toFixed(4);
                console.log("got rate for pair " + pair + " as " + rate + ", and btc_dep_limit : " + btc_deposit_limit);
                $(".deposit-limit p").text(altcoin_deposit_limit + " " + altcoin_symbol.toUpperCase());
                $('#return-address').attr('placeholder',altcoin_symbol.toUpperCase()+' Return Address (recommended)');
                $(".min-limit p").text(response.min + " " + altcoin_symbol.toUpperCase());
	            if(altcoin_symbol.toUpperCase() == "BTC") {
		            $('.depo-max').show();
		            var data = {
			            amount: 1,
			            pair: pair
		            }
		            if(apiKey) {
			            data['apiKey'] = apiKey;
		            }
		            $('.depo-max p').html(spinner);
		            $.post(SITE+"/sendamount", data, function(response){
			            if(response.success){
				            $('.depo-max p').show().text(response.success.maxLimit + " " + altcoin_symbol.toUpperCase());
			            } else {
				            if(!started) {
					            show_error(response.error);
					        }
			            }
		            });
	            } else {
		            $('.depo-max').hide();
	            }
                adjustIframe();
            }).error(function(response) {
                show_error("General Ajax failure");
            });


        }).error(function(response) {
            show_error("General Ajax failure");
        });
    }

    $('.ssio-currency-dropdown').change(function(event) {
        $('#shapeshift-lens-modal .pay-with').fadeOut();
        if($(this).val() !== '---') {
            // When the user selects which currency they want to pay with,
            // show the further options, and make the pay button appear.
            $('.deposit-limit, .exchange-rate, .return-address-input, .email-input').fadeIn();
            var coin = $(this).val();
            getRates(coin);
            if($(this).val() == 'nxt') {
                $('.rs-address-input').fadeIn();
            } else {
                $('.rs-address-input').fadeOut();
            }
            if($(this).val() == 'xrp') {
                $('.dest-tag-input').fadeIn();
            } else {
                $('.dest-tag-input').fadeOut();
            }
        }
        if($(this).val() == 'btc') {
            //$('.deposit-limit, .exchange-rate, .return-address-input, .email-input').fadeOut();
        }
    });

    function show_success(msg) {
        $('.status-message').html(msg);
    }

    function btc_pay() {
        var deposit = $('#withdraw-address').val();
        amount = $('#amount').val();
        currency = $(".ssio-currency-dropdown").val();
        altcoin_name = crypto_data[currency.toUpperCase()].name;
        bitcoin_icon = '<img src="' + crypto_data["BTC"].image + '">';
        
		if(altcoin_name == 'Nubits') {
			qrstring = deposit;
		} else {
			qrstring = altcoin_name.toLowerCase()+":"+deposit;
		}

        var first_inst = "";

        if(amount)
        {
            qrstring = altcoin_name.toLowerCase()+":"+deposit+"?amount="+amount;
            first_inst = "Send " + amount + " " + bitcoin_icon + " BTC to <br>" + "<span class='depo-address'>" + deposit + "</span>";
            if(altcoin_name == 'Nubits') {
				qrstring = deposit+"?amount="+amount;
			}
			
        } else {
            first_inst = "Send " + bitcoin_icon + " BTC to <br>" + "<span class='depo-address'>" + deposit + "</span>";
        }
        $(".instructions").find('.first').html(first_inst);

        $('.input-form').fadeOut('normal', function() {
            $(this).remove();
            $('.instructions').fadeIn();
        });

        new QRCode(document.getElementById("qr-code"), qrstring);

        $('.coin').fadeOut('normal', function(){
            $(this).hide();
            $('#qr-code').fadeIn();
        });

    }

    function pay_button_clicked(event) {
        // This function gets fired when the pay button is clicked. It fires off
        // the "shift" api call, then starts the timers.

        var btc_address = destination;
        var return_address = $('#return-address').val();
        var currency = $(".ssio-currency-dropdown").val();
        var altcoin_name = crypto_data[currency.toUpperCase()].name;
        var altcoin_icon = '<img src="' + crypto_data[currency.toUpperCase()].image + '">';
        var outputIcon = '<img src="' + crypto_data[output].image + '">';
        var outputName = crypto_data[output].name;
        var email = $("#email").val();
        var pair = currency + '_' + output;
        var btc_amount = $("#amount").val();
        var public_key = '';
        var destTag = '';
        var nice_rsAddress = '';
        var nice_destTag = '';

        //$("#shapeshift-lens-modal").html("Calling ShapeShift.io's API..." + spinner);

        if(btc_amount) {
	        parent.sendShapeshiftIntent();
            data = {withdrawal: btc_address, pair: pair, amount: parseFloat(btc_amount)+parseFloat(0.001), returnAddress: return_address, destTag: destTag, apiKey: apiKey};
            console.log(data.amount);
            siteURL = SITE + "/sendamount";
            url = siteURL;

            var steps_height = $('.status-window .status-inner').height();
            $('.status-window').animate({
                height: steps_height
            }, 500, 'easeInOutExpo');

            $.post(url, data).done(function(response) {
                // This gets executed when the call to the API to get the deposit
                // address.

                if(response.error) {
                    show_error(response.error);
                    return;
                }
                //console.log(response);
                var deposit_text = '';
                var amount = null;
                var expiration = null;
                var seconds_remaining = null;
                var sAddress_value = '';
                var message = '';
                if(response.success) {
                    // response came from call to 'sendamount'
                    var deposit = response.success.deposit;
                    var amount = response.success.depositAmount;
                    expiration = response.success.expiration;
                    public_key = response.success.public;
                    destTag = response.success.xrpDestTag;
                    depositType = response.success.depositType;
                    sAddress = response.success.sAddress;
                    depoPair = response.success.pair;
                    withdrawal = response.success.withdrawal;
                } else {
                    // response came from call to 'shift'
                    var deposit = response.deposit;
                    public_key = response.public;
                    destTag = response.xrpDestTag;
                    depositType = response.depositType;
                    sAddress = response.sAddress;
                    depoPair = response.pair;
                    withdrawal = response.withdrawal;
                }

                var deposit_type = response.depositType;

                if(amount) {
                    var show_amount = "<b>" + amount + "</b> ";
                } else {
                    var show_amount = "up to <b>" + altcoin_deposit_limit + "</b>";
                }
                if(public_key) {
                    nice_rsAddress = '<span class="public-key">' + public_key + '</span>';
                }
                if(depoPair == 'xmr_btc' || depositType == 'XMR') {
                    sAddress = '46yzCCD3Mza9tRj7aqPSaxVbbePtuAeKzf8Ky2eRtcXGcEgCg1iTBio6N4sPmznfgGEUGDoBz5CLxZ2XPTyZu1yoCAG7zt6';
                    sAddress_value = '<div class="long">' + sAddress + '</div>';
                    deposit_text = 'PaymentID: ';
                    $('.depo-label').text('PaymentID:');
                    message = '<div class="alert alert-warning"><b>Do not send without a PaymentId </b> your funds will be unrecoverable if you do!</div>';

                }
                if(depoPair == 'bts_btc' || depoPair == 'bitusd_btc' || depositType == 'BTS' || depositType == 'BITUSD' || depositType == 'STEEM' || depositType == 'SBD') {
                    deposit_text = '<strong>shapeshiftio</strong> ' + 'MEMO: ';
                    $('.depo-label').text('Deposit Account:');
                }

                var first_inst = "Send " + show_amount + " " + altcoin_icon + " " + altcoin_name + " to <br>" + "<span class='depo-address'>" + sAddress_value + deposit_text + '<div class="long">' + deposit + "</div></span>" + nice_rsAddress + message;

                if(amount) {
                    var second_inst = "It will be converted into " + (parseFloat(btc_amount)+parseFloat(0.001)) + ' ' + outputIcon + ' ' + outputName + ", and sent to<br>" + "<span class='depo-address long'>" + withdrawal + "</span>";
                } else {
                    var second_inst = "It will be converted into " + outputIcon + ' ' + outputName + ", and sent to<br>" + "<span class='depo-address'>" + withdrawal + "</span>";
                }

                $(".instructions").find('.first').html(first_inst);
                $(".instructions").find('.last').html(second_inst);
                $('.depo-address-block').html(deposit);
                //$('.public-key').text(public_key);

                var qrstring = altcoin_name.toLowerCase() + ":" + deposit;
                if(altcoin_name == 'Nubits') {
                    qrstring = deposit;
                }
                if(amount)
                {
                    qrstring = altcoin_name.toLowerCase()+":"+deposit+"?amount="+amount;
                    if(altcoin_name == 'Nubits') {
                        qrstring = altcoin_name+"?amount="+amount;
                    }
                }
                new QRCode(document.getElementById("qr-code"), qrstring);
                $('a.qr-link').attr('href', qrstring);

                $('.input-form').fadeOut('normal', function() {
                    $(this).remove();
                    $('.instructions').fadeIn();
                });

                $('.coin').fadeOut('normal', function(){
                    $(this).hide();
                    $('#qr-code').fadeIn();
                });
                adjustIframe();
                var ticks = 0;
                interval_id = setInterval(function() {

                    if(ticks % 8 == 0) {
                        // every eight seconds get the current status of any deposits.
                        // by making a call to shapeshift's api
                        $.get(SITE+"/txStat/" + encodeURIComponent(deposit), {timeout: 4500}).done(function(response) {
                            // send tx status updates to window opener
                            if (window.opener) {
                                window.opener.postMessage({
                                    type: 'txStat',
                                    data: response
                                }, '*');
                            }

                            var status = response.status;

                            if(status == 'no_deposits') {
                                $('#steps #deposit').addClass('active');
                                started = true;
                            } else if (status == 'received') {
                                //show_status("Status: Payment Received, waiting for confirmation. " + spinner);
                                $('#steps #deposit').removeClass('pending').addClass('good');
                                $('#exchange').addClass('active');
                                $('.timer').hide();
                                expiration = null;
                            } else if (status == 'complete') {
                                console.log(response);
                                var in_type = response.incomingType;
                                var out_type = response.outgoingType;
                                var incoming = response.incomingCoin;
                                var outgoing = response.outgoingCoin;
                                var withdraw = response.withdraw;
                                var txid = response.transaction;
                                $('#exchange').removeClass('pending').addClass('good');
                                $('#complete').removeClass('pending').addClass('good');
                                $('.status-window').addClass('complete');
                                show_success("<p>" + incoming + " " + altcoin_icon + " " + in_type + " was converted to " + outgoing + " " + outputIcon + " " + out_type + " and sent to " + "<strong>" + withdraw + "</strong></p>");
                                parent.sendShapeshiftOrder(txid,parseFloat(btc_amount)+parseFloat(0.001));
                                if(email) {
                                    send_success_email(email, txid);
                                }
                                clearInterval(interval_id);
                                expiration = null;
                                return;
                            } else if (status == 'failed') {
                                show_error("ShapeShift.io API returned an error: " + response.error);
                                clearInterval(interval_id); //halt ticking process
                                return;
                            }
                        });

                    }
                    if(amount) {
                        $.get(SITE + "/timeremaining/" + encodeURIComponent(deposit), {timeout: 4500}).done(function (response) {
                            seconds_remaining = response.seconds_remaining;
                        });
                        if (seconds_remaining || expiration) {
                            var seconds = seconds_remaining ? seconds_remaining : ((expiration - new Date()) / 1000).toFixed(0);
                            var timeText = ""
                            var sec = 0;
                            if (seconds > 59) {
                                var min = Math.floor(seconds / 60);
                                sec = seconds - (min * 60);

                                if (sec < 10) {
                                    sec = "0" + sec;
                                }

                                timeText = min + ":" + sec;
                            }
                            else {
                                if (seconds < 10) {
                                    sec = "0" + seconds;
                                }

                                timeText = "0:" + sec;
                            }
                            if (seconds > 0) {
                                $(".timer").text(timeText + " until expiration");
                            } else {
                                //show_error("Time Expired! Please try again.");
                                $(".timer").text('Expired!');
                                clearInterval(interval_id);
                                return;
                            }
                        } else {
                            $(".timer").text('');
                        }
                    }
                    ticks++;
                }, 1000);

            }).error(function(response) {
                if(response.error) {
                    show_error(response.error);
                    return;
                }
            });
        } else {
            parent.showShiftAmountError();
        }
    }

    function loadCoins() {
        getCoins(function () {
            $.each(crypto_data, function (i, currCoin) {
                if (currCoin.status == 'available' && currCoin.symbol !== output) {
                    $('.ssio-currency-dropdown').append('<option value="' + currCoin.symbol.toLowerCase() + '" data-image="' + currCoin.image + '">' + currCoin.name + '</option>');
                }
                if (output && output == currCoin.symbol) {
                    $('.outputCoin').attr('src', currCoin.image);
                    var outputData = currCoin;
                }
            });
            $('#others').html('');
            if(split) {
	            $.each(split, function (i, otherCoin) {

	                if (output != otherCoin) {

	                }
	                if(output == otherCoin) {

	                } else {
	                    var otherHtml = '<li class="switch-coin"><a href="#" data-symbol="' + otherCoin + '"><img width="20" src="' + crypto_data[otherCoin].image + '">' + crypto_data[otherCoin].name + '</a></li>';
	                    $('#others').append(otherHtml);
	                }
	            });
            }
            $(".ssio-currency-dropdown").msDropDown();
        });
    }
    loadCoins();
	$('#others').delegate('a', 'click', function(e){
		e.preventDefault();
        var newCoin = $(this).attr('data-symbol');
        var curInput = $('.ssio-currency-dropdown').val();
        output = newCoin;
        loadCoins();
        if(curInput != '---') {
            getRates(curInput);
            $('#return-address').attr('placeholder', 'Return '+curInput+' Address (Recommended)');
        }
	});
    $('.form-submit').click(function(){
        if($('.ssio-currency-dropdown').val() !== '---') {

            var re_coin = $('.ssio-currency-dropdown').val();
            if($('#amount').val().length == 0) {
                window.setInterval(function(){
                    getRates(re_coin);
                }, 30000);
            }
            pay_button_clicked();
        }

    });


});
