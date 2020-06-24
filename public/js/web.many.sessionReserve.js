document.addEventListener('DOMContentLoaded', function() {
    const inputId = document.getElementById('inputId');
    const inputPw = document.getElementById('inputPw');
    const loginBtn = document.getElementById('loginBtn');
    const callBtn = document.getElementById('callBtn');
    const joinBtn = document.getElementById('joinBtn');
    const exitBtn = document.getElementById('exitBtn');
    let sessionBtn = document.getElementById('sessionBtn')
   
   
    let reqNo = 1;
   
    let kurentoPeer;
   
    signalSocketIo.on('knowledgetalk', function(data) {
   
      console.log('receive', data);
   
      if (!data.eventOp && !data.signalOp) {
        console.log('error', 'eventOp undefined');
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
          console.log('send', iceData);
          signalSocketIo.emit('knowledgetalk', iceData);
        } catch (err) {
          if (err instanceof SyntaxError) {
            alert(' there was a syntaxError it and try again : ' + err.message);
          } else {
            throw err;
          }
        }
      }
   
    });
   
   
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
        console.log('send', loginData);
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
        console.log('send', callData);
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
        console.log('send', joinData);
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
   
   
   
    sessionBtn.addEventListener('click', function(e){
        let sessionData = {
            eventOp : 'SessionReserve',
            reqNo : reqNo ++,
            userId : inputId.value,
            reqDate : nowDate(),
            roomId
        }
        try {
          console.log('send', sessionData);
          signalSocketIo.emit('knowledgetalk', sessionData);
        } catch (err) {
          if (err instanceof SyntaxError) {
            alert(' there was a syntaxError it and try again : ' + err.message);
          } else {
            throw err;
          }
        }
    })
  });