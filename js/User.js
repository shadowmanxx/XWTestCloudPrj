/**
 * Created by Administrator on 2015/9/14.
 */

//创建User命名空间，包含用户相关的所有结构
function UsrObj(name,sessionid){
  this.name = name;
  this.sessionid = sessionid;
  this.SimResArray = [];
  this.RealResArray = [];
  this.SimResId = 0;
  this.RealResId = 0;
  this.TestCaseGrpList = [];
  this.AtomOperationList = [];
  this.TestCaseList = [];
  this.ComponetList = [];
  this.LastClickResID = null;
}

//定义方法
UsrObj.prototype = {
  GetSimResId:function() {
  return this.SimResId;
},

  SetSimResId:function(SimResId) {
    this.SimResId = SimResId;
  },

  QueryResList:function(){

    var ReqContent = {
      "":""
    };
    var contentTypeStr = 'application/json;charset=UTF-8';
    var urlpara = '/front/resource?all=1';

    $.ajax({
      type:"GET",
      url:urlpara,
      cache:false,
      dataType:'json',
      contentType:contentTypeStr,
      context:this,
      data:JSON.stringify(ReqContent),
      success:function(ResListArray) {
        if(ResListArray.result == -1){
          console.log(ResListArray.message);
          return;
        }
        if(ResListArray.length === 0)
        {
          return;
        }
        //加入ResList
        this.AddResToList(ResListArray);
      },
      error: function() {
        console.log("ResList Fetch Error!");
      }
    });
  },

  AddResToList:function(ResListArray) {
    var item;
    var MajorId;
    var MinorId;
    var Array = null;

    //遍历主设备资源列表
    for(var ResIndx in ResListArray){
      item = ResListArray[ResIndx].sub_resource;
      if(item.length === 0){
        continue;
      }

      MajorId = ResListArray[ResIndx].major_id;
      if(ResListArray[ResIndx].type === 'simulation'){
        //遍历从设备资源列表
        for(var SubResIndx in item)
        {
          item[SubResIndx].ip = ResListArray[ResIndx].ip;
          MinorId = item[SubResIndx].minor_id;
          //记录到对应实例中
          this.SimResArray[this.GetSimResId()] = new SimResource(this.GetSimResId(),MajorId,MinorId,item[SubResIndx].status,item[SubResIndx].name,item[SubResIndx].ip);
          this.SetSimResId(this.GetSimResId() + 1);
        }

      }
      else if(ResListArray[ResIndx].type === 'real'){
        //TODO:添加真实环境处理

      }
    }

    $(document).trigger('ResourceLoaded',[this]);
  },

  RemoveAllRes: function (){
    if(this.SimResArray.length ===0){
      console.log('No Resource to Remove');
      return;
    }



    for(var item in this.SimResArray){
      this.SimResArray[item].RemoveResItemFromList();
    }

    this.SimResArray.splice(0,this.SimResArray.length);
    this.SetSimResId(0);
  },

  GenerateTestCaseGrpList:function(TestGrpObj){

    var TestCaseGrpIndx = 1;
    if(TestGrpObj.result !=0 || TestGrpObj.message != 'success'){
      return;
    }

    if(TestGrpObj.testgroup.length === 0){
      console.log('testgroup is empty');
      return;
    }

    if(this.TestCaseGrpList.length !=0){
      this.TestCaseGrpList = [];
    }

    //向Usr中添加用例组
    for(var item in TestGrpObj.testgroup){
      var TestCaseGrpItem = TestGrpObj.testgroup[item];
      var TestCaseGrp = new TestCaseGrpObj(TestCaseGrpIndx,TestCaseGrpItem.name,TestCaseGrpItem.user,TestCaseGrpItem.type,
        TestCaseGrpItem.desc,TestCaseGrpItem.id);
      this.TestCaseGrpList[TestCaseGrpIndx] = TestCaseGrp;
      ++TestCaseGrpIndx;

      if(TestCaseGrpItem.testcase.length ===0){
        console.log('TestCaseGrp_'+item+'\'s testcase is empty');
        continue;
      }

      //TODO:向用例组添加原子操作or组件库？
      for(var testcase_item in TestCaseGrpItem.testcase){
        var AtomIndx = 1;
        var TestCaseItem = TestCaseGrpItem.testcase[testcase_item];
        var TestCase = new AtomGrpObj(AtomIndx,TestCaseItem.name,TestCaseItem.user,TestCaseItem.desc,TestCaseItem.id,TestCaseItem.type,"TestCase");
        TestCaseGrp.AddTestCase(TestCase);
        ++AtomIndx;
      }
    }

  },

  GenerateTestCaseList:function(TestCaseList){
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
      var TestCase = new AtomGrpObj(TestCaseIndx,TestCaseItem.name,TestCaseItem.user,TestCaseItem.desc,TestCaseItem.id,TestCaseItem.type,"TestCase");
      this.TestCaseList[TestCaseIndx] = TestCase;
      ++TestCaseIndx;

      //TODO:重构
      var AtomGrp = TestCaseItem.sequenceOfOpera;
      for(var AtomItem in AtomGrp){
        if(AtomGrp.hasOwnProperty(AtomItem)){
          var Atom = new AtomObj(AtomGrp[AtomItem].id,AtomGrp[AtomItem].name,AtomGrp[AtomItem].user,AtomGrp[AtomItem].type,AtomGrp[AtomItem].desc,AtomGrp[AtomItem].id);
          TestCase.AddAtom(Atom);
          //填写参数
          for(var argItem in AtomGrp[AtomItem].argv){
            Atom.AddPara(AtomGrp[AtomItem].argv[argItem].name,AtomGrp[AtomItem].argv[argItem].value,AtomGrp[AtomItem].argv[argItem].comment,AtomGrp[AtomItem].argv[argItem].type);
          }
        }
      }
    }

  },

  GenerateAtomList:function(AtomicOperationList){

    var AtomOperationIndx = 1;
    if(AtomicOperationList.result !=0 || AtomicOperationList.message != 'success'){
      return;
    }

    if(AtomicOperationList.keyword.length ===0){
      console.log('testcase is empty');
      return;
    }

    for(var item in AtomicOperationList.keyword){
      var AtomOperationItem = AtomicOperationList.keyword[item];
      var AtomOperation = new AtomObj(AtomOperationIndx,AtomOperationItem.name,AtomOperationItem.user,AtomOperationItem.type,AtomOperationItem.desc,AtomOperationItem.id);
      this.AtomOperationList[AtomOperationIndx] = AtomOperation;
      ++AtomOperationIndx;

      //向AtomOperation增加参数
      if(AtomOperationItem.argv.length ===0){
        continue;
      }

      for(var argItem in AtomOperationItem.argv){
        AtomOperation.AddPara(AtomOperationItem.argv[argItem].name,AtomOperationItem.argv[argItem].value,AtomOperationItem.argv[argItem].comment,AtomOperationItem.argv[argItem].type);
      }
    }
  },

  GenerateComponentList:function(ComponentList){

    var ComponentIndx = 1;
    if(ComponentList.result !=0 || ComponentList.message != 'success'){
      return;
    }

    if(ComponentList.component.length ===0 || ComponentList.component == null){
      console.log('Response component is empty');
      return;
    }

    for(var item in ComponentList.component){
      var ComponentItem = ComponentList.component[item];
      var Component = new AtomGrpObj(ComponentIndx,ComponentItem.name,ComponentItem.user,ComponentItem.desc,ComponentItem.id,ComponentItem.type,"Component");
      this.ComponetList[ComponentIndx] = Component;
      ++ComponentIndx;

      //TODO:重构
      var AtomGrp = ComponentItem.sequenceOfOpera;
      if(AtomGrp.length ===0){
        console.log("ComponentItem id = "+ComponentItem.id+"sequenceOfOpera is empty");
        continue;
      }
      for(var AtomItem in AtomGrp){
        if(AtomGrp.hasOwnProperty(AtomItem) && AtomGrp[AtomItem]!==null && AtomGrp[AtomItem].length !==0){
          var Atom = new AtomObj(AtomGrp[AtomItem].id,AtomGrp[AtomItem].name,AtomGrp[AtomItem].user,AtomGrp[AtomItem].type,AtomGrp[AtomItem].desc,AtomGrp[AtomItem].id);
          Component.AddAtom(Atom);
          //填写参数
          for(var argItem in AtomGrp[AtomItem].argv){
            Atom.AddPara(AtomGrp[AtomItem].argv[argItem].name,AtomGrp[AtomItem].argv[argItem].value,AtomGrp[AtomItem].argv[argItem].comment,AtomGrp[AtomItem].argv[argItem].type);
          }
        }
      }
    }
  },

  Query:function(callback,Type){

    var urlPara = "";
    var Handler = null;

    switch (Type){
      case "Atom":
        urlPara = '/front/keyword/list?all=1';
        Handler = this.GenerateAtomList;
        break;
      case "Component":
        urlPara = '/front/component/list?all=1';
        Handler = this.GenerateComponentList;
        break;
      case "TestCase":
        urlPara = '/front/testcase/list?all=1';
        Handler = this.GenerateTestCaseList;
        break;
      case "TestCaseGrp":
        urlPara = '/front/testgroup/list?all=1';
        Handler = this.GenerateTestCaseGrpList;
        break;
      default :
        console.log("Query known Type");
        return;
        break;
    }
    $.ajax({
      type:"GET",
      url:urlPara,
      cache:false,
      dataType:'json',
      contentType:'application/json;charset=UTF-8',
      context:this,
      success:function(ResList){
        if(ResList.result !=0 || ResList.message != 'success'){
          callback(ResList);
          return;
        }
        Handler.call(this,ResList);
        callback(Type,this,ResList);
      },
      error: function() {
        console.log("Query ComponentList Error!");
        callback(Type,this,null);
      }
    });

  },

  Create: function(callback,id,data){
    var urlPara = "";

    switch (id){
      case "ComponentCreate":
        urlPara = '/front/component/';
        break;
      case "TestCaseCreate":
        urlPara = '/front/testcase/';
        break;
      case "TestCaseGrpCreate":
        urlPara = '/front/testgroup/';
        break;
    }

    $.ajax({
      type:"POST",
      url:urlPara,
      cache:false,
      dataType:'json',
      contentType:'application/json;charset=UTF-8',
      context:this,
      data:JSON.stringify(data),
      success:function(Result){

        callback(Result);

      },
      error: function() {
        console.log("Query"+id+"Error!");
      }
    });
  },

  Modify: function (callback,id,data) {

    var urlPara = "";

    switch (id){
      case "Component":
        urlpara = '/front/component/';
        break;
      case "TestCase":
        urlpara = '/front/testcase/';
        break;
      case "TestCaseGrp":
        urlpara = '/front/testgroup/';
        break;
    }

    $.ajax({
      type:"PUT",
      url:urlpara,
      cache:false,
      dataType:'json',
      contentType:'application/json;charset=UTF-8',
      context:this,
      data:JSON.stringify(data),
      success:function(Result){
        if(Result.result !=0 || Result.message != 'success'){
          return;
        }
        callback();

      },
      error: function() {
        console.log("Query"+id+"Error!");
      }
    });

  },

  Delete: function (callback,id,Index) {

    var urlPara = "";

    switch (id){
      case "Component":
        urlpara = '/front/component/' + Index;
        break;
      case "TestCase":
        urlpara = '/front/testcase/' + Index;
        break;
      case "TestCaseGrp":
        urlpara = '/front/testgroup/' + Index;
        break;
    }

    $.ajax({
      type:"DELETE",
      url:urlpara,
      cache:false,
      dataType:'json',
      contentType:'application/json;charset=UTF-8',
      success:function(Result){
        if(Result.result !=0 || Result.message != 'success'){
          return;
        }
        callback();

      },
      error: function() {
        console.log("Delete"+id+"_"+Index+"Error!");
      }
    });

  },

  SearchTestCase:function(name,id){
    if(this.TestCaseList.length ===0){
      console.log("No TestCase,Empty!");
      return;
    }
    for(var item in this.TestCaseList){
      if(this.TestCaseList.hasOwnProperty(item) && this.TestCaseList[item].Name === name && this.TestCaseList[item].ServerId === id){
        return this.TestCaseList[item];
      }
    }

    return null;
  }

};
