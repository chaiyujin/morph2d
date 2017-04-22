var switch_item = (item, mode) => {
    var id = item.attr('id')
    if (item.length == 0) return
    var icon = item.children('.title').children('.icon')
    if (icon.children('span').length == 0) {
        item.removeClass('opened')
        item.addClass('closed')
        return
    }
    
    if (item.hasClass('closed') || mode == 'open') {
        // open
        item.removeClass('closed')
        item.addClass('opened')
        // change icon
        icon.html(OpenedIcon)
        // animate height
        item.children('.sub-level').show()
        // item.animate({height: 'auto'}, 'fast', () => {})
    }
    else if (item.hasClass('opened') || mode == 'close'){
        // close
        item.removeClass('opened')
        item.addClass('closed')
        // change icon
        icon.html(ClosedIcon)
        item.children('.sub-level').hide()
        // item.animate({height: 'auto'}, 'fast')
    }
}

const layer_template = '\
    <div id="#layer_id" class="level sub-level">\
        <div class="title clearfix">\
            <div class="icon fluid"></div>\
            <div class="txt fluid">#layer_name</div>\
        </div>\
    </div>'
