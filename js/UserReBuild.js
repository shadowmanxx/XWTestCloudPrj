/**
 * Created by Administrator on 2015/9/14.
 */

//TODO:填写导入模块名称
define(['./Resource','./Resource'],function(SimResObj,RealResObj){
  //私有成员
  var Name = $.cookie('username'),
      SessionId = $.cookie('xwsessionid'),
      SimResList = [],
      CurSimResId = 0,
      RealResList = [],
      CurRealResId = 0,
      AtomOperationList = [],
      CurAtomOperationId = 0,
      CurComponentId = 0,
      ComponentList = [],
      TestCaseList = [],
      CurTestCaseId = 0,
      TestCaseGrpList = [],
      CurTestCaseGrpId = 0,
      LastClickResID = null,

      //私有方法
      GetUsrName = function() {
        return Name;
      },
      GetSessionId = function() {
        return SessionId;
      },
      GetSimResId = function() {
        return CurSimResId;
      },
      SetSimResId = function(ID) {
        CurSimResId = ID;
      },
      GetRealResId = function() {
        return CurRealResId;
      },
      SetRealResId = function(ID) {
        CurRealResId = ID;
      },
      GetTestGrpId = function() {
        return CurTestCaseGrpId;
    },
      SetTestGrpId = function(ID) {
        CurTestCaseGrpId = ID;
    },
      GetTestCaseId = function() {
        return CurTestCaseId;
    },
      SetTestCaseId = function(ID) {
        CurTestCaseId = ID;
    },
      GetAtomId = function() {
        return CurAtomOperationId;
    },
      SetAtomId = function(ID) {
        CurAtomOperationId = ID;
    },
      GetComponentId = function() {
        return CurComponentId;
      },
      SetComponentId = function(ID) {
        CurComponentId = ID;
      },

      AddOneMajorRes = function(MajorResItem){
        var ResList = null,
            ResId = 0,
            SetResHandler = null,
            SubResIndx = 0,
            MinorRes = null,
            ResObj = null,
            SubResList = null;

        if(MajorResItem.type === 'simulation'){
          ResList = SimResList;
          ResId = GetSimResId();
          SetResHandler = SetSimResId;
          ResObj = SimResObj;
        }
        else if(MajorResItem.type === "real"){
          ResList = RealResList;
          ResId = GetRealResId();
          SetResHandler = SetRealResId;
          ResObj = RealResObj;
        }
        else{
          console.log("Unknown Resource Type = "+MajorResItem.type);
          return;
        }
        for(SubResIndx in SubResList){
          if(SubResList.hasOwnProperty(SubResIndx)) {
            MinorRes = SubResList[SubResIndx];
          }
          else{
            console.log("SubResList does not hasOwnProperty SubResIndx,SubResIndx = "+SubResIndx);
            continue;
          }
          //MinorRes.ip = MajorResItem.ip;
          //记录到对应实例中
          ResList[ResId] = new ResObj(ResId,MajorResItem.major_id,MinorRes.minor_id,
                                      MinorRes.status,MinorRes.name,MinorRes.ip);
          SetResHandler(++ResId);
        }
      },
      AddOneTestCaseGrp = function(TestCaseGrpItem){
        var CurTestGrpId = GetTestGrpId();
        var TestCaseGrp = null;
        TestCaseGrp = new TestCaseGrpObj( CurTestGrpId,TestCaseGrpItem.name,
                                          TestCaseGrpItem.user,TestCaseGrpItem.type,
                                          TestCaseGrpItem.desc,TestCaseGrpItem.id);
        this.TestCaseGrpList[CurTestGrpId] = TestCaseGrp;
        SetTestGrpId(++CurTestGrpId);
        return TestCaseGrp;
      },
      AddOneTestCase = function(TestCaseItem){
        var CurTestCaseId = GetTestCaseId();
        var TestCaseInst = null;
        TestCaseInst = new AtomGrpObj(CurTestCaseId,TestCaseItem.name,TestCaseItem.user,
                                      TestCaseItem.desc,TestCaseItem.id,TestCaseItem.type,"TestCase");
        TestCaseGrpList[CurTestCaseId] = TestCaseInst;
        SetTestCaseId(++CurTestCaseId);
        return TestCaseInst;
    },
      AddOneAtom = function(AtomOperationItem){
        var CurAtomId = GetAtomId();
        var AtomInst = null;
        AtomInst = new AtomObj( CurAtomId,AtomOperationItem.name,AtomOperationItem.user,AtomOperationItem.type,
                                AtomOperationItem.desc,AtomOperationItem.id);
        AtomOperationList[CurAtomId] = AtomInst;
        SetAtomId(++CurAtomId);
        return AtomInst;
    },
      AddOneComponent = function(ComponentItem){
        var CurComponentId = GetComponentId();
        var ComponentInst = null;
        ComponentInst = new AtomGrpObj( CurComponentId,ComponentItem.name,ComponentItem.user,ComponentItem.desc,
                                        ComponentItem.id,ComponentItem.type,"Component");
        AtomOperationList[CurComponentId] = ComponentInst;
        SetComponentId(++CurComponentId);
        return ComponentInst;
      },
      AddAtomToAtomGrp = function (AtomGrp,AtomToAdd) {
        var AtomItem = null;
        if(AtomToAdd ==null || AtomToAdd.length ===0){
          console.log("AtomToAddisnull");
          return;
        }
        AtomItem = new AtomObj(AtomToAdd.id,AtomToAdd.name,AtomToAdd.user,AtomToAdd.type,AtomToAdd.desc,AtomToAdd.id);
        AddParaToAtom(AtomItem,AtomToAdd.argv);
        AtomGrp.AddAtom(AtomItem);
      },
      AddParaToAtom = function (Atom,ParaList) {
        var argItem = null;
        if(ParaList==null || ParaList.length===0){
          console.log("AtomId:"+Atom.id+"ParaList len=0");
          return;
        }
        for(argItem in ParaList){
          if(ParaList.hasOwnProperty(argItem)){
            Atom.AddPara(ParaList[argItem].name,ParaList[argItem].value,ParaList[argItem].comment,ParaList[argItem].type);
          }
        }
      },
      AddResToList = function(ResListArray) {
        var MajorRes = null,
            MinorRes = null,
            SubResList = null,
            MajorId = 0,
            MinorId = 0,
            SubResIndx = 0,
            ResInstance = null;

        //遍历主设备资源列表
        for(var ResIndx in ResListArray){
          if(ResListArray.hasOwnProperty(ResIndx)){
            MajorRes = ResListArray[ResIndx];
          }
          else{
            console.log("ResListArray does not hasOwnProperty ResIndx,ResIndx = "+ResIndx);
            continue;
          }
          SubResList = MajorRes.sub_resource;
          if(SubResList.length === 0){
            console.log("MajorResID = "+MajorRes.major_id+"subresource empty");
            continue;
          }

          AddOneMajorRes(MajorRes);
        }

  },

      QueryResList = function(){

        var urlpara = '/front/resource?all=1';

        $.ajax({
          type:"GET",
          url:urlpara,
          cache:false,
          dataType:'json',
          contentType:"application/json;charset=UTF-8",
          context:this,
          success:function(ResListArray) {
            if(ResListArray.result == -1){
              console.log(ResListArray.message);
              return;
            }
            if(ResListArray.length === 0){
              console.log("ResList Empty");
              return;
            }
            //加入ResList
            AddResToList(ResListArray);
          },
          error: function() {
            console.log("ResList Fetch Error!");
          }
        });
      },
      RemoveAllRes = function (Type){
        var ResItem = null,
            ResList = null,
            ResSetHandler = null;

        if(Type === "simulation"){
          ResList = SimResList;
          ResSetHandler = SetSimResId;
        }
        else if(Type === "real"){
          ResList = RealResList;
          ResSetHandler = SetRealResId;
        }
        if(ResList.length ===0){
          console.log("No"+Type+"Resource to Remove");
          return;
        }

        ResList.splice(0,ResList.length);
        ResSetHandler(0);
      },
      GenerateTestCaseGrpList = function(TestGrpObj){
        var Instance = null,
            TestCaseGrpItem = null,
            item = null,
            TestCaseItem = null,
            TestCaseInst = null,
            TestCaseIndx = 1;
            testcase_item = null;
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
        for(item in TestGrpObj.testgroup){
          if(TestGrpObj.testgroup.hasOwnProperty(item)){
            TestCaseGrpItem = TestGrpObj.testgroup[item];
          }
          else{
            console.log("TestGroup hasNoOwnProperty of "+item);
            continue;
          }
          Instance = AddOneTestCaseGrp(TestCaseGrpItem);

          if(TestCaseGrpItem.testcase.length ===0){
            console.log('TestCaseGrp_'+item+'\'s testcase is empty');
            continue;
          }

          for(testcase_item in TestCaseGrpItem.testcase){
            if(TestCaseGrpItem.testcase.hasOwnProperty(testcase_item)){
              TestCaseItem = TestCaseGrpItem.testcase[testcase_item];
              TestCaseInst = new AtomGrpObj(TestCaseIndx,TestCaseItem.name,TestCaseItem.user,
                                            TestCaseItem.desc,TestCaseItem.id,TestCaseItem.type,"TestCase");
              Instance.AddTestCase(TestCaseInst);
              ++TestCaseIndx;
            }

          }
        }

  },
      GenerateTestCaseList = function(TestCaseList){
        var TestCaseInst = null,
            TestCaseItem = null,
            TestCase = null,
            AtomInst = null,
            AtomItem = null,
            AtomGrp = null;

        if(TestCaseList.result !=0 || TestCaseList.message != 'success'){
          return;
        }

        if(TestCaseList.testcase.length ===0){
          console.log('testcase is empty');
          return;
        }

        for(TestCaseItem in TestCaseList.testcase){
          if(TestCaseList.testcase.hasOwnProperty(TestCaseItem)){
            TestCase = TestCaseList.testcase[TestCaseItem];
            TestCaseInst = AddOneTestCase(TestCase);
          }
          else{
            console.log("TestCaseList.testcase has no ownProperty = "+TestCaseItem);
            continue;
          }
          //TODO:重构
          AtomGrp = TestCase.sequenceOfOpera;
          for(AtomItem in AtomGrp){
            if(AtomGrp.hasOwnProperty(AtomItem)){
              AddAtomToAtomGrp(TestCaseInst,AtomGrp[AtomItem]);
            }
          }
        }

  },
      GenerateAtomList = function(AtomicOperationList){
        var AtomItem = null,
            AtomOperation = null,
            argItem = null,
            AtomOperationItem = null;

        if(AtomicOperationList.result !=0 || AtomicOperationList.message != 'success'){
          return;
        }

        if(AtomicOperationList.keyword.length ===0){
          console.log('testcase is empty');
          return;
        }

        for(AtomItem in AtomicOperationList.keyword){
          if(AtomicOperationList.keyword.hasOwnProperty(AtomItem)){
            AtomOperationItem = AtomicOperationList.keyword[AtomItem];
            AtomOperation = AddOneAtom(AtomOperationItem);
          }
          else{
            console.log("AtomicOperationList.keyword does not have ownproperty of "+AtomItem);
            continue;
          }

          //向AtomOperation增加参数
          if(AtomOperationItem.argv.length ===0){
            console.log("Atom:"+AtomOperationItem.name+"has no para");
            continue;
          }
          AddParaToAtom(AtomOperation,AtomOperationItem.argv);
        }
  },
      GenerateComponentList = function(ComponentList){

        var ComponentItem = null,
            Component = null,
            AtomItem = null,
            Atom = null,
            argItem = null,
            AtomGrp = null,
            ComponentInst = null;
        if(ComponentList.result !=0 || ComponentList.message != 'success'){
          return;
        }

        if(ComponentList.component.length ===0 || ComponentList.component == null){
          console.log('Response component is empty');
          return;
        }

        for(ComponentItem in ComponentList.component){
          if(ComponentList.component.hasOwnProperty(ComponentItem)){
            Component = ComponentList.component[ComponentItem];
            ComponentInst = AddOneComponent(Component);
          }
          else{
            console.log("ComponentList.component has no own property "+ComponentItem);
            continue;
          }
          //TODO:重构
          AtomGrp = Component.sequenceOfOpera;
          if(AtomGrp.length ===0){
            console.log("ComponentItem id = "+Component.id+"sequenceOfOpera is empty");
            continue;
          }
          for(AtomItem in AtomGrp){
            if(AtomGrp.hasOwnProperty(AtomItem)){
              AddAtomToAtomGrp(ComponentInst,AtomGrp[AtomItem]);
            }
          }
        }
  },
      Query = function(callback,Type){

        var urlPara = "";
        var Handler = null;

        switch (Type){
          case "Atom":
            urlPara = '/front/keyword/list?all=1';
            Handler = GenerateAtomList;
            break;
          case "Component":
            urlPara = '/front/component/list?all=1';
            Handler = GenerateComponentList;
            break;
          case "TestCase":
            urlPara = '/front/testcase/list?all=1';
            Handler = GenerateTestCaseList;
            break;
          case "TestCaseGrp":
            urlPara = '/front/testgroup/list?all=1';
            Handler = GenerateTestCaseGrpList;
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
            Handler(ResList);
            callback(Type,ResList);
          },
          error: function() {
            console.log("Query ComponentList Error!");
            callback(Type,null);
          }
        });

      },
      Create = function(callback,id,data){
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
      Modify = function (callback,id,data) {
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
      Delete = function (callback,id,Index) {

        var urlpara = "";

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
      SearchTestCase = function(name,id){
        if(TestCaseList.length ===0){
          console.log("No TestCase,Empty!");
          return;
        }
        for(var item in TestCaseList){
          if(TestCaseList.hasOwnProperty(item) && TestCaseList[item].Name === name && TestCaseList[item].ServerId === id){
            return TestCaseList[item];
          }
        }

        return null;
  };

      //公有方法
      return{
        Query:Query,
        Create:Create,
        Modify:Modify,
        Delete:Delete,
        SearchTestCase:SearchTestCase,
        QueryResList:QueryResList,
        RemoveAllRes:RemoveAllRes,
        GetUsrName:GetUsrName,
        GetSessionId:GetSessionId
      }
});
