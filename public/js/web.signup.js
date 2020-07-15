
document.addEventListener('DOMContentLoaded', function () {
    let inputId = document.getElementById('inputId')
    let inputPw = document.getElementById('inputPw')
    let inputName = document.getElementById('inputName')
    let loginBtn = document.getElementById('loginBtn')
   
    let reqNo = 1
   
    signalSocketIo.on('knowledgetalk', function (data) {
      tLogBox('receive', data);
   
      if (!data.eventOp && !data.signalOp) {
        tLogBox('error', 'eventOp undefined');
      }

      if (data.eventOp === 'SignUp' && data.code ==='200'){
        tTextbox('회원가입이 되셨습니다.')
      } 
      if (data.eventOp === 'SignUp' && data.code ==='409'){
        tTextbox('이미 가입되어 있는 ID입니다.')
      }
    });
   
    loginBtn.addEventListener('click', function (e) {
      if (inputId.value !== ''){
        console.log('id')
        if (inputPw.value !== ''){
          console.log('pw')
          if (inputName.value !== ''){
            let signupData = {
              eventOp: 'SignUp',
              reqNo: reqNo++,
              reqDate: nowDate(),
              userId: inputId.value,
              userPw: passwordSHA256(inputPw.value),
              userName: inputName.value,
              deviceType: 'pc'
            }
        
            try {
              tLogBox('send', signupData);
              signalSocketIo.emit('knowledgetalk', signupData);
            } catch (err) {
              if (err instanceof SyntaxError) {
                alert(' there was a syntaxError it and try again : ' + err.message);
              } else {
                throw err;
              }
            }
          } else if (inputName.value == ''){
            console.log('확인33') 
            tTextbox('name 입력해주세요.')    
          }
        } else if (inputPw.value == ''){
        console.log('확인') 
        tTextbox('비밀번호 입력해주세요.')
        }
      } else if(inputId.value == ''){ 
      console.log('확인') 
      tTextbox('아이디 입력해주세요.')
      }
    });
  });