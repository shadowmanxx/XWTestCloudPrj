/**
 * Created by Administrator on 2015/9/19.
 */

function QueryTestCaseGrp(){


  var contentTypeStr = 'application/json;charset=UTF-8';
  var urlpara = '';

  urlpara = '/front/testgroup/list?all=1';

  $.ajax({
    type:"GET",
    url:urlpara,
    cache:false,
    dataType:'json',
    contentType:contentTypeStr,
    context:this,
    success:function(TestGrpObj){
      var TestCaseGrpIndx = 1;
      if(TestGrpObj.result !=0 || TestGrpObj.message != 'success'){
        return;
      }

      if(this.TestCaseGrpList.length !=0){
        this.TestCaseGrpList = [];
      }
      if(TestGrpObj.testgroup.length === 0){
        console.log('testgroup is empty');
        return;
      }
      //向Usr中添加用例组
      for(var item in TestGrpObj.testgroup){
        var TestCaseGrpItem = TestGrpObj.testgroup[item];
        var TestCaseGrp = new TestCaseGrpObj(TestCaseGrpIndx,TestCaseGrpItem.name,TestCaseGrpItem.user,TestCaseGrpItem.type,TestCaseGrpItem.desc,TestCaseGrpItem.id);
        this.TestCaseGrpList[TestCaseGrpIndx] = TestCaseGrp;
        ++TestCaseGrpIndx;

        if(TestCaseGrpItem.testcase.length ===0){
          console.log('TestCaseGrp_'+item+'\'s testcase is empty');
          continue;
        }

        //向用例组添加测试用例
        for(var testcase_item in TestCaseGrpItem.testcase){
          var TestCaseIndx = 1;
          var TestCaseItem = TestCaseGrpItem.testcase[testcase_item];
          var TestCase = new TestCaseObj(TestCaseIndx,TestCaseItem.name,TestCaseItem.user,TestCaseItem.desc,TestCaseItem.id);
          TestCaseGrp.AddTestCase(TestCase);
          ++TestCaseIndx;

          if(TestCaseItem.argv.length ===0){
            console.log('TestCaseGrp_'+item+'\'s testcase_'+testcase_item+'args is empty');
            continue;
          }
          //向用例中添加参数
          for(var argvs in TestCaseItem.argv){
            TestCase.AddPara(TestCaseItem.argv[argvs].name,TestCaseItem.argv[argvs].value,TestCaseItem.argv[argvs].comment);
          }
        }
      }

      this.ParseTestCaseGrp();
    },
    error: function() {
      console.log("QueryTestCaseGroup Error!");
    }
  });

}

function RegisterClickEvent(id){

    var contentTypeStr = 'application/json;charset=UTF-8';
    var urlpara = '';
    urlpara = '/front/testcase/list?all=1';
    $('#content').html(this.TaskGrpAddPage).hide().fadeIn(1000);

     $.ajax({
     type:"GET",
     url:urlpara,
     cache:false,
     dataType:'json',
     contentType:contentTypeStr,
     context:this,
     success:function(TestCaseList){
       var TestCaseIndx = 1;
       if(TestCaseList.result !=0 || TestCaseList.message != 'success'){
        return;
       }

       if(TestCaseList.testcase.length ===0){
         console.log('testcase is empty');
         return;
       }

       for(var item in TestCaseList.testcase){
         var TestCaseItem = TestCaseList.testcase[item];
         var TestCase = new TestCaseObj(TestCaseIndx,TestCaseItem.name,TestCaseItem.user,TestCaseItem.desc,TestCaseItem.id);
         TestCase.UI.GenerateAndParseTestCase(TestCase.Location,TestCase);
         this.TestCaseList[TestCaseIndx] = TestCase;
         ++TestCaseIndx;

         //TODO:向TestCase增加参数
       }

       $("[data-toggle='popover']").popover({
         'trigger':'click hover'
       });

       //注册拖拽事件
       $('#drag-items p').draggable({
         helper: 'clone',
         //connectToSortable: "#drag-dropZone",
         opacity: 0.6,
         revert:'invalid'
       }).disableSelection();

       $('#drag-dropZone').droppable({
         activeClass: "ui-state-default",
         hoverClass: "ui-state-hover",
         accept: ":not(.ui-sortable-helper)",
         drop: function (e, ui) {
           $(this).find('h4').remove();
           var el = ui.draggable.clone();
           el.find('a').removeAttr("data-container data-placement data-content data-original-title title");
           var RemoveBtn = $('<button type="button" class="btn btn-default btn-xs remove pull-right"><span class="glyphicon glyphicon-trash"></span></button>');

           el.find('span').append(RemoveBtn);
           //增加测试用例点击事件
           el.find('a').attr({
             'href':'#modal-container',
             'data-toggle':'modal'
           });
           $(RemoveBtn).unbind("click").bind("click", function(event) {
             //阻止事件传播，停止冒泡
             event.stopPropagation();
             $(this).parent().parent().parent().remove();
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

     },
     error: function() {
      console.log("QueryTestCaseGroup Error!");
     }
     });


    $('#TestCaseGrp_back').click(function(){
      window.open("TestCaseManage.html","_self");
    });

    //TODO:提交用例组操作
    $('#TestCaseGrp_Submit').click(function(){

    });

    //用例组修改
    if(id != 'TestCaseGrp_Add'){

      var TestCaseGrpId = id.slice(id.indexOf('_')+1);
      var TestCaseGrpSelected = this.TestCaseGrpList[TestCaseGrpId];
      var Location = '#drag-dropZone';
      $(Location).find('h4').remove();

      for(var item in TestCaseGrpSelected.TestCaseList){
        var TestCase = TestCaseGrpSelected.TestCaseList[item];
        var template =  TestCase.UI.GenerateAndParseTestCase(Location,TestCase);
        template.find('button').unbind("click").bind("click", function(event) {
          //阻止事件传播，停止冒泡
          event.stopPropagation();
          $(this).parent().parent().parent().remove();
        });
      }
    }
}

function ParseTestCaseGrp(){

  var ResList = this.TestCaseGrpList;
  var Context = this;

  if(ResList.length === 0){
    return;
  }

  for(var item in ResList){
    var TestCaseGrp = ResList[item];
    template = TestCaseGrp.UI.GenerateAndParseTestCaseGrp(TestCaseGrp.Location,TestCaseGrp);
    template.find('a').click(function(event){
      Context.RegisterClickEvent(event.toElement.id)
    });
  }

}

function PageInit(){

  var TaskGrpAddPage = $(' \
     <div class="col-md-12">\
      <div class="btn-toolbar pull-right" role="toolbar">                                          \
        <div class="btn-group">                                                          \
          <button type="button" class="btn btn-default" id="TestCaseGrp_back">返回</button>  \
          <button type="button" class="btn btn-primary" id="TestCaseGrp_Submit">提交用例组</button>  \
        </div>\
      </div> \
     </div>  \
      <div class="col-md-4 TestCasesPanel">   																															\
        <div class="panel panel-default">                                               \
          <div class="panel-heading">                                                   \
            <h3 class="panel-title">测试用例</h3>                                       \
          </div>                                                                        \
          <div class="panel-body" id="drag-items">																			\
          </div>          \
        </div>\
      </div>\                                                                                                \
      <div class="col-md-8 TestCasesPanel">                                                            \
          <div class="row">                                                                 \
            <div class="col-md-12">                                                                    \
              <div class="panel panel-primary">                                                       \
                <div class="panel-heading">                                                           \
                  <h3 class="panel-title">测试用例组</h3>                                             \
                </div>                                                                                \
                <div class="panel-body" id="drag-dropZone">                                           \
                  <h4 class="center-block">\
                  <small>请拖拽用例组至此</small>\
                  </h4>                          \
                </div>                                                                                 \
              </div>                                                                                   \
            </div> \
          </div>                                                                                      \                                                                                                           \
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
                <div class="form-group">                                                  \
                  <label for="para1" class="col-sm-2 control-label">参数1</label>         \
                    <div class="col-sm-6">                                                  \
                      <input type="text" class="form-control" id="para1"                    \
                                     placeholder="默认值">                                          \
                    </div>                                                                  \
                </div>                                                                    \
                <div class="form-group">                                                  \
                  <label for="para2" class="col-sm-2 control-label">参数2</label>         \
                  <div class="col-sm-6">                                                  \
                    <input type="text" class="form-control" id="para2"                    \
                                     placeholder="默认值">                                          \
                  </div>                                                                  \
                </div>                                                                    \
              </form>                                                                     \
            </div>                                                                        \
            <div class="modal-footer">                                                    \
                                                                                                    \
              <button type="button" class="btn btn-default" data-dismiss="modal">         \
                关闭                                                                      \
              </button>                                                                   \
              <button type="button" class="btn btn-primary">                              \
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
  Usr.TestCaseGrpList = [];
  Usr.TestCaseList = [];
  Usr.TaskGrpAddPage = TaskGrpAddPage;
  Usr.QueryTestCaseGrp = QueryTestCaseGrp;
  Usr.ParseTestCaseGrp = ParseTestCaseGrp;
  Usr.RegisterClickEvent = RegisterClickEvent;

  Usr.QueryTestCaseGrp();

  //页面控件事件注册
  $('#TestCaseGrp_Add').click(function(event) {
    Usr.RegisterClickEvent(event.toElement.id);
  });



}

function PageDestroy(){
  //SaveObjToCookie('UsrObj',Usr);
}

$(document).on('DocReady',PageInit);
$(document).on('WindowDestroy',PageDestroy);

