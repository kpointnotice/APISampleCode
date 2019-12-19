document.addEventListener('DOMContentLoaded', function() {
    const whiteboard = document.getElementById('whiteboard');
   
    let isDrawing = false;
    let context = whiteboard.getContext('2d');
   
    whiteboard.width = window.innerWidth;
    whiteboard.height = window.innerHeight;
   
    if (whiteboard) {
      let canvasX;
      let canvasY;
   
      setPen();
   
      whiteboard.addEventListener('mousedown', function(e) {
        isDrawing = true;
        canvasX = e.pageX - whiteboard.offsetLeft;
        canvasY = e.pageY - whiteboard.offsetTop;
   
        context.beginPath();
        context.moveTo(canvasX, canvasY);
      });
      whiteboard.addEventListener('mousemove', function(e) {
        if (isDrawing === false) return;
   
        canvasX = e.pageX - whiteboard.offsetLeft;
        canvasY = e.pageY - whiteboard.offsetTop;
        context.lineTo(canvasX, canvasY);
        context.stroke();
      });
      whiteboard.addEventListener('mouseup', function(e) {
        isDrawing = false;
        context.closePath();
      });
    }
   
    function setPen() {
      context.globalCompositeOperation = 'source-over';
      context.lineJoin = 'round';
      context.lineCap = 'round';
      context.strokeStyle = 'black';
      context.lineWidth = '5';
    }
  });