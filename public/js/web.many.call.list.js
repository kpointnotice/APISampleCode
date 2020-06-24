document.addEventListener('DOMContentLoaded', function() {
    const inputId = document.getElementById('inputId');
    const inputPw = document.getElementById('inputPw');
    const loginBtn = document.getElementById('loginBtn');
    const callBtn = document.getElementById('callBtn');
    const joinBtn = document.getElementById('joinBtn');
    const exitBtn = document.getElementById('exitBtn');
    const memberBtn = document.getElementById('memberBtn')
   
    let reqNo = 1;
   
    let kurentoPeer;
   
    signalSocketIo.on('knowledgetalk', function(data) {
      tLogBox('receive', data);
   
      if (!data.eventOp && !data.signalOp) {
        tLogBox('error', 'eventOp undefined');
      }
   
      if (data.eventOp === 'Login') {
        loginBtn.disabled = true;
        callBtn.disabled = false;
      }
   
      if (data.eventOp === 'Invite') {
        roomId = data.roomId;
   
        callBtn.disabled = true;
        joinBtn.disabled = false;
      }
   
      if (data.eventOp === 'Call') {
        roomId = data.roomId;
   
        exitBtn.disabled = false;
   
      }
      if (data.eventOp === 'Join') {
        roomId = data.roomId;
        joinBtn.disabled = true;
        exitBtn.disabled = false;
      }
   
      if (data.eventOp === 'SDP') {
        if (data.sdp && data.sdp.type === 'answer' && kurentoPeer) {
          kurentoPeer.processAnswer(data.sdp.sdp);
        }
      }
   
      if (data.eventOp === 'Candidate') {
        if (!data.candidate) return;
   
        let iceData = {
          eventOp: 'Candidate',
          reqNo: reqNo++,
          resDate: nowDate(),
          userId: inputId.value,
          roomId: data.roomId,
          candidate: data.candidate,
          useMediaSvr: 'Y',
          usage: 'cam'
        };
   
        try {
          signalSocketIo.emit('knowledgetalk', iceData);
        } catch (err) {
          if (err instanceof SyntaxError) {
            alert(' there was a syntaxError it and try again : ' + err.message);
          } else {
            throw err;
          }
        }
      }
      if (data.eventOp === 'ConferenceMemberList') {
        console.log('receive(memberlist)', data.result);
        memberlist.innerHTML = null;
        var ui = document.createElement('ui');
        data.result.forEach(item => {
          console.log(item.name);
          var li = document.createElement('li');
          li.innerHTML = item.name;
          ui.appendChild(li);
        })
        memberlist.appendChild(ui);
      }
   
   
    });
   
    function onIceCandidateHandler(e) {
      if (!e.candidate) return;
   
      let iceData = {
        eventOp: 'Candidate',
        reqNo: reqNo++,
        reqDate: nowDate(),
        userId: inputId.value,
        roomId,
        candidate: e.candidate,
        useMediaSvr: 'Y',
        usage: 'cam'
      };
   
      try {
        signalSocketIo.emit('knowledgetalk', iceData);
      } catch (err) {
        if (err instanceof SyntaxError) {
          alert(' there was a syntaxError it and try again : ' + err.message);
        } else {
          throw err;
        }
      }
    }
   
    function dispose() {
      if (kurentoPeer) {
        kurentoPeer.dispose();
        kurentoPeer = null;
        multiVideo.src = null;
      }
    }
   
    loginBtn.addEventListener('click', function(e) {
      let loginData = {
        eventOp: 'Login',
        reqNo: reqNo++,
        userId: inputId.value,
        userPw: passwordSHA256(inputPw.value),
        reqDate: nowDate(),
        deviceType: 'pc'
      };
   
      try {
        tLogBox('send', loginData);
        signalSocketIo.emit('knowledgetalk', loginData);
      } catch (err) {
        if (err instanceof SyntaxError) {
          alert(' there was a syntaxError it and try again : ' + err.message);
        } else {
          throw err;
        }
      }
    });
   
    callBtn.addEventListener('click', function(e) {
      let callData = {
        eventOp: 'Call',
        reqNo: reqNo++,
        userId: inputId.value,
        reqDate: nowDate(),
        reqDeviceType: 'pc',
        serviceType: 'multi',
        targetId: ['p2', 'p3', 'p4']
      };
   
      try {
        console.log('send', callData)
        signalSocketIo.emit('knowledgetalk', callData);
      } catch (err) {
        if (err instanceof SyntaxError) {
          alert(' there was a syntaxError it and try again : ' + err.message);
        } else {
          throw err;
        }
      }
    });
   
    joinBtn.addEventListener('click', function(e) {
      let joinData = {
        eventOp: 'Join',
        reqNo: reqNo++,
        reqDate: nowDate(),
        userId: inputId.value,
        roomId,
        status: 'accept'
      };
   
      try {
        signalSocketIo.emit('knowledgetalk', joinData);
      } catch (err) {
        if (err instanceof SyntaxError) {
          alert(' there was a syntaxError it and try again : ' + err.message);
        } else {
          throw err;
        }
      }
    });
   
    exitBtn.addEventListener('click', function(e) {
      loginBtn.disabled = false;
      callBtn.disabled = true;
      joinBtn.disabled = true;
      exitBtn.disabled = true;
      dispose();
    });
   
   
    memberBtn.addEventListener('click', function(e){
        let memberData = {
            eventOp : 'ConferenceMemberList',
            reqNo : reqNo ++,
            reqDate : nowDate(),
            roomId
        }
        try{
            tLogBox('send', memberData);
            signalSocketIo.emit('knowledgetalk', memberData);
          } catch (err) {
            if (err instanceof SyntaxError) {
              alert(' there was a syntaxError it and try again : ' + err.message);
            } else {
              throw err;
            }
        }
    })
  });