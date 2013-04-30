
(function ($) {

    var $listview;

    var methods = {
        init: _initPlugin
        , getData: _exportData
        , hasChanged : _hasChanged
    };

    $.fn.JPTreeView = function (method) {

        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on JPTreeView');
        }

    };


    function _initPlugin(options) {

        if (options == null) options = {};
        var $wrap;

        var settings = $.extend({
            dataSource: _dummy
            , waitText: 'Retrieving Data'
            , failText: 'An Error Occurred'
            , viewRestricted: false
        }, options);

        return this.each(function () {

            //expected to be UL
            $listview = $(this);

   
            var id = $listview.attr('id');

            $wrap = $listview.wrap('<div class="treeview-wrapper" onselectstart="return false">').parent();
            $wrap.css('width', $listview.css('width')).css('height', $listview.css('height'));

            _goGetMoreNodes($listview, null);

        });


        function _createUL(nodes) {

            var $ul, $li;

            $ul = $('<ul class="treeview-node"></ul>');

            $(nodes).each(function () {
                var disabled = !((this.p == undefined) || (this.p));

                $li = $('<li></li>').attr('data-haschildren', this.c ? '1' : '0')
                    .attr('data-id', this.id)
                    .attr('data-status', (this.s == 1) ? 'checked' : (this.s == 0) ? 'unchecked' : 'mixed')
                    .attr('data-ostatus', (this.s == 1) ? 'checked' : (this.s == 0) ? 'unchecked' : 'mixed')
                    .attr('data-enabled', ((this.p == undefined) || (this.p)) ? 'true' : 'false')
                    .attr('data-cr', ((this.cr == undefined) || (!this.cr)) ? 'false' : 'true')
                    .addClass(disabled ? 'tv-disabled' : (this.s == 1) ? 'tv-checked' : (this.s == 0) ? 'tv-unchecked' : 'tv-mixed')
                    .attr('data-state', (this.s == 1) ? 'checked' : (this.s == 0) ? 'unchecked' : 'mixed')
                    .attr('data-ext', (this.x == undefined) ? '' : this.x)
                    .text(this.n);

                //if deep, traverse through children.
                if (this.ch && (this.ch.length > 0)) {
                    $li.append(_createUL(this.ch));
                }

                $ul.append($li);
            });


            return $ul;

        }

        function _dummy(parentNode, deep) {
            /*
                expects [ { id : 0, n : '', s : true, ch : null } ]
            */

            var parentId = null;
            if (parentNode) { parentId = parentNode.id; }

            if (parentId == null) {
                return [
                    { id: 1, n: 'Client 1', s: 1, p: false, c: false, ch: null }
                    , { id: 2, n: 'Client 2', s: 0, c: false, ch: null }
                    , { id: 3, n: 'this is shorter name', s: 0, c: false, ch: null }
                    , {
                        id: 4, n: 'Client 4', s: 0, cr: true, c: true, ch: [
                        { id: 10, n: 'Client 5', s: 0, c: false, ch: null }
                        , {
                            id: 11, n: 'Client 6', s: 0, cr: true, c: true, ch: [
                            { id: 10, n: 'Client 7', s: 0, c: false, ch: null }
                            , { id: 11, n: 'Client 8', s: 0, cr: true, c: true, ch: null }
                            ]
                        }
                        ]
                    }
                    , { id: 13, n: 'Client 13', s: 0, c: false, ch: null }
                    , { id: 14, n: 'Client 14', s: 0, c: false, p: false, ch: null }
                ];
            } else if (parentId == 11) {
                return [
                    { id: 12, n: 'Client 9', s: 0, c: false, ch: null }
                    , { id: 13, n: 'Client 10 is a really long name to test horiz scrolling', s: 0, c: true, p: false, ch: null }
                ];
            } else if (parentId == 13) {
                return [
                    { id: 14, n: 'Client 15', s: 0, c: false, p: false, ch: null }
                    , { id: 15, n: 'Client 16', s: 0, c: false, p: false, ch: null }
                ];
            }

        }


        function _init($item, isSubTree) {

            if ($item[0].tagName.toLowerCase() == 'ul') {

                //default to collapsed
                if (isSubTree) { $item.addClass('collapsed').addClass("innerNode"); }
                $item.addClass('treeview-node');


                $item.find('>li').each(function () { _init($(this), true); });

            } else if ($item[0].tagName.toLowerCase() == 'li') {

                var hasChildren = (($item.children().length) || ($item.attr('data-haschildren') == '1'));
                var $children = $item.children().remove();
                var content = $item.text();
                var enabled = $item.attr('data-enabled') == 'true';

                $item.text('');
                $item.attr('data-expanded', (hasChildren) ? 'collapsed' : 'empty').removeClass('tv-expanded tv-collapsed tv-empty')
                    .addClass((hasChildren) ? 'tv-collapsed' : 'tv-empty');

                $item.append($('<span class="icon_tv icon_tv_chevron"></span><span class="icon_tv icon_tv_check"></span>'))
                    .append($('<span class="content">' + content + '</span>'))
                    .append($children);

                $item.find('>ul').each(function () { _init($(this), true); });

                $item.on('click', '>.icon_tv_chevron', function () {

                    var $this = $(this);

                    var currentStatus = $(this).parent().attr('data-expanded');
                    if (!currentStatus) { currentStatus = 'empty'; }

                    switch (currentStatus) {
                        case 'empty': break;
                        case 'expanded':
                            var $subNode = $(this).parent().find('.treeview-node');
                            if ($subNode && ($subNode.length > 0)) {
                                $subNode.each(function () {
                                    $(this).hide('fast');
                                    $(this).parent().attr('data-expanded', 'collapsed').removeClass('tv-expanded tv-collapsed tv-empty').addClass('tv-collapsed');
                                });
                            }
                            $(this).parent().attr('data-expanded', 'collapsed').removeClass('tv-expanded tv-collapsed tv-empty').addClass('tv-collapsed');
                            break;
                        case 'collapsed':
                            var $node = $(this).parent();
                            var $subNode = $node.find('>.treeview-node');
                            if (!$subNode || ($subNode.length == 0)) {
                                if ($node.attr('data-haschildren') == '1') {

                                    _goGetMoreNodes($node, _exportData($node)[0]);

                                }



                            } else {
                                $subNode.show('fast');
                            }
                            $(this).parent().attr('data-expanded', 'expanded').removeClass('tv-collapsed tv-empty').addClass('tv-expanded');

                            break;
                        default:
                            alert('uh oh');
                    }
                });

                if (!enabled) {

                    if (!settings.viewRestricted) {
                        $item.find('> .content').text('Restricted');
                        $item.css('visibility', 'hidden').css('display', 'none');
                    } else {

                        $item.removeClass('tv-unchecked tv-mixed tv-checked').addClass('tv-disabled');
                    }

                } else {



                    $item.on('click', '>.content, >.icon_tv_check', function () {
                        var $node = $(this).parent();
                        var currentStatus = $node.attr('data-status');
                        if (!currentStatus) { currentStatus = 'unchecked'; }
                        

                        switch (currentStatus) {
                            case 'unchecked':
                                /*
                                    -select + all descendents
                                    -eval ancestors
                                */
                                _selectNode($node, 'checked', 0);
                                break;
                            case 'checked':
                                /*  -unselect + all descendents
                                    -eval ancestors
                                */
                                _selectNode($node, 'unchecked', 0);
                                break;
                            case 'mixed':
                                /*
                                    -same as 1
                                */

                                _selectNode($node, 'unchecked', 0);
                                break;

                            default: alert('uh oh');
                        }

                        $listview.trigger('onchange', [_exportData($node, false)[0], _hasChanged()]);

                    });
                }
            }






        };

        function _goGetMoreNodes($node, parent) {
            var $ul = $('<ul class="treeview-node innerNode"><li class="temp-node">' + settings.waitText + '</li></ul>');
            $node.append($ul);



            //need to get data from caller
            var result = settings.dataSource(parent);

            function _createDynNode(data, parent) {
                var $newNode = _createUL(data);
                $ul.replaceWith($newNode);

                _init($newNode, (parent != null));

    
                //if parent's selection has changed prior to expansion, than we need to update th children
                if (($node.attr('data-status') == 'checked') || ($node.attr('data-status') == 'unchecked')) {
                    var newState = $node.attr('data-status');
                    $newNode.find('>li').each(function () {
                        if ($(this).attr('data-enabled') == 'true') {
                            $(this).attr('data-status', newState).removeClass('tv-checked tv-unchecked tv-mixed').addClass('tv-' + newState);
                        }
                    });
                }
                $newNode.removeClass('collapsed');

            }

            if ((result.fail) && (typeof (result.fail) == 'function')) {

                result.fail(function () { $ul.find(' > li').text(settings.failText); });

            }

            //is a promise
            if ((result.done) && (typeof (result.done) == 'function')) {


                result.done(function (data, status, jqXHR) {

                    _createDynNode(data, parent);

                });
                //var f = result.done;
                //result.done = function (data, status, jqXHR) {

                //    _createDynNode(data, parent);

                //    f(data, status, jqXHR);
                //};

            } else {
                _createDynNode(result);
            }



        }

        function _selectNode(node, status, direction) {

            var myStatus = status;
            var myStatusDisplay = status;

            if (status == 'checked') {
                var hasRestrictedChildren = ((node.attr('data-cr') == 'true') || (node.find('li[data-enabled="false"]').length))
                myStatusDisplay = (hasRestrictedChildren) ? (settings.viewRestricted) ? 'mixed' : 'checked' : 'checked'
                //myStatusDisplay = myStatus;


            }
            if (node.attr('data-enabled') == 'false') {
                myStatusDisplay = 'disabled';
            }

            switch (direction) {
                case 0: //both


                    node.attr('data-status', myStatus).removeClass('tv-checked tv-unchecked tv-mixed').addClass('tv-' + myStatusDisplay);


                    node.find('> ul > li').each(function () { _selectNode($(this), status, -1); });
                    if (node.parent().parent()[0].tagName.toLowerCase() == 'li') { _selectNode(node.parent().parent(), status, 1); }
                    break;
                case 1: //upwards
                    //if all children are selected, set to 1, if none, -1, if some 0
                    //var childCount = node.find('> ul > li').length;
                    //var selectedCount = node.find('> ul > li[data-status="checked"]').length;
                    //var mixedCount = node.find('> ul > li[data-status="mixed"]').length;
                    //var enabledCount = (childCount - node.find('> ul > li[data-cr="true"]').length) - node.find('> ul > li[data-enabled="false"]').length;

                    var childCount = node.find('li').length;
                    var selectedCount = node.find('li[data-status="checked"]').length;
                    var mixedCount = node.find('li[data-status="mixed"]').length;
                    var disabledCount = node.find('li[data-enabled="false"]').length;


                    if ((selectedCount == 0) && (mixedCount == 0)) {
                        node.attr('data-status', 'unchecked').removeClass('tv-checked tv-unchecked tv-mixed').addClass('tv-unchecked');


                    } else if (selectedCount == childCount) {
                        node.attr('data-status', 'checked').removeClass('tv-checked tv-unchecked tv-mixed').addClass('tv-checked');

                    } else if ((!settings.viewRestricted) && (disabledCount > 0) && (childCount == (disabledCount + mixedCount + selectedCount))) {


                        node.attr('data-status', 'mixed').removeClass('tv-checked tv-unchecked tv-mixed').addClass('tv-checked');
                    } else if (mixedCount > 0) {
                        node.attr('data-status', 'mixed').removeClass('tv-checked tv-unchecked tv-mixed').addClass('tv-mixed');

                    } else {
                        node.attr('data-status', 'mixed').removeClass('tv-checked tv-unchecked tv-mixed').addClass('tv-mixed');

                    }

                    if (node.parent().parent()[0].tagName.toLowerCase() == 'li') { _selectNode(node.parent().parent(), status, 1); }

                    break;
                case -1:
                    if (node.attr('data-enabled') == 'true') {


                        var childCount = node.find('> ul > li').length;
                        node.attr('data-status', myStatus).removeClass('tv-checked tv-unchecked tv-mixed').addClass('tv-' + myStatusDisplay);
                        node.find('> ul > li').each(function () { _selectNode($(this), status, -1); });
                    }
                    break;
                default:
                    alert('uh oh');
            }

        }

    };



    function _exportData($node, deep) {


        var nodes = new Array();
        var $this = $(this);
        if ($node) {
            $this = $node;
        }


        if ($node[0].tagName.toLowerCase() == 'li') {
            nodes.push({
                id: $this.attr('data-id')
                , d: $this.attr('data-status') == 'checked'
                , x: $this.attr('data-ext')
                , c: (deep && ($this.find('> ul').length > 0)) ? _exportData($this.find('> ul'), deep) : null
            });
        } else {

            $this.find('> li').each(function () {
                nodes.push(_exportData($(this), deep));
            });
        }


        return nodes;

    };

    function _hasChanged() {
        if (!$listview) { $listview = $(this); }

        return $listview.find('li').filter(function (index) { return $(this).attr('data-status') != $(this).attr('data-ostatus'); }).length > 0;
    }

})(jQuery);
