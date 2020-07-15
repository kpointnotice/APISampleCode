document.addEventListener('DOMContentLoaded', function () {
  let inputid = document.getElementById('inputid');
  let inputpw = document.getElementById('inputpw');
  let addBtn = document.getElementById('addBtn');
  let delBtn = document.getElementById('delBtn');
  let LoginBtn = document.getElementById('LoginBtn')
  let searchBtn = document.getElementById('searchBtn');
  let inputTarget = document.getElementById('inputTarget')

  let reqNo = 1;
  signalSocketIo.on('knowledgetalk', function (data) {
    console.log('receive', data);
    tLogBox('receive', data);

    if (!data.eventOp && !data.signalOp) {
      tLogBox('error', 'eventOp undefind');
    }

    if (data.eventOp == 'Login') {
      if(data.code == '200'){
        LoginBtn.disabled = true;
        searchBtn.disabled = false;
        // addBtn.disabled = false;
        delBtn.disabled = false;
        memberList();
      }else if(data.code !== '200'){
        tTextbox('아이디 비밀번호를 다시 확인해주세요')
      }
    }

    if (data.eventOp === 'Contact') {
      memberList();
    }

    //최초 로그인,친구추가,삭제시 나오는 목록 이벤트
    if (data.eventOp === 'MemberList') {
      if (data.type === "friend") {
        document.getElementById('memberList').innerHTML = ""
        let friends = '친구 목록 : ';

        for (let i = 0; i < data.result.friend.length; i++) {
          var plusUl = document.createElement('ul');
          plusUl.innerHTML =  `<li>${data.result.friend[i].id}</li>`;     
          document.getElementById('memberList').appendChild(plusUl);
        }
        // for (let i = 0; i < data.result.friend.length; i++) {
        //   console.log('id :::::',data.result.friend[i].id)
        //   friends += data.result.friend[i].id+
        //     (i<data.result.friend.length-1 ? '\n' : '') 
        // }
        tTextbox(friends);
      }

      //친구 검색시 이벤트
      if (data.type === "common" && data.code ==='200') {
        let test = data.result.common
        document.getElementById('memberList').innerHTML = ""
        console.log(test)
        let searchId = '';
        for(var i=0; i<test.length; i++){
          searchId += data.result.common[i].id
          searchId += i< test.length-1 ? ',' : ''
          
          var plusUl = document.createElement('ul');
          plusUl.innerHTML =  `<li>${data.result.common[i].id}</li>`
          plusUl.innerHTML +=  `<li><button onclick='addBtn(data.result.common[i].id);'>추가</button></li>`
          plusUl.innerHTML +=  `<li><button>삭제</button></li>`
          document.getElementById('memberList').appendChild(plusUl);
        }
        function addBtn(e){
          console.log('클릭??');
          addBtn.addEventListener('click', function (e) {
            document.getElementById(e).style.visibility='visible';
            console.log('클릭2222');
            let addFriend = {
              eventOp: 'Contact',
              reqNo: reqNo++,
              reqDate: new Date(),
              type: 'add',
              target: inputTarget.value
            };
            try {
              console.log('send', addFriend);
              tLogBox('send', addFriend);
              signalSocketIo.emit('knowledgetalk', addFriend);
            } catch (err) {
              if (err instanceof SyntaxError) {
                alert('there was a syntaxError it and try again :' + err.message);
              } else {
                throw err;
              }
            }
          });
        }
        let search = '검색 결과 : ' + searchId;
        tTextbox(search);
      } else if (data.type === "common" && data.code ==='403') {
        tTextbox('해당 친구 이름은 없습니다.');
      }
    }
  });

  LoginBtn.addEventListener('click', function (e) {
    let loginData = {
      eventOp: 'Login',
      reqNo: reqNumber(),
      userId: inputid.value,
      userPw: passwordSHA256(inputpw.value),
      reqDate: getDate(),
      deviceType: 'pc'
    };
    try {
      tLogBox('send', loginData);
      signalSocketIo.emit('knowledgetalk', loginData);
    } catch (err) {
      if (err instanceof SyntaxError) {
        alert('there was a syntaxError it and try again :' + err.message);
      } else {
        throw err;
      }
    }
  });

  function memberList() {
    let limit = 10;
    let offset = 0;
    let objOp = {
      limit,
      offset
    };
    
    let memberList = {
      eventOp: 'MemberList',
      reqNo: reqNo++,
      reqDate: new Date(),
      type: 'friend',
      option: objOp
    };
    try {
      tLogBox('send', memberList);
      signalSocketIo.emit('knowledgetalk', memberList);
    } catch (err) {
      if (err instanceof SyntaxError) {
        alert(' there was a syntaxError it and try again : ' + err.message);
      } else {
        throw err;
      }
    }
  }

  //서치 클릭시
  searchBtn.addEventListener('click', e => {
    let member = {
      eventOp: 'MemberList',
      reqNo: reqNo++,
      reqDate: new Date(),
      type: 'common',
      search: inputTarget.value,
      option: {
        limit: 10,
        offset: 0
      }
    };
    
    try {
      console.log('send', member);
      tLogBox('send', member);
      signalSocketIo.emit('knowledgetalk', member);
    } catch (err) {
      if (err instanceof SyntaxError) {
        alert('there was a syntaxError it and try again :' + err.message);
      } else {
        throw err;
      }
    }
  })

  // 친구추가
  

  //친구 삭제
  delBtn.addEventListener('click', function (e) {
    let addFriend = {
      eventOp: 'Contact',
      reqNo: reqNo++,
      reqDate: new Date(),
      type: 'delete',
      target: inputTarget.value
    };
    try {
      tLogBox('send', JSON.stringify(addFriend));
      signalSocketIo.emit('knowledgetalk', addFriend);
    } catch (err) {
      if (err instanceof SyntaxError) {
        alert('there was a syntaxError it and try again :' + err.message);
      } else {
        throw err;
      }
    }
  });
});