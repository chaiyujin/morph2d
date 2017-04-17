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

var switch_item_id = (id, mode) => {
    var item = $("#" + id)
    switch_item(item, mode)
}

var calculate_depth = (item) => {
    var depth = 0
    if (!item.hasClass('level')) {
        item = item.parent().closest('.level')
    }
    // invalid id
    if (item.length == 0) return -1
    while (true) {
        var prev = item.parent().closest('.level')
        if (prev.length == 0) break
        item = prev
        depth += 1
    }
    return depth
}

var calculate_depth_id = (id) => {
    var item = $("#" + id);
    return calculate_depth(item)
}

const layer_template = '\
    <div id="#layer_id" class="level sub-level">\
        <div class="title clearfix">\
            <div class="icon fluid"></div>\
            <div class="txt fluid">#layer_name</div>\
        </div>\
    </div>'

var add_icon = (id) => {
    var item = $("#" + id);
    if (!item.hasClass('level')) {
        item = item.parent().closest('.level')
    }
    if (item.length == 0) { console.log('fail to add icon'); return }

    // update icon
    item.children('.title').children('.icon').html(OpenedIcon)
    switch_item(item, 'open')
}

var update_tree_menu = (tree_menu, item_id, father_id) => {
    tree_menu[item_id] = 0
}

var add_item = (item_id, item_name, father_id) => {
    depth = calculate_depth_id(father_id) + 1
    if (depth <= 0) return false
    // update g_tree_menu
    update_tree_menu(g_tree_menu, item_id, father_id)
    var new_txt = layer_template.replace(/#layer_id/, item_id).replace(/#layer_name/, item_name)
    // new html
    $("#" + father_id).append(new_txt)
    // add icon
    add_icon(father_id)
    // padding
    var padding = (5 + depth * 16);
    var width = 250 - padding - 16
    $("#" + item_id).children('.title').css('padding-left', padding + 'px')
    $("#" + item_id).children('.title').children('.txt').css('width', width + 'px')
    return true
}

var add_layer = (item_name, father_name) => {
    var item_id = 'layer_' + item_name
    var father_id = 'layers'
    if (father_name)
        father_id = 'layer_' + father_name
    if (g_tree_menu[father_id] === undefined) {
        alert('No such father layer.')
        return false
    }
    if (g_tree_menu[item_id] === undefined) {
        var res = add_item(item_id, item_name, father_id)
        if (item_name == BackgroundName) {
            $("#" + item_id).insertBefore("#layer_" + TextureName);
        }
        else if (item_name == TextureName) {
            $("#" + item_id).insertAfter("#layer_" + BackgroundName);
        }
        else {
            $("#" + item_id).insertBefore("#layer_" + TextureName);
            $("#" + item_id).insertAfter("#layer_" + BackgroundName);
        }
        return res
    }
    else
        return false
}

var add_morph = (item_name) => {
    var item_id = 'morph_' + item_name
    if (g_tree_menu[item_id] === undefined) {
        var res = add_item(item_id, item_name, 'morph')
        if (res) {
            // $("#" + item_id).append("en")
        }
        return res
    }
    else
        return false
}

var remove_id_from_menu = (id) => {
    var root = $('#' + id).closest('.first-level')
    $('#' + id).remove()
    if (root.children('.sub-level').length == 0) {
        root.children('.title').children('.icon').html('')
    }
    // if (root.height())
    delete g_tree_menu[id]
}