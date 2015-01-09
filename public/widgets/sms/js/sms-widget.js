$(function() {

    $.widget("ui.smswidget", {
        options: {
            'from': ''
        },
        
        _create: function() {
            this._renderUI();
        },
        
        _renderUI: function() {
            if ( !this._validateMobile( this.options.from ) ) {
                this.element.append('Please provide valid from Mobile number');
                return false;
            }
            var htmlStr = '';

            htmlStr += '<div class="smsWidget">';
            htmlStr += '   <div class="swHeader">';
            htmlStr += '      <h3>Send SMS</h3>';
            htmlStr += '      <div class="swNav"><span class="smsButton sentHistory">History</span></div>';
            htmlStr += '   <div class="clearfix"></div></div>';
            htmlStr += '   <div class="swBody">';
            htmlStr += '      <div class="swMsgCont"></div>';
            htmlStr += '      <div class="sentHistCont">';
            htmlStr += '         <div class="sHistHeader">';
            htmlStr += '            <span class="histHeader"><span class="logsExpand">-</span>Message Logs</span>';
            htmlStr += '            <span class="histClose">x</span>';
            htmlStr += '         </div>';
            htmlStr += '         <div class="sentHistBody"></div>';
            htmlStr += '      </div>';
            htmlStr += '      <ul class="swInputCont">';
            htmlStr += '         <li><input type="text" class="swMobile" placeholder="Please enter the Mobile no" value="" /></li>';
            htmlStr += '         <li><textarea class="swMessage"></textarea></li>';
            htmlStr += '         <li><input type="button" class="smsButton swSend" value="Send" /></li>';
            htmlStr += '      </ul>';
            htmlStr += '   </div>';
            htmlStr += '   <div class="swFooter">';
            htmlStr += '   </div>';            
            htmlStr += '</div>';

            this.element.append(htmlStr);
            htmlStr = '';

            this.swElements = {
                mobile: $( this.element ).find('.swMobile'),
                msgArea: $( this.element ).find('.swMessage')
             };

            this._addHandlers();

            return this;
        },
        
        _addHandlers: function() {
            var that = this;
            $( this.element ).find('.swSend').click(function() {
                if (!that._validation()) {
                    return false;
                }
                that._sendMessage();             
            });

            $( this.element ).find('.sentHistory').click(function() {
                that._getSentMessages();
            });

            (this.swElements.msgArea).keyup(function() {
                //ui - Characters left show
                if ($(this).val().length > 160) {
                    $(this).val( ($(this).val()).substring(0, 160) );
                }
            });

            $( this.element ).find('.logsExpand').click(function() {
                if ($(this).text() == '-') {
                    $(this).text('+');
                } else {
                    $(this).text('-');
                }
                $( that.element ).find('.sentHistBody').toggle();
            });

            $( this.element ).find('.histClose').click(function() {
                $( that.element ).find('.sentHistCont').hide();
            });
        },

        _validation: function() {        
            if ( this.swElements.mobile.val() == '' || !this._validateMobile( this.swElements.mobile.val() ) ) {
                this.swElements.mobile.addClass('reqInput');
                return false;
            }

            if (this.swElements.msgArea.val() == '') {
                this.swElements.msgArea.addClass('reqInput');
                return false;
            }

            return true;
        },

        _validateMobile: function(mob) {
            var pat = /^((\+[1-9]{1,4}[ \-]*)|(\([0-9]{2,3}\)[ \-]*)|([0-9]{2,4})[ \-]*)*?[0-9]{3,4}?[ \-]*[0-9]{3,4}?$/;            
            if ( !pat.test( mob ) ) {
                return false;
            }

            return true;
        },

        _sendMessage: function() {
            var cleanTxt = $('<div/>').text( this.swElements.msgArea.val() ).html();
            var smsData = {
                toMobile: this.swElements.mobile.val(),
                fromMobile: this.options.from,
                smsTxt: cleanTxt
            };

            $.ajax({
                url: 'http://localhost:8008/send-message',
                type: 'post',
                dataType: 'json',
                data: smsData,
                context: this,
                success: function (data, status) {
                    if (data.status == 'sent') {
                        $(this.element).find('.swMsgCont').html('Message sent successfully').show();
                        //ToDo: populate data to History list
                    }
                    if (data.status == 'queued') {
                        $(this.element).find('.swMsgCont').html('Message is in queue').show();
                    }
                },
                error: function (xhr, desc, err) {
                    console.log(xhr);
                    console.log("Desc: " + desc + "\nErr:" + err);
                }
            });
        },

        _getSentMessages: function() {
            // ToDo: Filter by Date and update to existing list
            $.ajax({
                url: 'http://localhost:8008/get-sent-messages',
                type: 'get',
                dataType: 'json',
                context: this,
                success: function (data, status) {
                    this._renderSentMessages(data);
                },
                error: function (xhr, desc, err) {
                    console.log(xhr);
                    console.log("Desc: " + desc + "\nErr:" + err);
                }
            });
        },

        _renderSentMessages: function(messages) {
            var htmlStr = '';
            messages = messages.data;

            htmlStr += '<ul>';
            if ( messages.length != 0 ) {
                messages.forEach(function(msg) {
                    var pat = /^.*, (.*[0-9]{4}) ([0-9:]+) .*$/;
                    var cDate = pat.exec(msg.creationDate);
                    var mobile = msg.to;

                    if (msg.status == 'received') {
                        mobile = msg.from;
                    }

                    htmlStr += '<li>';
                    htmlStr += '  <div class="sHistInfo">';
                    htmlStr += '    <span class="sHistMobile '+msg.status+'">'+ mobile +'</span>';
                    htmlStr += '  </div>';
                    htmlStr += '  <div class="sHistDate">';
                    htmlStr += '     <span>'+ cDate[2] +'</span>';
                    htmlStr += '     <span>'+ cDate[1] +'</span>';
                    htmlStr += '  </div>';
                    htmlStr += '  <div class="clearfix"></div>';            
                    htmlStr += '  <p class="sHistMsg">'+ msg.smsTxt +'</p>';
                    htmlStr += '</li>';
                });
            }
            htmlStr += '</ul>';

            this.element.find('.sentHistBody').html('');
            this.element.find('.sentHistBody').append(htmlStr);
            this.element.find('.sentHistCont').show();
            htmlStr = '';

            return this;
        }
    });

    $(".smsWidgetCont").smswidget({
        'from': '+1 219-285-3160'
    });

});