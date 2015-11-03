/**
 * Created by Administrator on 2015/9/14.
 */

define(function(require){
  var $ = require('jquery');
      UserInfo = require("obj/UserInfo");
  require("bootstrap");
  require("jquery_validate");

  $(function(){

    var CurId = null,
        validator = $("#UserInfo").validate({
      debug: true,
      rules: {
        username: {
          required: true,
          minlength: 5,
          maxlength: 10
        },
        password: {
          required: true,
          minlength: 5,
          maxlength: 16
        },
        confirm_password:{
          required: true,
          equalTo:"#password"
        },
        email:{
          required: true,
          email: true
        }
      },
      messages: {
        username: {
          required: '请输入用户名',
          minlength: '用户名不能小于5个字符'
        },
        password: {
          required: '请输入密码',
          minlength: '密码不能小于5个字符'
        },
        confirm_password: {
          required: '请输入密码',
          equalTo:"输入密码不一致"
        },
        email:{
          required: '请输入邮箱地址',
          email:"邮箱格式不正确"

        }
      },
      //验证通过后，才允许提交
      submitHandler:function(form){
        var Method = "",
          Url = "/front/user/",
          Name = $("#username").val(),
          Password = $("#password").val(),
          Email = $("#email").val(),
          Index = $("#UsrTable input:checked").parent().next().text(),
          UserId = null,
          Handler = null,
          SubmitObj = {};

        if(Index !== ""){
          UserId = UserInfoList[Index].id;
        }
        switch(CurId){
          case "Create":
            Method = "POST";
            SubmitObj = {
              name:Name,
              password:Password,
              email:Email
            };
            Handler = function(Result){
              if(Result.result !==0){
                alert("新增用户失败 信息："+Result.message);
                return;
              }
              UserInfo.prototype.Query(HandleQueryUserInfo,Result.user_id);
            };
            break;
          case "Modify":
            Method = "PUT";
            SubmitObj = {
              id:UserId,
              name:Name,
              password:Password,
              email:Email
            };
            //闭包保存UserID,防止请求未响应时，再进行其它操作污染UserId
            (function(UserId){
              Handler = function(Result){
                if(Result.result !==0){
                  alert("修改用户"+UserInfoList[Username].name+"信息失败 信息："+Result.message);
                  return;
                }
                UserInfo.prototype.Query(HandleQueryUserInfo,UserId);
              };
            }(UserId));

            break;
        }
        $.ajax({
          type:Method,
          url:Url,
          cache:false,
          dataType:'json',
          data:JSON.stringify(SubmitObj),
          contentType:'application/json;charset=UTF-8',
          success:function(UserList){
            Handler(UserList);
          },
          error: function() {
            console.log("Query UserList Error!");
          }
        });
        $("#UseCfgModal").modal("hide");


      },
      //设置错误容器位置及CSS样式
      /*errorLabelContainer:"#error-container",
       errorElement:"li",
       wrapper:"ul",*/
      errorClass:"UserVerifyError"
    }),
        UserInfoList = [];

    UserInfo.prototype.Query(HandleQueryUserInfo,null);

    $("#UserInfoOpeList").delegate("button","click",function(e){
      var SelectedItem = $("#UsrTable input:checked"),
        Index = "",
        UserInst = null;
      CurId = e.currentTarget.id;
      switch(CurId){
        case "Create":
          $("#UserModalTitle").text("创建新用户");
          $("#UserInfo input").val("");
          $("#UseCfgModal").modal("show");
          break;
        case "Modify":
          if(SelectedItem.length ===0){
            $("#UsrTable input").fadeOut(500).fadeIn(500);
            return;
          }
          $("#UserModalTitle").text("用户信息修改");
          Index = SelectedItem.parents("tr").children("td:eq(1)").text();
          UserInst = UserInfoList[Index];
          if(UserInst === undefined){
            console.log("No User:"+UserInst.name);
            return
          }
          $("#username").val(UserInst.name);
          $("#password").val("");
          $("#confirm_password").val("");
          $("#email").val(UserInst.email);
          $("#UseCfgModal").modal("show");
          break;
        case "Delete":
          if(SelectedItem.length ===0){
            $("#UsrTable input").fadeOut(500).fadeIn(500);
            return;
          }
          if(false === confirm("确定删除？")){
            return;
          }
          Index = SelectedItem.parents("tr").children("td:eq(1)").text();
          UserInst = UserInfoList[Index];
          if(UserInst === undefined){
            console.log("No User:"+Index);
            return
          }
          (function(SelectedItem){
            $.ajax({
              type:"DELETE",
              url:"/front/user/"+UserInst.id,
              cache:false,
              dataType:'json',
              contentType:'application/json;charset=UTF-8',
              success:function(Result){
                if(Result.result ===0){
                  SelectedItem.hide(1000,function(){$(this).remove()})
                }
              },
              error: function() {
                console.log("Del User Error!");
              }
            });
          }(SelectedItem.parents("tr")));

          break;
        default :
          break;
      }
    });

    $("#SavCfg").click(function(){
      $("#UserInfo").submit();
    });


    $('#UseCfgModal').on('hide.bs.modal', function () {
      validator.resetForm();});

    function HandleQueryUserInfo(Result){

      var UserList = Result.user,
          UserInst = null,
          UserExists = null,
          SelectedItem = null;

      if(Result.result !=0){
        console.log("Query UserList Error,Message:"+Result.message);
        return;
      }

      for(var UserItem in UserList){
        if(UserList.hasOwnProperty(UserItem)){
          UserInst = new UserInfo(UserList[UserItem]);
          UserExists = UserInfoList[UserInst.id];
          //修改已有用户信息，动态刷新变化部分
          if(UserExists !== undefined){
            for(var ChangeItem in UserInst){
              //精确匹配内容
              if(UserInst.hasOwnProperty(ChangeItem) && UserInst[ChangeItem] !==UserExists[ChangeItem]){
                SelectedItem =$("#UsrTable td:contains("+UserExists[ChangeItem]+")").map(function(){
                  if ($(this).text() == UserExists[ChangeItem]) {
                    return this;
                  }
                });
                SelectedItem.text(UserInst[ChangeItem]).fadeOut(1000).fadeIn(1000);
                SelectedItem.parents("tr").toggleClass("info",true);
              }
            }
          }
          else{
            ParseUserInfo(UserInst);
          }
          UserInfoList[UserInst.id] = UserInst;
        }
      }
    }
  });


  function ParseUserInfo(UserInst){
    var Template = $('<tr><td><input type="radio" name="userRadio"></td></tr>');

    Template.append($("<td></td>").text(UserInst.id)).append($("<td></td>").text(UserInst.name)).append($("<td></td>").text(UserInst.email));

    $("#UsrTable").append(Template);
    Template.hide().show(1000);
  }


});

