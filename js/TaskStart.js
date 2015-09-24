/**
 * Created by Administrator on 2015/9/15.
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
      }

      this.ParseTestCaseGrp();
    },
    error: function() {
      console.log("QueryTestCaseGroup Error!");
    }
  });

}

function ParseTestCaseGrp(){

  var ResList = this.TestCaseGrpList;

  if(ResList.length === 0){
    return;
  }

  for(var item in ResList){
    var TestCaseGrp = ResList[item];
    var template = $('<label></label>');
    template.attr('for','TestCaseGrp_'+TestCaseGrp.ID);
    template.html('<input>'+TestCaseGrp.Name);
    template.children().attr({
      'type':'radio',
      'name':'TestCaseGrp',
      'value':TestCaseGrp.ID,
      'ID':'TestCaseGrp_'+TestCaseGrp.ID
    });

    $('#TestCaseGrp_body').append(template);
  }

}

function PageInit(){

  var ResId = $.getURLParam('ResId');
  var MajorId = $.getURLParam('MajorId');
  var MinorId = $.getURLParam('MinorId');
  var Res = null;

  if(ResId == null || MajorId == null || MinorId == null)
  {
    alert('请选择测试设备');
    window.open("homepage.html","_self");
  }
  Res = new SimResource(ResId,MajorId,MinorId);
  //添加测试用例组
  var Usr = new UsrObj($.cookie('username'),$.cookie('xwsessionid'));
  Usr.TestCaseGrpList = [];
  Usr.QueryTestCaseGrp = QueryTestCaseGrp;
  Usr.ParseTestCaseGrp = ParseTestCaseGrp;

  Usr.QueryTestCaseGrp();
  $('#BeginTest').click(function(){
    if($('#TestCaseGrp_body input:checked').val() == null){
      $('#TestCaseGrp').removeClass("panel-default").addClass("panel-danger").fadeOut(500).fadeIn(500);
      return;
    }

    Res.CreateTask();
    $('#TestCaseGrp').hide(1000);
    $('#UploadFile').parent().hide(1000);
    $(this).button('loading');
    var TaskStartBtnContext = this;
    //任务执行结束后动作
    $(document).on('CurTaskEnd',function(){
      $(TaskStartBtnContext).button('reset');
    });
  });
}
function PageDestroy(){
  //SaveObjToCookie('UsrObj',Usr);
}

$(document).on('DocReady',PageInit);
$(document).on('WindowDestroy',PageDestroy);