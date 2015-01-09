$(function() {

    $.widget("ui.smswidget", {
        options: {
        },
        
        _create: function() {
            this._renderUI();
        },
        
        _renderUI: function() {
            var wThis = this.element;
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
            htmlStr += '            <span class="histClose"></span>';
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

            this._addHandlers();

            return this;
        },
        
        _addHandlers: function() {
            var that = this;
            $( this.element ).find('.swSend').click(function() {
                that._validation();
                that._sendMessage();
            });

            $( this.element ).find('.sentHistory').click(function() {
                that._getSentMessages();
            });
        },

        _validation: function() {
            return;
        },

        _sendMessage: function() {
            var smsData = {
                toMobile: $( this.element ).find('.swMobile').val(),
                smsTxt: $( this.element ).find('.swMessage').val()
            };

            $.ajax({
                url: 'http://localhost:8008/send-message',
                type: 'post',
                dataType: 'json',
                data: smsData,
                context: this,
                success: function (data, status) {
                    $(this.element).find('.swMsgCont').html(data).show();
                },
                error: function (xhr, desc, err) {
                    console.log(xhr);
                    console.log("Desc: " + desc + "\nErr:" + err);
                }
            });
        },

        _getSentMessages: function() {
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
                        mobile = msg.to;
                    }

                    htmlStr += '<li>';
                    htmlStr += '  <div class="sHistInfo">';
                    htmlStr += '    <span class="sHistMobile">'+ mobile +'</span>';
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
        },
        
        _setOption: function(key, value) {
            switch (key) { 
                case "title":
                    break; 
                case "color":
                    break; 
            }
        }
    });

    $(".smsWidgetCont").smswidget();

});