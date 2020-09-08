document.addEventListener('DOMContentLoaded', function() {
  const inputId = document.getElementById('inputId');
  const inputPw = document.getElementById('inputPw');
  const inputTarget = document.getElementById('inputTarget');
  const loginBtn = document.getElementById('loginBtn');
  const callBtn = document.getElementById('callBtn');
  const stopShareBtn = document.getElementById('stopShareBtn');
  const localVideo = document.getElementById('localVideo');
  const remoteVideo = document.getElementById('remoteVideo');
  const docShare = document.getElementById('docShare');
  const localDocList = document.getElementById('localDocList');
  const localDoc = document.getElementById('localDoc');

  let reqNo = 1;
  let peerCon;
  let localStream;
  let roomId;
  let configuration;

  //로그인 버튼 클릭 이벤트
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

  //전화걸기 버튼 클릭 이벤트
  callBtn.addEventListener('click', function(e) {
    inputTarget.disabled = true;

    let callData = {
      eventOp: 'Call',
      reqNo: reqNo++,
      reqDate: nowDate(),
      userId: inputId.value,
      targetId: [inputTarget.value],
      serviceType: 'call',
      reqDeviceType: 'pc'
    };

    try {
      console.log('send', callData);
      tLogBox('send', callData);
      signalSocketIo.emit('knowledgetalk', callData);
    } catch (err) {
      if (err instanceof SyntaxError) {
        alert(' there was a syntaxError it and try again : ' + err.message);
      } else {
        throw err;
      }
    }
  });

  //문서공유중지 클릭 이벤트
  stopShareBtn.addEventListener('click', function(e) {
    stopShareBtn.disabled = true;
    docShare.disabled = true;
    while(localDocList.firstChild){
      localDocList.removeChild(localDocList.firstChild);
    }

    let shareEndData = {
      eventOp: 'FileShareEnd',
      reqNo: reqNo++,
      userId: inputId.value,
      reqDate: nowDate(),
      roomId
    }
    try {
      tLogBox('send', shareEndData);
      signalSocketIo.emit('knowledgetalk', shareEndData);
    } catch (err) {
      if (err instanceof SyntaxError) {
        alert(' there was a syntaxError it and try again : ' + err.message);
      } else {
        throw err;
      }
    }
  });

  //첨부파일 선택 이벤트
  docShare.addEventListener('change', function(e) {
    let i;
    stopShareBtn.disabled = false;

    for (i = 0; i < this.files.length; i++) { //첨부파일 갯수만큼 반복
      fileObj = this.files[i];

      //이미지파일만 첨부가능하도록 체크
      if(!checkFileType(fileObj)){
        tTextbox(`${fileObj.name} 실패: 이미지파일만 첨부가능합니다.`);
        continue;
      }

      //파일 사이즈 제한 체크(5MB 이하)
      if(checkFileSize(fileObj)){
        tTextbox(`${fileObj.name} 실패: 첨부파일은 5MB 이하만 가능합니다.`);
        continue;
      }

      let reader = new FileReader();

      //첨부파일 로드 완료되었을 때의 이벤트
      reader.addEventListener('load', function(fileObj) {
        let docEl = document.createElement('li');     //리스트 생성
        let imgEl = document.createElement('img');    //이미지 태그 생성

        imgEl.name = fileObj.name;
        imgEl.src = reader.result;
        imgEl.style.width = '400px';

        //생성한 이미지 클릭 이벤트
        imgEl.addEventListener('click', function(e) {
          let fileName = e.target.name;
          let localImage = new Image();

          localImage.addEventListener('load', function() {
            let localCtx = localDoc.getContext('2d');

            localCtx.drawImage(   //캔버스 위에 클릭한 이미지 삽입
              localImage,
              0,
              0,
              localDoc.width,
              localDoc.height
            );
          });

          localImage.src = reader.result;

          let fileData = {    //클릭한 이미지 파일공유 객체 생성
            eventOp: 'FileShare',
            reqNo: reqNo++,
            roomId,
            fileUrl: reader.result,
            reqDate: nowDate(),
            userId: inputId.value
          };

          try {
            console.log('send', fileData);
            tLogBox('send', fileData);
            signalSocketIo.emit('knowledgetalk', fileData);
          } catch (err) {
            if (err instanceof SyntaxError) {
              alert(
                ' there was a syntaxError it and try again : ' + err.message
              );
            } else {
              throw err;
            }
          }
        }); //end of click event

        localDocList.appendChild(docEl); //리스트 삽입
        docEl.appendChild(imgEl); //리스트 뒤에 이미지 삽입

        let fileData = {
          eventOp: 'FileShareStart',
          reqNo: reqNo++,
          roomId,
          fileInfoList: {
            fileName: fileObj.name,
            url: reader.result
          },
          reqDate: nowDate(),
          userId: inputId.value
        };

        try {
          tLogBox('send', fileData);
          signalSocketIo.emit('knowledgetalk', fileData);
        } catch (err) {
          if (err instanceof SyntaxError) {
            alert(' there was a syntaxError it and try again : ' + err.message);
          } else {
            throw err;
          }
        }
      });

      reader.readAsDataURL(fileObj);
    }
  });

  signalSocketIo.on('knowledgetalk', function(data) {
    tLogBox('receive', data);

    if (!data.eventOp && !data.signalOp) {
      console.log('error', 'eventOp undefined');
    }

    if(data.eventOp === 'Login' && data.code === '200'){
      if (data.eventOp === 'Login') {
        tTextbox('로그인 되었습니다.')
        inputId.disabled = true;
        inputPw.disabled = true;
        loginBtn.disabled = true;
        callBtn.disabled = false;
        docShare.disabled = true;
      }
    }

    if(data.eventOp === 'Login' && data.code !== '200'){
      tTextbox('아이디 비밀번호를 확인해주세요.')
    }

    if(data.eventOp === 'Call' && data.code === '200'){
      if(data.eventOp === 'Call'){
        tTextbox('통화 연결중입니다...')
        callBtn.disabled = true;
        docShare.disabled = true;
        roomId = data.roomId;
        navigator.mediaDevices
          .getUserMedia({
              video: true,
              audio: false
          })
          .then(stream => {
            localStream = stream;
            localVideo.srcObject = stream;
          });
      }
    }

    if(data.eventOp === 'Call' && data.code !== '200'){
      tTextbox('상대방이 로그인 되어 있지 않습니다.');
      inputTarget.disabled = false;
      callBtn.disabled = true;
    }

    if(data.eventOp === 'FileShareStart' && data.code === '200'){
      tTextbox('문서 공유 되었습니다.')
      roomId = data.roomId;
    }

    if(data.eventOp === 'FileShareStart' && data.code !== '200'){
      tTextbox('예상치 못한 오류가 발생하였습니다.')
    }

    if(data.signalOp === 'Presence' && data.action === 'join'){
      tTextbox('통화가 연결 되었습니다.')
      docShare.disabled = false;
    }

    //문서 공유 종료 응답
    if (data.eventOp === 'FileShareEnd' && data.code === '200') {
      tTextbox('문서공유가 중지되었습니다.')
      let localCtx = localDoc.getContext('2d');
      localCtx.clearRect(0, 0, localDoc.width, localDoc.height);
    }

    if (data.eventOp === 'SDP') {
      if (data.sdp.type === 'offer') {
        console.log('sdp offer :: ', data)
        tLogBox('send', data);
        roomId = data.roomId;
        peerCon = new RTCPeerConnection(configuration);

        peerCon.onicecandidate = onIceCandidateHandler;
        peerCon.onaddstream = onAddStreamHandler;

        peerCon.addStream(localStream);

        peerCon.setRemoteDescription(new RTCSessionDescription(data.sdp));
        peerCon.createAnswer().then(sdp => {
          peerCon.setLocalDescription(new RTCSessionDescription(sdp));

          let ansData = {
            eventOp: 'SDP',
            sdp,
            useMediaSvr: 'N',
            userId: inputId.value,
            roomId,
            reqNo: reqNo++,
            reqDate: nowDate()
          };

          try {
            console.log('send', ansData);
            tLogBox('send', ansData);
            signalSocketIo.emit('knowledgetalk', ansData);
          } catch (err) {
            if (err instanceof SyntaxError) {
              alert(
                ' there was a syntaxError it and try again : ' + err.message
              );
            } else {
              throw err;
            }
          }
        });
      }
    }

    if (data.eventOp === 'Candidate') {
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

    //상대가 새로고침시 통화 종료
    if (data.signalOp === 'Presence' && data.action === 'end') {
      tTextbox('통화가 종료되었습니다.');
      localVideo.srcObject = null;
      remoteVideo.srcObject = null;
      callBtn.disabled = false;
      inputTarget.disabled = false;

      localStream.getTracks()[0].stop();
      localStream = null;
      peerCon.close();
      peerCon = null;

      let localCtx = localDoc.getContext('2d');
      localCtx.clearRect(0, 0, localDoc.width, localDoc.height);
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

  //첨부파일 이미지파일 여부 체크
  function checkFileType(obj) {
    let fileKind = obj.name.split('.');
    let fileType = fileKind[fileKind.length-1].toLowerCase();
    let imgFileType = ['jpg','gif','png','jpeg','bmp','tif'];
    let statusChecked = false;
    let checkedFileList = [];

    imgFileType.forEach(function(item){
      if(item === fileType){
        statusChecked = true;
      }
    });
      return statusChecked;
  }

  //첨부파일 사이즈 체크(5MB 이하)
  function checkFileSize(obj) {
    console.log(obj);
    let fileSize = obj.size;
    let maxSize = 5 * 1024 * 1024   //5MB
    let statusChecked = fileSize > maxSize ? true : false;
    return statusChecked;
  }

});
