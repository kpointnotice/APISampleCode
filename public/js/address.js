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

    tLogBox('receive', data);
    if (!data.eventOp && !data.signalOp) {
      tLogBox('error', 'eventOp undefind');
    }

    if (data.eventOp == 'Login') {
      if(data.code == '200'){
        LoginBtn.disabled = true;
        searchBtn.disabled = false;
        addBtn.disabled = false;
        delBtn.disabled = false;
        memberList();
      }
    }
    if (data.eventOp === 'Contact') {
      memberList();
    }

    if (data.eventOp === 'MemberList') {
      if (data.type === "friend") {
        let friends = '친구 목록 : ';

        for (let i = 0; i < data.result.friend.length; i++) {
          friends += data.result.friend[i].id 
                    + (i < data.result.friend.length - 1 ? ', ' : '');
        }  

        tTextbox(friends);
      } 

      if (data.type === "common") {
        let search = '검색 결과 : ' + data.result.common[0].id;

        tTextbox(search);
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
      reqDate: 20171011133100123,
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
      reqDate: 20171011133100123,
      type: 'common',
      search: inputTarget.value,
      option: {
        limit: 10,
        offset: 0
      }
    };
    
    try {
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
  addBtn.addEventListener('click', function (e) {
    let addFriend = {
      eventOp: 'Contact',
      reqNo: reqNo++,
      reqDate: 20171011133100123,
      type: 'add',
      target: inputTarget.value
    };
    try {
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

  //친구 삭제
  delBtn.addEventListener('click', function (e) {
    let addFriend = {
      eventOp: 'Contact',
      reqNo: reqNo++,
      reqDate: 20171011133100123,
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