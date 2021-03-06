document.addEventListener('DOMContentLoaded', function() {
  const inputId = document.getElementById('inputId');
  const inputPw = document.getElementById('inputPw');
  const loginBtn = document.getElementById('loginBtn');
  const joinBtn = document.getElementById('joinBtn');
  const localVideo = document.getElementById('localVideo');
  const remoteVideo = document.getElementById('remoteVideo');
  const remoteDoc = document.getElementById('remoteDoc');

  let reqNo = 1;
  let peerCon;
  let localStream;
  let roomId;
  let configuration;

  signalSocketIo.on('knowledgetalk', function(data) {
    tLogBox('receive', data);

    if (!data.eventOp && !data.signalOp) {
      console.log('error', 'eventOp undefined');
    }

    //로그인 응답
    if(data.eventOp === 'Login'){
      if(data.code !== '200'){
        tTextbox('아이디 비밀번호를 확인해주세요.')
        return;
      }
      tTextbox('로그인 되었습니다.')
      inputId.disabled = true;
      inputPw.disabled = true;
      loginBtn.disabled = true;
    }
    //초대 이벤트 응답
    else if (data.eventOp === 'Invite') {
      tTextbox(data.userId+'님이 통화를 요청합니다.')
      roomId = data.roomId;
      joinBtn.disabled = false;
    }
    //Join 응답
    else if (data.eventOp === 'Join') {
      if(data.code !== '200'){
        tTextbox('통화가 연결되지 않았습니다.')
        return;
      }
      tTextbox('통화가 연결 되었습니다.');
      localStorage.setItem('roomId',data.roomId);
      joinBtn.disabled = true;
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then(stream => {
          localStream = stream;
          localVideo.srcObject = localStream;

          roomId = data.roomId;
          peerCon = new RTCPeerConnection(configuration);

          peerCon.onicecandidate = onIceCandidateHandler;
          peerCon.onaddstream = onAddStreamHandler;

          peerCon.addStream(localStream);
          peerCon.createOffer().then(sdp => {
            peerCon.setLocalDescription(new RTCSessionDescription(sdp));

            let sdpData = {
              eventOp: 'SDP',
              sdp,
              useMediaSvr: 'N',
              userId: inputId.value,
              roomId,
              reqNo: reqNo++,
              usage: 'cam',
              reqDate: nowDate()
            };

            try {
              tLogBox('send', sdpData);
              signalSocketIo.emit('knowledgetalk', sdpData);
            } catch (err) {
              if (err instanceof SyntaxError) {
                alert(' there was a syntaxError it and try again : ' + err.message);
              } else {
                throw err;
              }
            }
          });
        }).catch(err => {
          alert('카메라 또는 마이크를 재설정 하시기 바랍니다.')
      })
    }
    //SDP 응답
    else if (data.eventOp === 'SDP') {
      if (data.sdp.type === 'answer') {
        peerCon.setRemoteDescription(new RTCSessionDescription(data.sdp));
      }
    }
    //Candidate 응답
    else if (data.eventOp === 'Candidate') {
      peerCon.addIceCandidate(new RTCIceCandidate(data.candidate));

      let iceData = {
        eventOp: 'Candidate',
        roomId: data.roomId,
        reqNo: data.reqNo,
        resDate: nowDate(),
        code: '200'
      };

      try {
        console.log('send', iceData);
        tLogBox('send', iceData);
        signalSocketIo.emit('knowledgetalk', iceData);
      } catch (err) {
        if (err instanceof SyntaxError) {
          alert(' there was a syntaxError it and try again : ' + err.message);
        } else {
          throw err;
        }
      }
    }
    //문서 공유 시작 전달
    else if (data.eventOp === 'FileShareStartSvr') {
      tTextbox('상대방이 문서를 공유했습니다.')
      let remoteImage = new Image();

      //캔버스에 이미지 그리기
      remoteImage.addEventListener('load', function() {
        let remoteCtx = remoteDoc.getContext('2d');

        remoteCtx.drawImage(
          remoteImage,
          0,
          0,
          remoteDoc.width,
          remoteDoc.height
        );
      });

      remoteImage.src = data.fileInfoList.url;
    }
    //문서 공유 클릭전달
    else if (data.eventOp === 'FileShareSvr') {
      let remoteImage = new Image();

      remoteImage.addEventListener('load', function() {
        let remoteCtx = remoteDoc.getContext('2d');

        remoteCtx.drawImage(
          remoteImage,
          0,
          0,
          remoteDoc.width,
          remoteDoc.height
        );
      });

      remoteImage.src = data.fileUrl;
    }
    //문서 공유 종료 전달
    else if (data.eventOp === 'FileShareEndSvr') {
      let remoteCtx = remoteDoc.getContext('2d');
      remoteCtx.clearRect(0, 0, remoteDoc.width, remoteDoc.height);
    }
    //상대가 새로고침시 통화 종료
    else if (data.signalOp === 'Presence' && data.action === 'end') {
      tTextbox('통화가 종료되었습니다.');
      localVideo.srcObject = null;
      remoteVideo.srcObject = null;

      localStream.getTracks()[0].stop();
      localStream = null;
      peerCon.close();
      peerCon = null;

      let remoteCtx = remoteDoc.getContext('2d');
      remoteCtx.clearRect(0, 0, remoteDoc.width, remoteDoc.height);
    }

  });

  function onIceCandidateHandler(e) {
    if (!e.candidate) return;

    let iceData = {
      eventOp: 'Candidate',
      candidate: e.candidate,
      useMediaSvr: 'N',
      userId: inputId.value,
      roomId,
      reqNo: reqNo++,
      reqDate: nowDate()
    };

    try {
      console.log('send', iceData);
      tLogBox('send', iceData);
      signalSocketIo.emit('knowledgetalk', iceData);
    } catch (err) {
      if (err instanceof SyntaxError) {
        alert(' there was a syntaxError it and try again : ' + err.message);
      } else {
        throw err;
      }
    }
  }

  function onAddStreamHandler(e) {
    remoteVideo.srcObject = e.stream;
  }

  //로그인버튼 클릭 이벤트
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

  //통화버튼 클릭 이벤트
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
      tLogBox('send', joinData);
      signalSocketIo.emit('knowledgetalk', joinData);
    } catch (err) {
      if (err instanceof SyntaxError) {
        alert(' there was a syntaxError it and try again : ' + err.message);
      } else {
        throw err;
      }
    }
  });

  // 새로고침시 이벤트
  if (window.performance) {
    if(localStorage.getItem('roomId') !== null){
      if (performance.navigation.type == 1) {
        let callEndData = {
          eventOp: 'ExitRoom',
          reqNo: reqNo,
          userId: inputId.value,
          reqDate: nowDate(),
          roomId: localStorage.getItem('roomId')
        };

        localStorage.removeItem('roomId');
        try {
          signalSocketIo.emit('knowledgetalk', callEndData);
          if (window.roomId) {
            window.roomId = null;
          }
        } catch (err) {
          if (err instanceof SyntaxError) {
            alert('there was a syntaxError it and try again:' + err.message);
          } else {
            throw err;
          }
        }
      }
    }
  }

});
