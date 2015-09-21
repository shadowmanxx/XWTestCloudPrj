/**
 * Created by Administrator on 2015/9/19.
 */

function PageInit(){

  $('#drag-items p').draggable({
    appendTo: 'body',
    helper: 'clone',
    cursor: "crosshair",
    opacity: 0.6
  });

  $('#drag-dropZone').droppable({
    activeClass: "ui-state-default",
    hoverClass: "ui-state-hover",
    accept: ":not(.ui-sortable-helper)",
    drop: function (e, ui) {
      $(this).find('h4').remove();
      var el = ui.draggable.clone();
      var remove = $('<button type="button" class="btn btn-default btn-xs remove pull-right"><span class="glyphicon glyphicon-trash"></span></button>');

      el.find('span').append(remove);
      //增加测试用例点击事件
      el.find('a').attr({
          'id':'modal',
          'href':'#modal-container',

        });
      $(remove).unbind("click").bind("click", function(event) {
        //阻止事件传播，停止冒泡
        event.stopPropagation();
        $(this).parent().parent().detach();
      });

      $(this).append(el);
    }
  }).sortable({
    items: '.drop-item',
    sort: function() {
      $( this ).removeClass( "active" );
    }
  });
}
function PageDestroy(){
  //SaveObjToCookie('UsrObj',Usr);
}

$(document).on('DocReady',PageInit);
$(document).on('WindowDestroy',PageDestroy);

