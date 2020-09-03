document.addEventListener('DOMContentLoaded', function () {

    let loginBtn = document.getElementById('loginBtn');
    let logoutBtn = document.getElementById('logoutBtn');

    let reqNo = 1

    signalSocketIo.on('knowledgetalk', function (data) {
        console.log('receive', data);
     
        if (!data.eventOp && !data.signalOp) {
          console.log('error', 'eventOp undefined');
        }
      });

    //로그인 이벤트
    loginBtn.addEventListener('click', function (e) {
        let loginData = {
            eventOp: 'Login',
            reqNo: reqNo++,
            reqDate: nowDate(),
            userId: inputId.value,
            userPw: passwordSHA256(inputPw.value),
            deviceType: 'pc'
        };

        try {
            console.log('send', loginData);
            signalSocketIo.emit('knowledgetalk', loginData);
        } catch (err) {
            if (err instanceof SyntaxError) {
                alert('there was a syntaxError it and try again:' + err.message);
            } else {
                throw err;
            }
        }
    });

    //로그아웃 했을 때,
    logoutBtn.addEventListener('click', function (e) {
        let logoutData = {
            eventOp: 'Logout',
            reqNo: reqNo++,
            userId: inputId.value,
            reqDate: nowDate()
        };
        try {
            console.log('send', logoutData);
            signalSocketIo.emit('knowledgetalk', logoutData);
        } catch (err) {
            if (err instanceof SyntaxError) {
                alert('there was a syntaxError it and try again:' + err.message);
            } else {
                throw err;
            }
        }
    });
});