/**
 * Created by Administrator on 2015/9/19.
 */

define(function(require){
  var $ = require('jquery'),
      Usr = require("obj/UserObj"),
      validator = null,
      TaskGrpAddPage = $(' \
       <div class="col-md-12">\
        <div class="btn-toolbar pull-right" role="toolbar">                                          \
          <div class="btn-group">                                                          \
            <button type="button" class="btn btn-default" id="Back">返回</button>  \
            <button type="button" class="btn btn-primary" id="Submit">提交</button>  \
          </div>\
        </div> \
       </div>  \
        <div class="col-md-3 TestCasesPanel">\
          <ul id="TestCaseManageTab" class="nav nav-tabs">\
            <li class="">\
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

  require("jquery_ui");
  require("jquery_validate");
  require("bootstrap");

  $(function(){

    $("#TestCaseManageTabHomepage").children().each(function(){
      var href = $(this).find("a[data-toggle=tab]").attr("href");
      var Type = "";

      switch (href){
        case "#AtomContent":
          Type = "Atom";
          break;
        case "#ComponentContent":
          Type = "Component";
          break;
        case "#TestCaseContent":
          Type = "TestCase";
          break;
        case "#TestCaseGrpContent":
          Type = "TestCaseGrp";
          break;
        default :
          break;
      }
      if(Type === "Atom"){
        $(this).children("a[data-toggle=tab]").on('show.bs.tab', function (e) {
          $("#Create").attr("disabled","disabled");
          if($.trim($(href +" tbody").html()) ===""){
            Usr.Query(MainPageResLoaded,Type);
          }
        });
        $(this).children("a[data-toggle=tab]").on('hide.bs.tab', function (e) {
          $("#Create").removeAttr("disabled");
        });
      }
      else{
        $(this).children("a[data-toggle=tab]").on('show.bs.tab', function (e) {
          if($.trim($(href +" tbody").html()) ===""){
            Usr.Query(MainPageResLoaded,Type);
          }
        });
      }

    });

    $("#TestCaseManageTabHomepage > li:eq(0) > a").tab("show");

    //页面控件事件注册
    $('#Create').click(function(event) {
      var ModuleActive = $("#TestCaseManageTabHomepage > li.active a").attr("href");
      var ModuleId = "";
      switch (ModuleActive){
        case "#ComponentContent":
          ModuleId = "ComponentCreate";
          break;
        case "#TestCaseContent":
          ModuleId = "TestCaseCreate";
          break;
        case "#TestCaseGrpContent":
          ModuleId = "TestCaseGrpCreate";
          break;
        default :
          break;
      }
      //TODO:重构

      RegisterClickEvent(ModuleId);
    });
    $("#Refresh").click(function () {
      window.open("TestCaseManage.html","_self");
    });
  });

  function IsSubmitSectionEmpty(){
    var content = $("#drag-dropZone").children("p.ui-draggable");
    if(content.length ===0){
      return true;
    }
    else{
      return false;
    }
  }

  function GenerateTableHtmlEle(Type,itemData){
    var template = $('<tr></tr>');

    //解析数据内容添加td标签
    var tdHtmlContent = '<td>'+itemData.ID+'</td>';

    //先按表头结构写死顺序
    tdHtmlContent+='<td>'+itemData.Name+'</td>';
    tdHtmlContent+='<td>'+itemData.Creator+'</td>';
    tdHtmlContent+='<td>'+itemData.Type+'</td>';
    if(Type !== "Atom" ){
      tdHtmlContent+='<td><a href="#">修改</a></td>';
      tdHtmlContent+='<td><a href="#">删除</a></td>';
    }

    //将组合的td内容更新到tr中
    template.html(tdHtmlContent);

    return template;
  }

  function GenerateTestCaseInGrpHtmlEle(itemData){

    var template = null;

    template = $('<p class="ui-draggable"><a class="btn btn-default center-block" href="#" \
                   role="button" id="modal"><span>' + itemData.Name +
      '<button type="button" class="btn btn-default btn-xs remove pull-right"><span class="glyphicon glyphicon-trash">\
      </span></button></span></a></p>');

    return template;
  }

  function GenerateDropdownContent(AtomOperationList){
    var ItemContainer = $('<ul class="dropdown-menu" role="menu"></ul>'),
      ItemLoop = null,
      Atom = null,
      ItemTemplate = $('<li><a href="#"></a></li>');

    for(ItemLoop in AtomOperationList){
      if(AtomOperationList.hasOwnProperty(ItemLoop)){
        Atom = AtomOperationList[ItemLoop];
        ItemTemplate.find("a").text(Atom.Name);
        ItemContainer.append(ItemTemplate.clone());
      }
    }

    return ItemContainer;
  }

  function CfgElePara(el,OperationType,OperationObj,EleId){

    var ItemContainer  =null;
    //增加测试用例点击事件
    if(OperationType === "Atom"){
      el.find('a').attr({
        'data-toggle':"modal",
        'data-target':"#modal-container"
      }).addClass("btn-danger");

      el.find("a.btn").click(function(e){

        ParseAtomParaToModalPage(OperationObj);
        if(validator !==null){
          validator.settings.submitHandler = FormSubmitHandler;
          validator.settings.rules = OperationObj.validate.rules;
          validator.settings.messages = OperationObj.validate.messages;
        }
        else{
          validator = $("#modal-container .modal-body form").validate({
            debug: true,
            rules:OperationObj.validate.rules,
            messages: OperationObj.validate.messages,
            submitHandler:FormSubmitHandler,
            errorClass:"UserVerifyError"
          });

          function FormSubmitHandler(form){
            $(form).find("input").each(function(index){
              OperationObj.CfgPara[index].Val = $(this).val();
            });

            $('#modal-container').modal('hide');
            $(e.currentTarget).toggleClass("btn-danger",false);


          }
        }


        //保存配置，TODO:加入Jquery-validation校验表单
        $("#SavCfg").unbind("click").bind("click", function(event){
          event.stopPropagation();
          $("#modal-container .modal-body form").submit();
        });

      });
    }
    //组件or测试用例展示包含的原子操作
    else if(OperationType === "Component" || OperationType === "TestCase"){
      el.find("span:first").prepend('<span class="glyphicon glyphicon-plus pull-left"></span>');
      el.find('a').attr("data-toggle","dropdown").addClass("dropdown-toggle").wrap("<li></li>").parent().addClass("dropdown");
      ItemContainer = GenerateDropdownContent(OperationObj.AtomOperationList);
      el.children("li.dropdown").append(ItemContainer);
    }
    el.find('a').attr("id",EleId);



  }

  function HandleModifyAtomList(Type,OperationList,OperationTableList){
    var OperationItem = null,
        OperationItemToPush = null,
        templateInGrp = null,
        EleId = null;

    for(var item in OperationList){
      if(OperationList.hasOwnProperty(item)){
        OperationItem = OperationList[item];
        OperationItemToPush = $.extend(true,{},OperationItem);
        templateInGrp = GenerateTestCaseInGrpHtmlEle(OperationItem);

        //操作存入要提交的操作序列中
        EleId = (OperationTableList.push({
          Type:Type,
          Operation:OperationItemToPush
        }) - 1);

        CfgElePara(templateInGrp,Type,OperationItemToPush,EleId);
        templateInGrp.find('a').removeClass("btn-danger");
        //增加测试用例点击事件

      }

      $("#drag-dropZone").append(templateInGrp);
      templateInGrp.find('button').unbind("click").bind("click", function(event) {
        //阻止事件传播，停止冒泡
        var id = $(this).parents("a.btn").attr("id");
        event.stopPropagation();
        $(this).parents("p.ui-draggable").remove();
        OperationTableList[id] = undefined;

      });
    }
  }

  function AddParaToList(TargetOperation,OriOperation){
    for(var item in OriOperation.CfgPara){
      if(OriOperation.CfgPara.hasOwnProperty(item)){
        TargetOperation.argv.push({
          name:OriOperation.CfgPara[item].Name,
          value:OriOperation.CfgPara[item].Val
        });
      }
    }
  }

  function ParseAtomParaToModalPage(OperationObj){
    var ParaItemTemplate = $('<div class="form-group">                                                  \
                                <label for="para1" class="col-sm-3 control-label"></label>         \
                                <div class="col-sm-5">                                                  \
                                  <input type="text" class="form-control" id="para1"                    \
                                     placeholder="">                                          \
                                </div>                                                                  \
                               </div>                                \ ');
    var ParaItem = null;
    $("#modal-container h4.modal-title").text(OperationObj.Name);
    $("#modal-container form").html("");

    //添加原子操作参数到配置页面
    for(var item in OperationObj.CfgPara){
      if(OperationObj.CfgPara.hasOwnProperty(item)){
        ParaItem = ParaItemTemplate.clone();
        ParaItem.find("label").text(OperationObj.CfgPara[item].Name);
        ParaItem.find("input").attr({
          "placeholder":OperationObj.CfgPara[item].Type,
          "name":OperationObj.CfgPara[item].Name
        });
        if(OperationObj.CfgPara[item].Val != null || OperationObj.CfgPara[item].Val != ""){
          ParaItem.find("input").attr("value",OperationObj.CfgPara[item].Val);
        }
        $("#modal-container form").append(ParaItem);
      }
    }
  }

  function ParseCfgToModalPage(type,Item){
    //TODO:重构，去掉TestGrp
    var ParaItemTemplate = $('<div class="form-group">                                                  \
                                <label for="para1" class="col-sm-3 control-label"></label>         \
                                <div class="col-sm-5">                                                  \
                                  <input type="text" class="form-control" id="para"                    \
                                     placeholder="">                                          \
                                </div>                                                                  \
                               </div>  \ ');
    var ParaName = ParaItemTemplate.clone();
    var ParaDesc = ParaItemTemplate.clone();
    var ParaType = ParaItemTemplate.clone();
    var name = "";

    switch (type){
      case "ComponentCreate":
      case "Component":
        name = "组件";
        break;
      case "TestCaseCreate":
      case "TestCase":
        name = "用例";
        break;
      case "TestCaseGrpCreate":
      case "TestCaseGrp":
        name = "用例组";
        break;
      default :
        console.log("UnKnown Type to Modify Modal Window");
        break;
    }

    $("#SavCfg").text("提交");
    $("#modal-container h4.modal-title").text(name + "提交");
    $("#modal-container form").html("");

    ParaName.find("label").text(name + "名称");
    ParaName.find("input").attr({
      "placeholder":"请填写"+name+"名",
      "id":"name",
      "name":"name"
    });
    ParaType.find("label").text(name + "运行环境");
    ParaType.find("input").attr({
      "placeholder":"请填写"+name+"运行环境",
      "id":"type",
      "name":"type",
      "value":"both"
    });
    ParaDesc.find("label").text(name + "描述");
    ParaDesc.find("input").attr({
      "placeholder":"请填写"+name+"描述",
      "name":"desc",
      "id":"desc"
    });

    if(Item !==null ){
      $("#SavCfg").text("修改");
      $("#modal-container h4.modal-title").text(name+ " " + Item.Name + "修改");
      ParaName.find("input").attr("value",Item.Name);
      ParaType.find("input").attr("value",Item.Type);
      ParaDesc.find("input").attr("value",Item.Desc);
    }

    $("#modal-container form").append(ParaName);
    $("#modal-container form").append(ParaType);
    $("#modal-container form").append(ParaDesc);

  }

  function GenerateSubmitOperationList(Type,Obj){
    var OperationList = [];
    var ItemId = null;
    var Operation = null;
    var OperationToAdd = null;
    var OpeItem = null;

    if($("#drag-dropZone").find("a").length === 0){
      alert("请填写提交部分");
      $("#drag-dropZone").fadeOut(500).fadeIn(500);
      return;
    }

    //根据提交区块的操作，生成提交结构
    $("#drag-dropZone").find("a.btn").each(function(index){
      var TestCase = null,
          OperationType = "",
          ItemId = $(this).attr("id");

      if(ItemId === null){
        console.log("Opeation has no id,name: "+ $(this).find("span").text());
        return;
      }
      //测试用例组的处理
      if(Obj.sequenceOfOpera[ItemId].Type === "TestCase"){

        TestCase = Obj.sequenceOfOpera[ItemId].Operation;

        OperationList.push({
          id:TestCase.ServerId,
          name:TestCase.Name
        });
        return;
      }
      OperationType = Obj.sequenceOfOpera[ItemId].Type;
      Operation = Obj.sequenceOfOpera[ItemId].Operation;

      OperationToAdd = {
        id:Operation.SeverId,
        name:Operation.Name,
        type:"keyword",
        argv:[]
      };
      //根据提交区块的操作（原子，组件）类型，生成不同结构
      switch (OperationType){
        case "Atom":
          AddParaToList(OperationToAdd,Operation);
          OperationList.push($.extend(true,{},OperationToAdd));
          break;
        case "Component":
          //TODO:组件Type填写后续再做
          //OperationToAdd.type = "component";
          //遍历组件中的原子操作
          for(var AtomItem in Operation.AtomOperationList){
            if(Operation.AtomOperationList.hasOwnProperty(AtomItem)){
              OpeItem = Operation.AtomOperationList[AtomItem];
            }
            else{
              console.log("Operation.AtomOperationList has no propertypeof AtomItem");
              continue;
            }
            OperationToAdd.id = OpeItem.SeverId;
            OperationToAdd.name = OpeItem.Name;
            //生成与原子操作相同的操作
            AddParaToList(OperationToAdd,OpeItem);
            OperationList.push($.extend(true,{},OperationToAdd));
          }
          break;
      }

    });

    //替换原有结构的操作列表，TODO:是否需要回滚？
    if(Type === "TestCaseGrpCreate" || Type === "TestCaseGrp"){
      delete Obj.sequenceOfOpera;
      Obj.testcase = OperationList;
    }
    else{
      Obj.sequenceOfOpera = OperationList;
    }

  }

  function RegisterClickEvent(id){

    var href = null;
    var SubmitObj = {
      name:"",
      desc:"",
      type:"",
      user:Usr.name,
      sequenceOfOpera:[]
    };
    var OperationId = id.slice(id.indexOf('_')+1);
    var OperationTableList = SubmitObj.sequenceOfOpera;
    var OperationObj = {};
    var OpeType = id.slice(0,id.indexOf("_"));
    var IsModify = !isNaN(parseInt(OperationId));
    $('#content').html(TaskGrpAddPage).hide().fadeIn(500);


    //根据新建操作类型，修改页面
    if(id === "ComponentCreate" || OpeType === "Component"){
      $('#TestCaseManageTab').find("a[href=#TestCaseContent]").parent().remove();
      $('#TestCaseContent').remove();
      $('#TestCaseManageTab').find("a[href=#ComponentContent]").parent().remove();
      $('#ComponentContent').remove();
      $('#SubmitSection .panel-title').text("组件");
    }
    else if(id === "TestCaseCreate" || OpeType === "TestCase"){
      $('#TestCaseManageTab').find("a[href=#TestCaseContent]").parent().remove();
      $('#TestCaseContent').remove();
      $('#SubmitSection .panel-title').text("测试用例");
    }
    else if(id === "TestCaseGrpCreate" || OpeType === "TestCaseGrp"){
      $('#TestCaseManageTab').find("a[href=#AtomContent]").parent().remove();
      $('#AtomContent').remove();
      $('#TestCaseManageTab').find("a[href=#ComponentContent]").parent().remove();
      $('#ComponentContent').remove();
      $('#SubmitSection .panel-title').text("测试用例组");
    }


    //注册标签页激活时，请求相应资源事件
    $("#TestCaseManageTab").children().each(function(){
      var href = $(this).find("a[data-toggle=tab]").attr("href");
      var ResList = null;
      var Type = "";

      switch (href){
        case "#AtomContent":
          ResList = Usr.GetAtomOperationList();
          Type = "Atom";
          break;
        case "#ComponentContent":
          ResList = Usr.GetComponentList();
          Type = "Component";
          break;
        case "#TestCaseContent":
          ResList = Usr.GetTestCaseList();
          Type = "TestCase";
          break;
        default :
          break;
      }
      $(this).children("a[data-toggle=tab]").on('show.bs.tab', function (e) {
        if(ResList.length ===0){
          Usr.Query(ParseResItem,Type);
        }
        else{
          ParseResItem(Type,ResList);
        }
      });
    });


    $("#TestCaseManageTab > li:eq(0) > a").tab("show");

    $('#drag-dropZone').droppable({
      activeClass: "ui-state-default",
      hoverClass: "ui-state-hover",
      accept: ":not(.ui-sortable-helper)",
      drop: function (e, ui) {
        var EleId = null;
        var OperationType = ui.draggable.parent().attr("id").slice(0,-7);
        var OperationIndex = ui.draggable.index();
        var el = ui.draggable.clone();
        var RemoveBtn = $('<button type="button" class="btn btn-default btn-xs remove pull-right"><span class="glyphicon glyphicon-trash"></span></button>');
        var List = null;

        $(this).find('h4').remove();
        switch (OperationType){
          case "Atom":
            List = Usr.GetAtomOperationList();
            break;
          case "Component":
            List = Usr.GetComponentList();
            break;
          case "TestCase":
            List = Usr.GetTestCaseList();
            break;
        }
        el.find('a').removeAttr("data-container data-placement data-content data-original-title title");

        el.find("span").first().append(RemoveBtn);
        //复制原始操作
        if(List.hasOwnProperty(OperationIndex+1)){
          OperationObj = $.extend(true,{},List[OperationIndex+1]);
          //操作存入要提交的操作序列中
          EleId = (OperationTableList.push({
            Type:OperationType,
            Operation:OperationObj
          }) - 1);
          CfgElePara(el,OperationType,OperationObj,EleId);
        }

        $(RemoveBtn).unbind("click").bind("click", function(event) {
          //阻止事件传播，停止冒泡
          var id = $(this).parents("a.btn").attr("id");
          event.stopPropagation();
          $(this).parents("p.ui-draggable").remove();
          OperationObj = {};
          //TODO:优化，如果删除操作过多，会使数组长度一直变大,使用slice()缩小数组长度，但需要更新页面的id
          OperationTableList[id] = undefined;
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

    $('#Back').click(function(){
      window.open("TestCaseManage.html","_self");
    });

    //用例组修改

    if(IsModify){
      var OpeSelected = null;
      var ParseLocation = '#drag-dropZone';
      var ResList = null;
      var OriTestCase = null;

      $(ParseLocation).find('h4').remove();

      switch (OpeType){
        case "Atom":
          console.log("Atom Can not be Modify");
          break;

        case "Component":
          ResList = Usr.GetComponentList();
          OpeSelected = ResList[OperationId];
          HandleModifyAtomList("Atom",OpeSelected.AtomOperationList,OperationTableList);
          break;

        case "TestCase":
          ResList = Usr.GetTestCaseList();
          OpeSelected = ResList[OperationId];
          HandleModifyAtomList("Atom",OpeSelected.AtomOperationList,OperationTableList);
          break;

        case "TestCaseGrp":
          ResList = Usr.GetTestCaseGrpList();
          OpeSelected = ResList[OperationId];
          HandleModifyAtomList("TestCase",OpeSelected.TestCaseList,OperationTableList);
          break;

        default:
          break;
      }
    }

    //定义提交操作
    $('#Submit').click(function(){
      var SubmitRules = {
        name: {
          required: true
        },
        type: {
          required: true
        },
        desc:{
          required: true
        }
      },
          SubmitMessages = {
        name: {
          required: '请输入名字'
        },
        type: {
          required: '请输入类型'
        },
        desc: {
          required: '请输入描述'
        }
      };

      if(true === IsSubmitSectionEmpty()){
        alert("请拖拽操作至提交区域");
        return;
      }
      //为填写必填参数
      if(true === $("#drag-dropZone").find("a").hasClass("btn-danger")){
        alert("请填写参数");
        return;
      }
      if(IsModify){
        ParseCfgToModalPage(OpeType,OpeSelected);
        if(validator !==null){
          validator.settings.submitHandler = SubmitHandler_Modify;
          validator.settings.rules = SubmitRules;
          validator.settings.messages = SubmitMessages;
        }
        else{
          validator = $("#modal-container .modal-body form").validate({
            debug: true,
            rules: SubmitRules,
            messages: SubmitMessages,
            submitHandler:SubmitHandler_Modify,
            errorClass:"UserVerifyError"
          });
        }



      }
      else{
        ParseCfgToModalPage(id,null);
        if(validator !==null){
          validator.settings.submitHandler = SubmitHandler_Create;
          validator.settings.rules = SubmitRules;
          validator.settings.messages = SubmitMessages;
        }
        else{
          validator = $("#modal-container .modal-body form").validate({
            debug: true,
            rules: SubmitRules,
            messages: SubmitMessages,
            submitHandler:SubmitHandler_Create,
            errorClass:"UserVerifyError"
          });
        }


      }

      $('#modal-container').modal('show');

      //保存配置，TODO:加入Jquery-validation校验表单
      $("#SavCfg").unbind("click").bind("click", function(event){
        event.stopPropagation();
        $("#modal-container .modal-body form").submit();

      });

      function SubmitHandler_Modify(form){
        $(form).find("input").each(function(index){
          SubmitObj[$(this).attr("id")] = $(this).val();
        });

        //生成请求的原子操作列表（操作+参数）
        GenerateSubmitOperationList(OpeType,SubmitObj);
        SubmitObj.id = OpeSelected.ServerId;
        Usr.Modify(function(){
          alert("Modify "+id+" Success!");
          delete SubmitObj.testcase;
          delete SubmitObj.id;
          SubmitObj.sequenceOfOpera = [];
          OperationTableList = SubmitObj.sequenceOfOpera;
          $("#Back").trigger("click");

        },OpeType,SubmitObj);
        $('#modal-container').modal('hide');
      }

      function SubmitHandler_Create(form){

        $(form).find("input").each(function(index){
          SubmitObj[$(this).attr("id")] = $(this).val();
        });
        GenerateSubmitOperationList(id,SubmitObj);
        Usr.Create(function(Res){
          if(Res.result !=0 || Res.message != 'success'){
            return;
          }
          alert("Submit "+id.slice(0,-6)+"Success!");
          if(id === "TestCaseGrp"){
            delete SubmitObj.testcase;
          }
          SubmitObj.sequenceOfOpera = [];
          OperationTableList = SubmitObj.sequenceOfOpera;
          $("#drag-dropZone").html('<h4 class="center-block"><small>请拖拽至此</small></h4> ');

        },id,SubmitObj);

        $('#modal-container').modal('hide');

      }
    });


  }

  function MainPageResLoaded(Type,ResList){

    var template = null;
    var TestCaseGrp= null;
    var ParseLoc = "";
    var EventLoc = "";
    var ResItem = null;
    switch (Type){
      case "Atom":
        ParseLoc = "#AtomTable tbody";
        EventLoc = "#AtomContent";
        break;
      case "Component":
        ParseLoc = "#ComponentTable tbody";
        EventLoc = "#ComponentContent";
        break;
      case "TestCase":
        ParseLoc = "#TestCaseTable tbody";
        EventLoc = "#TestCaseContent";
        break;
      case "TestCaseGrp":
        ParseLoc = "#TestCaseGrpTable tbody";
        EventLoc = "#TestCaseGrpContent";
        break;
    }

    if(ResList==null ){
      //错误处理
      setTimeout(function(){
        Usr.Query(MainPageResLoaded,Type);
      },1000);
      $(ParseLoc).html("<h4>Query Failed Reason: "+Result.message+"</h4>");
      return;
    }
    else if(ResList === -1){
      setTimeout(function(){
        Usr.Query(MainPageResLoaded,Type);
      },1000);
      $(ParseLoc).html("<h4>Query Failed Reason: Ajax Return Error!</h4>");
      return;
    }

    $(ParseLoc).html("");
    for(var item in ResList){
      if(ResList.hasOwnProperty(item)){
        ResItem = ResList[item];
      }

      template = GenerateTableHtmlEle(Type,ResItem);

      //添加到资源列表中
      $(template).appendTo(ParseLoc);
      template.show(1000);
      (function(ResItem){
        template.find("a").each(function(e){
          switch ($(this).text()){
            case "修改":
              $(this).click(function(){
                RegisterClickEvent(Type+"_"+ResItem.ID);
              });
              break;
            case "删除":
              $(this).click(function () {
                var context = this;
                if( false=== confirm("确定删除？")){
                  return;
                }
                Usr.Delete(function(){
                  $(context).parent().parent().hide(1000,function(){$(this).remove()});
                },Type,ResItem.ServerId);
              });
              break;
            default :
              break;
          }


        });
      }(ResItem));

    }

    if(Type === "Atom"){
      $("a[href="+EventLoc+"]").on('show.bs.tab', function (e) {
        $("#Create").attr("disabled","disabled");
      });
    }
    else{
      $("a[href="+EventLoc+"]").off("show.bs.tab");
    }
  }

  function ParseResItem(Type,ResList){

    var TestCaseGrp= null;
    var ParseLoc = "";
    var template = $('<p><a class="btn btn-default center-block" href="#" data-toggle="popover" role="button" data-container="body"\
                          data-placement="right" data-content=""><span></span></a></p>');

    switch (Type){
      case "Atom":
        ParseLoc = "#AtomContent";
        break;
      case "Component":
        ParseLoc = "#ComponentContent";
        break;
      case "TestCase":
        ParseLoc = "#TestCaseContent";
        break;
      case "TestCaseGrp":
        ParseLoc = "#TestCaseGrpContent";
        break;
    }

    if(ResList ==null){
      //错误处理
      setTimeout(function(){
        Usr.Query(ParseResItem,Type);
      },1000);
      $(ParseLoc).html("<h4>Query Failed Reason: "+Result.message+"</h4>");
      return;
    }
    else if(ResList === -1){
      setTimeout(function(){
        Usr.Query(ParseResItem,Type);
      },1000);
      $(ParseLoc).html("<h4>Query Failed Reason: Ajax Return Error!</h4>");
      return;
    }

    if(ResList.length ===0){
      console.log(Type+"List len=0");
      return;
    }

    $(ParseLoc).html("");
    for(var item in ResList) {
      if(ResList.hasOwnProperty(item)){
        template.find('a').attr('data-content',ResList[item].Descp);
        template.find('span').text(ResList[item].Name);
        $(ParseLoc).append(template.clone());

        $("[data-toggle='popover']").popover({
          'trigger':'click hover'
        });
      }
    }


    //注册拖拽事件
    $(ParseLoc+" p").draggable({
      helper: 'clone',
      //connectToSortable: "#drag-dropZone",
      opacity: 0.6,
      revert:'invalid'
    }).disableSelection();
    //执行成功，去掉标签切换事件
    $("a[href="+ParseLoc+"]").off("show.bs.tab");
  }
});