
    // 画卡通头像
    const canvas = document.getElementById('avatarCanvas');
    const ctx = canvas.getContext('2d');
    
    // 脸
    ctx.fillStyle = '#ffe0bd';
    ctx.beginPath();
    ctx.arc(100, 100, 80, 0, Math.PI * 2);
    ctx.fill();
    
    // 头发
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.arc(100, 80, 70, Math.PI, 0);
    ctx.fill();
    
    // 眼睛
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(75, 90, 15, 0, Math.PI * 2);
    ctx.arc(125, 90, 15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.arc(80, 90, 7, 0, Math.PI * 2);
    ctx.arc(130, 90, 7, 0, Math.PI * 2);
    ctx.fill();
    
    // 嘴
    ctx.strokeStyle = '#c4334c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(100, 115, 25, 0.1, Math.PI - 0.1);
    ctx.stroke();