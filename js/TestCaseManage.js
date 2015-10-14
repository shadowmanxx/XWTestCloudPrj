/**
 * Created by Administrator on 2015/9/19.
 */

function GenerateTestCaseGrpHtmlEle(itemData){
  var template = $('<tr></tr>');

  //解析数据内容添加td标签
  var tdHtmlContent = '<td>'+itemData.ID+'</td>';

  //先按表头结构写死顺序
  tdHtmlContent+='<td>'+itemData.Name+'</td>';
  tdHtmlContent+='<td>'+itemData.Creator+'</td>';
  tdHtmlContent+='<td>'+itemData.Attr+'</td>';
  tdHtmlContent+='<td><a href="#">修改</a></td>';

  //将组合的td内容更新到tr中
  template.html(tdHtmlContent);
  template.find('a').attr('id','TestCaseGrp_' + itemData.ID);

  return template;
}

function GenerateTestCaseInGrpHtmlEle(itemData){

  var template = null;

  template = $('<p class="ui-draggable"><a class="btn btn-default center-block" href="#modal-container" \
                  data-toggle="modal" role="button" id="modal"><span>' + itemData.Name +
      '<button type="button" class="btn btn-default btn-xs remove pull-right"><span class="glyphicon glyphicon-trash">\
      </span></button></span></a></p>');

  return template;
}

function RegisterClickEvent(id,Usr){

    var href = null;
    var SubmitObj = {
      Name:"",
      Type:"",
      Usr:"",
      Desc:"",
      OperationTable:{}
    };

    $('#content').html(Usr.TaskGrpAddPage).hide().fadeIn(500);

    //根据新建操作类型，
    switch(id){
      case "ComponentCreate":
        $('#TestCaseManageTab').find("a[href=#TestCaseContent]").parent().remove();
        $('#TestCaseContent').remove();
        $('#TestCaseManageTab').find("a[href=#ComponentContent]").parent().remove();
        $('#ComponentContent').remove();
        $('#SubmitSection .panel-title').text("组件");
        break;
      case "TestCaseCreate":
        $('#TestCaseManageTab').find("a[href=#TestCaseContent]").parent().remove();
        $('#TestCaseContent').remove();

        $('#SubmitSection .panel-title').text("测试用例");
        break;
      case "TestCaseGrpCreate":
        $('#TestCaseManageTab').find("a[href=#AtomContent]").parent().remove();
        $('#AtomContent').remove();
        $('#TestCaseManageTab').find("a[href=#ComponentContent]").parent().remove();
        $('#ComponentContent').remove();
        $('#TestCaseManageTab').find("a[href=#TestCaseContent]").parent().addClass("active");
        $('#TestCaseManageContent div:first-child').addClass("in active");
        $('#SubmitSection .panel-title').text("测试用例组");
        break;
      default :
        break;
    }

    //注册标签页激活时，请求相应资源事件
    $("#TestCaseManageTab").children().each(function(){
      href = $(this).find("a").attr("href");
      switch (href){
        case "#AtomContent":
          $(this).on('show.bs.tab', function (e) {
            if($("#AtomContent").html() ===""){
              Usr.QueryAtomicOpe(AtomOperationLoaded);
            }
          });
          break;
        case "#ComponentContent":
          $(this).on('show.bs.tab', function (e) {
            if($("#ComponentContent").html() ==="") {
              Usr.QueryComponentLib(ComponentLibLoaded);
            }
          });
          break;
        case "#TestCaseContent":
          $(this).on('show.bs.tab', function (e) {
            if($("#TestCaseContent").html() ==="") {
              Usr.QueryTestCase(TestCaseLoaded);
            }
          });
          break;
        default :
          break;
      }

    });
    $("#TestCaseManageTab > li.active").tab("show");

    $('#drag-dropZone').droppable({
      activeClass: "ui-state-default",
      hoverClass: "ui-state-hover",
      accept: ":not(.ui-sortable-helper)",
      drop: function (e, ui) {
        $(this).find('h4').remove();
        var OperationType = ui.draggable.parent().attr("id").slice(0,-7);
        var OperationIndex = ui.draggable.index();
        var el = ui.draggable.clone();
        var OperationTable = SubmitObj.OperationTable;
        var List = null;
        var OperationObj = {};
        var EleId = OperationType + '_' + (OperationIndex+1);
        //增加测试用例点击事件
        el.find('a').attr({
          'href':'#',
          'id':EleId
        });
        switch (OperationType){
          case "Atom":
            List = Usr.AtomOperationList;
            //原子操作才可以修改参数
            el.find('a').attr({
              'href':'#modal-container',
              'data-toggle':'modal'
            });
            break;
          case "Component":
            //添加展开操作
            List = Usr.ComponetList;
            break;
          case "TestCase":
            List = Usr.TestCaseList;
            break;
        }
        //复制原始操作
        if(List.hasOwnProperty(OperationIndex+1)){
          $.extend(true,OperationObj,List[OperationIndex+1]);
          //操作存入要提交的操作序列中
          OperationTable[EleId] = OperationObj;
        }

        el.find('a').removeAttr("data-container data-placement data-content data-original-title title");
        var RemoveBtn = $('<button type="button" class="btn btn-default btn-xs remove pull-right"><span class="glyphicon glyphicon-trash"></span></button>');

        el.find('span').append(RemoveBtn);

        //TODO:动态修改原子操作参数名称
        el.click(function(e){
          //原子操作才允许修改参数
          if($(this).find("a").attr("data-toggle") === "modal"){
            var ParaItemTemplate = $('<div class="form-group">                                                  \
                                <label for="para1" class="col-sm-2 control-label"></label>         \
                                <div class="col-sm-6">                                                  \
                                  <input type="text" class="form-control" id="para1"                    \
                                     placeholder="">                                          \
                                </div>                                                                  \
                               </div>                                \
            ');
            var ParaItem = null;
            var flag = true;
            $("#modal-container h4.modal-title").text(OperationObj.Name);
            $("#modal-container form").html("");
            //添加原子操作参数到配置页面
            for(var item in OperationObj.CfgPara){
              if(OperationObj.CfgPara.hasOwnProperty(item)){
                ParaItem = ParaItemTemplate.clone();
                ParaItem.find("label").text(OperationObj.CfgPara[item].Name);
                ParaItem.find("input").attr("placeholder",OperationObj.CfgPara[item].Type);
                if(OperationObj.CfgPara[item].Val != null || OperationObj.CfgPara[item].Val != ""){
                  ParaItem.find("input").attr("value",OperationObj.CfgPara[item].Val);
                }
                $("#modal-container form").append(ParaItem);
              }
            }


            //保存配置，TODO:加入Jquery-validation校验表单
            $("#SavCfg").unbind("click").bind("click", function(event){
              event.stopPropagation();
              $("#modal-container form").find("input").each(function(index){

                if($(this).val() === "" && (OperationObj.CfgPara[index].Val === null|| OperationObj.CfgPara[index].Val ==="")){
                  $(this).parent().parent().fadeOut(500).fadeIn(500);
                  flag = false;
                  return;
                }
                OperationObj.CfgPara[index].Val = $(this).val();
              });
              if(true === flag){
                $('#modal-container').modal('hide');
              }
              else{
                flag = true;
              }
            });
          }
          else{
            //非原子操作，展开该操作包含的原子项
          }

        });
        $(RemoveBtn).unbind("click").bind("click", function(event) {
          //阻止事件传播，停止冒泡
          event.stopPropagation();
          $(this).parent().parent().parent().remove();
          OperationObj = {};
          OperationTable[EleId] = undefined;
        });

        $(this).append(el);
      }
    }).sortable({
      revert: true,
      receive: function () {
      },
      sort: function() {
        $( this ).removeClass( "active" );
      }
    });

    $('#TestCaseGrp_back').click(function(){
      window.open("TestCaseManage.html","_self");
    });

    //TODO:提交操作
    $('#TestCaseGrp_Submit').click(function(){

    });

    //用例组修改
   /* if(id != 'TestCaseGrp_Add'){

      var TestCaseGrpId = id.slice(id.indexOf('_')+1);
      var TestCaseGrpSelected = UsrObj.TestCaseGrpList[TestCaseGrpId];
      var Location = '#drag-dropZone';
      $(Location).find('h4').remove();

      for(var item in TestCaseGrpSelected.TestCaseList){
        var TestCase = TestCaseGrpSelected.TestCaseList[item];
        var template = GenerateTestCaseInGrpHtmlEle(TestCase);

        $(Location).append(template);
        template.find('button').unbind("click").bind("click", function(event) {
          //阻止事件传播，停止冒泡
          event.stopPropagation();
          $(this).parent().parent().parent().remove();
        });
      }
    }*/
}

function TestCaseGrpLoaded(e,Usr){

  var ResList = Usr.TestCaseGrpList;

  if(ResList.length === 0){
    return;
  }

  for(var item in ResList){
    var TestCaseGrp = ResList[item];
    var template = GenerateTestCaseGrpHtmlEle(TestCaseGrp);

    //添加到资源列表中
    $(template).appendTo('#TestCaseGrpTable');
    template.show(1000);

    template.find('a').click(function(event){
      RegisterClickEvent(event.toElement.id,Usr)
    });
  }

}

function TestCaseLoaded(TestCaseList){

  var template = null;

  for(var item in TestCaseList) {

    template = $('<p><a class="btn btn-default center-block" href="#" data-toggle="popover" role="button" data-container="body"\
                          data-placement="right" data-content=""><span></span></a></p>');
    template.find('a').attr('data-content',TestCaseList[item].Descp);
    template.find('span').text(TestCaseList[item].Name);
    $("#TestCaseContent").append(template);

    $("[data-toggle='popover']").popover({
      'trigger':'click hover'
    });

  }

  //注册拖拽事件
  $('#TestCaseContent p').draggable({
    helper: 'clone',
    //connectToSortable: "#drag-dropZone",
    opacity: 0.6,
    revert:'invalid'
  }).disableSelection();

}

function AtomOperationLoaded(AtomOperationList){

  var template = null;

  for(var item in AtomOperationList) {

    template = $('<p><a class="btn btn-default center-block" href="#" data-toggle="popover" role="button" data-container="body"\
                          data-placement="right" data-content=""><span></span></a></p>');
    template.find('a').attr('data-content',AtomOperationList[item].Descp);
    template.find('span').text(AtomOperationList[item].Name);
    $("#AtomContent").append(template);

    $("[data-toggle='popover']").popover({
      'trigger':'click hover'
    });

  }

  //注册拖拽事件
  $('#AtomContent p').draggable({
    helper: 'clone',
    //connectToSortable: "#drag-dropZone",
    opacity: 0.6,
    revert:'invalid'
  }).disableSelection();

}

function ComponentLibLoaded(ComponentLibList){

  var template = null;

  for(var item in ComponentLibList) {

    template = $('<p><a class="btn btn-default center-block" href="#" data-toggle="popover" role="button" data-container="body"\
                          data-placement="right" data-content=""><span></span></a></p>');
    template.find('a').attr('data-content',ComponentLibList[item].Descp);
    template.find('span').text(ComponentLibList[item].Name);
    $("#ComponentContent").append(template);

    $("[data-toggle='popover']").popover({
      'trigger':'click hover'
    });

  }

  //注册拖拽事件
  $('#ComponentContent p').draggable({
    helper: 'clone',
    //connectToSortable: "#drag-dropZone",
    opacity: 0.6,
    revert:'invalid'
  }).disableSelection();
}

function PageInit(){

  var TaskGrpAddPage = $(' \
     <div class="col-md-12">\
      <div class="btn-toolbar pull-right" role="toolbar">                                          \
        <div class="btn-group">                                                          \
          <button type="button" class="btn btn-default" id="TestCaseGrp_back">返回</button>  \
          <button type="button" class="btn btn-primary" id="TestCaseGrp_Submit">提交</button>  \
        </div>\
      </div> \
     </div>  \
      <div class="col-md-3 TestCasesPanel">\
        <ul id="TestCaseManageTab" class="nav nav-tabs">\
          <li class="active">\
            <a href="#AtomContent" data-toggle="tab">原子操作</a>\
          </li>\
          <li><a href="#ComponentContent" data-toggle="tab">组件</a></li>\
          <li><a href="#TestCaseContent" data-toggle="tab">测试用例</a></li>\
        </ul>\
        <div id="TestCaseManageContent" class="tab-content">\
          <div class="tab-pane fade in active well" id="AtomContent"></div> \
          <div class="tab-pane fade well" id="ComponentContent"></div>\
          <div class="tab-pane fade well" id="TestCaseContent"></div>\
        </div>         																															\
      </div>  \
      <div class="col-md-8 col-md-offset-1 TestCasesPanel">                         \
        <div class="row">                                                                 \
            <div class="col-md-12">                                                                    \
              <div class="panel panel-primary" id="SubmitSection">                                                       \
                <div class="panel-heading">                                                           \
                  <h3 class="panel-title">测试用例组</h3>                                             \
                </div>                                                                                \
                <div class="panel-body" id="drag-dropZone">                                           \
                  <h4 class="center-block">\
                  <small>请拖拽至此</small>\
                  </h4>                          \
                </div>                                                                                 \
              </div>                                                                                   \
            </div> \                                                                                                                   \
        </div> \
      <div class="modal fade" id="modal-container" role="dialog" aria-labelledby="TestCaseModalLabel" aria-hidden="true">\
        <div class="modal-dialog">                                                        \
          <div class="modal-content">                                                     \
            <div class="modal-header">																										\
              <button type="button" class="close" data-dismiss="modal" aria-hidden="true">\
                ×                                                                        \
              </button>                                                                   \
              <h4 class="modal-title" id="TestCaseModalLabel">                            \
                用例参数配置                                                              \
              </h4>                                                                       \
            </div>                                                                        \
            <div class="modal-body">                                                      \
              <form class="form-horizontal" role="form">                                  \
              </form>                                                                     \
            </div>                                                                        \
            <div class="modal-footer">                                                    \
                                                                                                    \
              <button type="button" class="btn btn-default" data-dismiss="modal">         \
                关闭                                                                      \
              </button>                                                                   \
              <button type="button" class="btn btn-primary" id="SavCfg">                              \
                保存配置                                                                  \
                </button>																																		 \
            </div>                                                                         \
          </div>                                                                           \
                                                                                                     \
        </div>                                                                             \
                                                                                                     \
      </div>                                                                               \
  ');

  var Usr = new UsrObj($.cookie('username'),$.cookie('xwsessionid'));
  Usr.TaskGrpAddPage = TaskGrpAddPage;

  Usr.QueryTestCaseGrp();

  //页面控件事件注册
  $('#Create').click(function(event) {
    RegisterClickEvent(event.toElement.id,Usr);
  });


}


$(document).on('DocReady',PageInit);
$(document).on('TestCaseGrpLoaded',TestCaseGrpLoaded);