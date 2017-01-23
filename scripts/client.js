/*
俄罗斯方块，做着玩一玩，2017年1月23日 18:09:22
*/
var gamePanel = $('#gamePanel');
gamePanel.width = 600;
gamePanel.height = 600;
var ctx = gamePanel.getContext("2d");
var $pause = $('#pause');
var $stop = $('#stop');
var $score = $('#score');
var gameArr = [];//游戏数组，30X30
var moveBlock = [];//记录正在移动的块所在的位置
var moveBlockLT = {};//记录正在移动的块的左上角的位置，用于图形的位置获取，算是基准点吧
var moveBlockInfo = {};//两个属性，一个块的类别，一个类别的方向，也就是记录当前移动的块在tetris数组中的位置
var nextMoveBlockInfo = {};//下一个块的类别和类别的方向，也就是记录新产生的块在tetris数组中的位置
var nextBlock = [];//下一个要出现的块的位置
var pause = false;//暂停
var stop = true;//结束
var speed = 10;//setInterval的速度
var downStep = 0;//控制下降速度
var downStep1 = 100;//控制下降速度
var score = 0;//分数

// var audio1 = document.createElement('audio');
// audio1.src = './audio/exploed.wav';
var audio2 = document.createElement('audio');
audio2.src = './audio/gameover.wav';
// var audio3 = document.createElement('audio');
// audio3.src = './audio/missile.wav';
var audio4 = document.createElement('audio');
audio4.src = './audio/wall.wav';

welcome();//显示欢迎

//初始化
function init(){
	gameArr = [];
	moveBlock = [];
	moveBlockLT = {};
	moveBlockInfo = {};
	nextMoveBlockInfo = {};
	nextBlock = [];
	pause = false;
	stop = false;
	score = 0;
	$score.innerHTML = score;
	downStep = 0;
	initGameArr();
	createBlock();
	getNextBlock();
	createBlock();
	game();
}

//游戏开始运行
function game(){
	id = setInterval(function (){
		if(downStep === 0){
			downStep = downStep1;
			downCollide();
		}
		draw();
		downStep--;
	}, speed);
}

//keypress事件监听
document.addEventListener('keydown', function(event){
	if(stop || pause){
		return;
	}
	event.preventDefault();
	switch(event.keyCode){
		case 37:
			// 整体左移函数
			left();
			break;
		case 38:
			// 改变图形的方向函数
			changeBlock();
			break;
		case 39:
			// 整体右移函数
			right();
			break;
		case 40:
			// 加速下降函数
			downStep1 = 3;
			break;
		default:
			break;
	}
});
// 下箭头抬起减速
document.addEventListener('keyup', function(event){
	if(stop || pause){
		return;
	}
	event.preventDefault();
	if(event.keyCode == 40){
		downStep1 = 100;
	}
});

$pause.addEventListener('click', function (){
	if(stop){
		return;
	}
	if(!pause){
		clearInterval(id);
		pause = true;
		$pause.innerHTML = 'play';
		$pause.title = '继续';
	}else{
		pause = false;
		game();
		$pause.innerHTML = 'pause';
		$pause.title = '暂停';
	}
});

var clickStop = true;//对点击进行限制，初次加载欢迎页显示完成后会改为false
$stop.addEventListener('click', function (){
	if(clickStop){
		return;
	}
	if(!stop){
		clickStop = true;
		gameover();
		$stop.innerHTML = 'start';
		$stop.title = '开始';
	}else{
		init();
		$stop.innerHTML = 'stop';
		$stop.title = '结束';
	}
});

//绘制函数，根据数组的内容绘制
function draw(){
	var p, x, y, i, j, k;
	ctx.fillStyle = "#828069";
	// 绘制新方块前进行是否堆积到顶层的判断
	for(k = 0; k < 4; k++){
		x = moveBlockLT.x + moveBlock[k].x;
		y = moveBlockLT.y + moveBlock[k].y;
		// 这里是一个关于绘制的问题，如果方块到达顶层就要使游戏结束，下面有必须要清空整个画布，
		// 因此不写上一个判断会导致出现一小段的画布空白
		if(gameArr[y][x]){
			for(k = 0; k < 4; k++){
				x = moveBlockLT.x + moveBlock[k].x;
				y = moveBlockLT.y + moveBlock[k].y;
				p = getPos(x, y);
				drawRect(p.x, p.y);
			}
			gameover();
			return;
		}else{
			if(k === 3){
				ctx.clearRect(0, 0, gamePanel.width, gamePanel.height);
			}
		}
	}
	// 未堆积到顶层，游戏未结束，绘制方块
	for(k = 0; k < 4; k++){
		x = moveBlockLT.x + moveBlock[k].x;
		y = moveBlockLT.y + moveBlock[k].y;
		p = getPos(x, y);
		drawRect(p.x, p.y);
	}
	for(k = 0; k < 4; k++){
		x = 22 + nextBlock[k].x;
		y = 10 + nextBlock[k].y;
		p = getPos(x, y);
		drawRect(p.x, p.y);
	}
	for(i = 0; i < 30; i++){
		for(j = 0; j < 30; j++){
			if(gameArr[i][j]){
				p = getPos(j, i);
				drawRect(p.x, p.y);
			}
		}
	}
}

// canvas在指定位置绘制一个方块
function drawRect(x, y){
	ctx.beginPath();
	ctx.fillStyle = "#000";
	ctx.fillRect(x-2, y-2, 22, 22);
	ctx.clearRect(x, y, 18, 18);
	ctx.fillRect(x+4, y+4, 10, 10);
	ctx.stroke();
}

//根据参数获取位置
function getPos(x, y){
	return {
		x:x*20,
		y:y*20
	};
}

//重置gameArr数组
function initGameArr(){
	for(var i = 0; i < 30; i++){
		gameArr[i] = [];
		for(var j = 0; j < 30; j++){
			gameArr[i][j] = false;
		}
	}
	for(i = 0; i < 30; i++){//一个显眼的分隔线
		gameArr[i][16] = true;
	}
}

//播放一次声音
function exploedAudio(src){
	var audio = document.createElement('audio');
	audio.src = src;
	audio.autoplay = true;
}

//获取单个DOM元素
function $(str){
	return document.querySelector(str);
}

//获取DOM集合
function $all(str){
	return document.querySelectorAll(str);
}

//游戏结束
function gameover(){
	exploedAudio('./audio/gameover.wav');
	clearInterval(id);
	stop = true;
	$pause.innerHTML = 'pause';
	$stop.innerHTML = 'start';
	$pause.title = '暂停';
	$stop.title = '开始';
	setTimeout(function(){
		gameoverAnmiation();
	}, 500);
}

//游戏结束动画
function gameoverAnmiation(){
	var i = 30, p;
	var t = setInterval(function(){
		if(i===0){
			clearInterval(t);
			ctx.clearRect(0, 0, gamePanel.width, gamePanel.height);
			welcome();
			return;
		}
		for(var j = 29; j >= 0; j--){
			p = getPos(i-1, j);
			drawRect(p.y, p.x);
		}
		i--;
	}, 40);
}

//等待和欢迎界面
function welcome(){
	var pos = [//welcome JYF
				[[18,18],[19,18],[20,18],[21,18],[22,18],[23,18],[24,18],[25,18],[18,19],[18,20],[18,21],[21,19],[21,20],[21,21]],
				[[20,14],[20,15],[21,14.5],[22,14.5],[23,14.5],[24,14.5],[25,14.5],[18,13],[19,13.5],[19,15.5],[18,16]],
				[[18,8],[18,9],[18,10],[18,11],[19,11],[20,11],[21,11],[22,11],[23,11],[24,11],[25,8.5],[24,8],[25,9.5],[25,10.5]],
				[[11,26], [12,26], [13,26], [10,27], [10,28], [14,27], [14,28], [12,27], [12,28], [12,29], [11,29]],
				[[11,20.5], [12,20.5], [13,20.5], [14,20.5], [10,21.5], [11,22.5], [12, 22.5], [13,22.5], [14,22.5], [10,23.5], [11,24.5], [12,24.5], [13,24.5], [14,24.5]],
				[[11,16], [12,16], [13,16], [10,17], [10,18], [14,17], [14,18], [11,19], [12,19], [13,19]],
				[[11,11.5], [12,11.5], [13,11.5], [10,12.5], [10,13.5], [14,12.5], [14,13.5], [11,14.5], [13,14.5]],
				[[6,10], [7,10], [8,10], [9,10], [10,10], [11,10], [12,10], [13,10], [14,10]],
				[[11,5.5], [12,5.5], [13,5.5], [10,6.5], [10,7.5], [14,6.5], [14,7.5], [12,6.5], [12,7.5], [12,8.5], [11,8.5]],
				[[10,0], [11,0], [12,0.5], [13,0.5], [14,1], [13,1.5], [12,2], [13,2.5], [14,3], [13,3.5], [12,3.5], [11,4], [10,4]]
			];
	var i = 10, p;
	var t = setInterval(function(){
		if(i===0){
			clearInterval(t);
			clickStop = false;//欢迎页显示完才能点击开始
			return;
		}
		for(var j = pos[i-1].length-1; j >= 0; j--){
			p = getPos(pos[i-1][j][0], pos[i-1][j][1]);
			drawRect(p.y, p.x);
		}
		i--;
	}, 300);
}

// 产生[x,y-1]之间的随机整数
function randomBetween(x, y){
	var n = parseInt(Math.random()*y+x);
	if(n === y) n = y;
	return n;
}