// localStorage wrapper
var ls = (function() {

    var set = function(key, value) {
        localStorage.setItem(key, JSON.stringify({
            value: value
        }));
    };

    var get = function(key) {
        var str = localStorage.getItem(key);
        if (str) {
            return JSON.parse(str).value;
        } else {
            return null;
        }
    };

    var remove = function(key) {
        localStorage.removeItem(key);
    };    

    return {
        set: set,
        get: get, 
        remove: remove,
        clear: localStorage.clear
    }

}());

(function($) {
    $.fn.addListItems = function() {
        var that = this;

        addItemHandler();

        function addItemHandler() {
            var addBut = $(that).find('.addItem');
            var list = that.find('ul');

            addBut.click(function() {
                var className = 'leftList';
                if ( $(this).parent().hasClass('listContRight') ) {
                    className = 'rightList';
                }
                list.append('<li class="'+className+'"></li>').attr('contenteditable', 'true');
            });
        }

        return that;
    };
}(jQuery));


var listObj = listObj || {};

(function($) {

    listObj.store = {
        saveLists: function() {
            this.validateLists();

            this._saveLists();
        },

        validateLists: function() {
            var msg = '';

            if ( $('.leftList li').length == 0 ) {
                msg += '<span>Please add items to the LEFT list</span>';
            }

            if ( $('.rightList li').length == 0 ) {
                msg += '<span>Please add items to the RIGHT list</span>';
            }
            
            if ( $('.leftList li').length != 0 && $('#leftAllowed').val() > $('.leftList li').length ) {
                msg += '<span>"LEFT Items" should not be greater than the items from LEFT List</span>';
            }

            if ( $('.rightList li').length != 0 && $('#rightAllowed').val() > $('.rightList li').length ) {
                msg += '<span>"RIGHT Items" Should not be greater than the items from RIGHT List</span>';
            }            

            if ( msg != '' ) {                
                listObj.ui.showMessage(msg);
            }
        },

        _saveLists: function() {
            var leftArr = this.getListArray('.leftList');
            var rightArr = this.getListArray('.rightList');

            ls.set('leftList', leftArr);
            ls.set('rightList', rightArr);

            ls.set('leftAllowed', $('#leftAllowed').val() );
            ls.set('rightAllowed', $('#rightAllowed').val() );

            ls.set('configured', '1');
        },

        getListArray: function(elemList) {
            var arr = [];
            $(elemList).find('li').each(function( index ) {
                arr.push( $(this).text() );
            });

            return arr;
        },

        renderLists: function() {
            this.createLists('leftList');
            this.createLists('rightList');
        },

        createLists: function(flag) {
            var listArr = ls.get(flag);
            var listStr = '';

            for (var i=0; i<listArr.length; i++) {
                listStr += '<li class="'+flag+'">'+ listArr[i] +'</li>';
            }

            $('.' + flag).html( listStr );
        },

        clearLists: function() {
            ls.remove('leftList');
            ls.remove('rightList');
            ls.remove('leftAllowed');
            ls.remove('rightAllowed');
            ls.remove('configured');
        }
    };

    listObj.ui = {
        initListConfigure: function() {
            $('.listContLeft').addListItems();
            $('.listContRight').addListItems();

            $('.configDone').click(function() {
                listObj.store.saveLists();
                document.location.reload();
            });
        },

        showMessage: function(msg) {
            $('.messageCont').html( msg ).show(0).delay(2000).hide(0);
        },

        addResetHandler: function() {
            $('.resetAll').click(function() {
                listObj.store.clearLists();
                document.location.reload();
            });
        },

        renderListItems: function() {
            if ( ls.get('configured') != 1 ) {
                this.initListConfigure();
            } else {
                $('.listContLeft, .listContRight').css('margin-top', '0');
                $('.addItem, .itemAddCont, .configDone, .listConfig').hide();
                $('.resetAll').show();
                listObj.store.renderLists();

                this.initDragDrop();
                this.initDblClick();
            }
        },

        initDragDrop: function() {
            $('.listCont ul').sortable({
                connectWith: '.listCont ul',
                placeholder: 'placeholder',

                receive: function( e, ui ) {
                    if ( ui.item.parent().hasClass('middleList') ) {
                        if ( $( 'ul.middleList .leftList' ).length > $('#leftAllowed').val() ) {
                            $(ui.sender).sortable('cancel');
                            listObj.ui.showMessage('<span>Only '+$('#leftAllowed').val()+' allowed from LEFT list</span>');
                        }

                        if ( $( 'ul.middleList .rightList' ).length > $('#rightAllowed').val() ) {
                            $(ui.sender).sortable('cancel');
                            listObj.ui.showMessage('<span>Only '+$('#rightAllowed').val()+' allowed from RIGHT list</span>');
                        }
                    }

                    if ( ui.item.parent().hasClass('leftList') && ui.item.hasClass('rightList') ) {
                        $(ui.sender).sortable('cancel');
                    }

                    if ( ui.item.parent().hasClass('rightList') && ui.item.hasClass('leftList') ) {
                        $(ui.sender).sortable('cancel');
                    }
                }
            });
        },

        initDblClick: function() {
            $( 'ul.leftList' ).dblclick(function(event) {
                var target = $( event.target );
                if ( target.is( 'li' ) ) {
                    if ( $( 'ul.middleList .leftList' ).length == $('#leftAllowed').val() ) {
                        listObj.ui.showMessage('<span>Only '+$('#leftAllowed').val()+' allowed from LEFT list</span>');
                    }

                    if ( $( 'ul.middleList .leftList' ).length < $('#leftAllowed').val() ) {
                        $( 'ul.middleList' ).append( target );
                    }
                }
            });

            $( 'ul.rightList' ).dblclick(function(event) {
                var target = $( event.target );
                if ( target.is( 'li' ) ) {
                    if ( $( 'ul.middleList .rightList' ).length == $('#rightAllowed').val() ) {
                        listObj.ui.showMessage('<span>Only '+$('#rightAllowed').val()+' allowed from RIGHT list</span>');
                    }

                    if ( $( 'ul.middleList .rightList' ).length < $('#rightAllowed').val() ) {
                        $( 'ul.middleList' ).append( target );
                    }
                }
            });

            $( 'ul.middleList' ).dblclick(function(event) {
                var target = $( event.target );
                if ( target.is( 'li' ) ) {
                    if ( target.hasClass('leftList') ) {
                        $( 'ul.leftList' ).append( target );
                    } else {
                        $( 'ul.rightList' ).append( target );
                    }
                }
            });
        },

        init: function() {
            this.renderListItems();
            this.addResetHandler();
        }
    }

})(jQuery);          

jQuery(document).ready(function(){
    listObj.ui.init();
});    