/**
 * Created by Administrator on 2015/9/17.
 */

//测试用例类
function AtomObj(ID,Name,Creator,Description,SeverId){

  this.ID = ID;
  this.Name = Name;
  this.Creator = Creator;
  this.Descp = Description;
  this.SeverId = SeverId;
  this.CfgPara = [];
}

AtomObj.prototype = {

  GetID: function() {
    return this.ID;
  },

  GetDescription: function () {
    return this.Descp;
  },

  AddPara: function(name,val,comment,type) {

    //防止重复添加属性
    this.RemovePara(name);
    this.CfgPara.push({
      Name:name,
      Val:val,
      Comment:comment,
      Type:type       //标示字段是否必填
    });
  },

  RemovePara:function(Name){

    if(this.CfgPara.length === 0)
    {
      console.log('CfgPara Empty Can\'t Delete');
      return;
    }

    for(var Index in this.CfgPara){
      if(this.CfgPara.hasOwnProperty(Index) && this.CfgPara[Index].Name === Name) {
        break;
      }
    }

    if(Index === (this.CfgPara.length - 1).toString()){
      console.log('No Such TestCaseName='+Name);
      return -1;
    }

    this.CfgPara.splice(Index,1);
  }
};


//测试用例组类
function TestCaseGrpObj(ID,Name,Creator,Attr,Desc,ServerId){

  this.ID = ID;
  this.Name = Name;
  this.TestCaseList = [];
  this.Creator = Creator;
  this.Attr = Attr;
  this.Desc = Desc;
  this.ServerId = ServerId;
}

TestCaseGrpObj.prototype = {

  GetID: function() {
    return this.ID;
  },

  GetTestCaseList:function(){
    return this.CfgPara;
  },

  AddTestCase: function (TestCase){

    this.RemoveTestCase(TestCase.Name);
    this.TestCaseList.push(TestCase);
  },

  RemoveTestCase:function(Name){

    if(this.TestCaseList.length ===0){
      console.log('TestCaseGrpList Empty');
      return;
    }

    for(var Index in this.TestCaseList){

      if(this.TestCaseList.hasOwnProperty(Index) && this.TestCaseList[Index].Name === Name){
        break;
      }
    }

    if(Index === (this.TestCaseList.length - 1).toString()){
      console.log('No such TestCase Name='+Name);
      return -1;
    }

    this.TestCaseList.splice(Index,1);
  }
};

//TestCase,TestCaseGrp，查询获得的AtomList都是Atom的集合
function AtomGrpObj(ID,Name,Creator,Desc,ServerId,type){

  this.ID = ID;
  this.Name = Name;
  this.AtomOperationList = [];
  this.Creator = Creator;
  this.Desc = Desc;
  this.ServerId = ServerId;
  this.type = type;
}

AtomGrpObj.prototype = {

  GetID: function() {
    return this.ID;
  },

  GetAtomList:function(){
    return this.AtomOperationList;
  },

  AddAtom: function (Atom){

    this.RemoveAtom(Atom.Name);
    this.AtomOperationList.push(Atom);
  },

  RemoveAtom:function(Name){

    if(this.AtomOperationList.length ===0){
      console.log('AtomOperationList Empty');
      return;
    }

    for(var Index in this.AtomOperationList){

      if(this.AtomOperationList.hasOwnProperty(Index) && this.AtomOperationList[Index].Name === Name){
        break;
      }
    }

    if(Index === (this.AtomOperationList.length - 1).toString()){
      console.log('No such AtomOperation Name='+Name);
      return -1;
    }

    this.AtomOperationList.splice(Index,1);
  }
};