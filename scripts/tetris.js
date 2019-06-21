var tetris = [//记录所有图案的数组，从下往上，从左往右
	[
		[{x:0,y:1},{x:1,y:1},{x:1,y:0},{x:0,y:0}]
	],
	[
		[{x:0,y:0},{x:1,y:0},{x:2,y:0},{x:3,y:0}],
		[{x:0,y:3},{x:0,y:2},{x:0,y:1},{x:0,y:0}]
	],
	[
		[{x:0,y:2},{x:0,y:1},{x:1,y:1},{x:1,y:0}],
		[{x:1,y:1},{x:2,y:1},{x:0,y:0},{x:1,y:0}]
	],
	[
		[{x:1,y:2},{x:0,y:1},{x:1,y:1},{x:0,y:0}],
		[{x:0,y:1},{x:1,y:1},{x:1,y:0},{x:2,y:0}]
	],
	[
		[{x:1,y:2},{x:1,y:1},{x:0,y:0},{x:1,y:0}],
		[{x:0,y:1},{x:0,y:0},{x:1,y:0},{x:2,y:0}],
		[{x:0,y:2},{x:1,y:2},{x:0,y:1},{x:0,y:0}],
		[{x:0,y:1},{x:1,y:1},{x:2,y:1},{x:2,y:0}]
	],
	[
		[{x:0,y:2},{x:0,y:1},{x:0,y:0},{x:1,y:0}],
		[{x:0,y:1},{x:1,y:1},{x:2,y:1},{x:0,y:0}],
		[{x:0,y:2},{x:1,y:2},{x:1,y:1},{x:1,y:0}],
		[{x:2,y:1},{x:0,y:0},{x:1,y:0},{x:2,y:0}]
	],
	[
		[{x:0,y:1},{x:1,y:1},{x:2,y:1},{x:1,y:0}],
		[{x:0,y:2},{x:0,y:1},{x:1,y:1},{x:0,y:0}],
		[{x:1,y:1},{x:0,y:0},{x:1,y:0},{x:2,y:0}],
		[{x:1,y:2},{x:0,y:1},{x:1,y:1},{x:1,y:0}]
	]
];

function createBlock(){//随机产生一个图形并改变下面的变量
	var i1 = randomBetween(0, 7);
	var i2 = randomBetween(0, tetris[i1].length);
	nextMoveBlockInfo.i1 = i1;
	nextMoveBlockInfo.i2 = i2;
	nextBlock = tetris[i1][i2];
}

function getNextBlock(){
	moveBlockInfo.i1 = nextMoveBlockInfo.i1;
	moveBlockInfo.i2 = nextMoveBlockInfo.i2;
	moveBlockLT.x = 6;
	moveBlockLT.y = 0;
	moveBlock = nextBlock;
}

function downCollide(){//图案每次下降一格之前进行的一次碰撞检测
	// 如果发生碰撞将图案的信息填在数组里并且进行一次eliminate
	// 不发生碰撞修改moveBlock、moveBlockLT
	for(var i = 0; i < 4; i++){
		var x = moveBlock[i].x + moveBlockLT.x;
		var y = moveBlock[i].y + moveBlockLT.y;
		if( (y+1>29) || gameArr[y+1][x]){//到达边界或发生碰撞
			for(var j = 0; j < 4; j++){
				gameArr[moveBlock[j].y + moveBlockLT.y][moveBlock[j].x + moveBlockLT.x] = true;
			}
			eliminate();
			break;
		}else{
			if(i === 3){
				moveBlockLT.y += 1;
			}
		}
	}
}

function eliminate(){//检测数组每一行是否满了
	//满了就删掉将数组整体下移，分数加一
	for(var i = 29; i > -1; i--){
		for(var j = 0; j < 16; j++){
			if(gameArr[i][j]){
				if(j === 15){
					score += 1;
					$score.innerHTML = score;
					for(var k = i-1; k > -1; k--){//整体下移
						for(var h = 0; h < 16; h++){
							gameArr[k+1][h] = gameArr[k][h];
						}
					}
					for(k = 0; k < 16; k++){//对最后一行进行处理
						gameArr[0][k] = false;
					}
					i++;
					exploedAudio('./audio/wall.wav');
				}
			}else{
				break;
			}
		}
	}
	downStep1 = 100;
	getNextBlock();
	createBlock();
}

function left(){//整体左移
	for(var i = 0; i < 4; i++){
		var x = moveBlockLT.x;
		var y = moveBlock[i].y + moveBlockLT.y;
		if( (x-1<0) || gameArr[y][x-1]){//到达边界或发生碰撞
			break;
		}else{
			if(i === 3){
				moveBlockLT.x -= 1;
			}
		}
	}
}

function right(){//整体右移
	for(var i = 0; i < 4; i++){
		var x = moveBlock[i].x + moveBlockLT.x;
		var y = moveBlock[i].y + moveBlockLT.y;
		if( (x+1>16) || gameArr[y][x+1]){//到达边界或发生碰撞
			break;
		}else{
			if(i === 3){
				moveBlockLT.x += 1;
			}
		}
	}
}

function changeBlock(){
	// 是否可以进行改变
	// moveBlock
	// 改变的时候以左上角做基准
	// moveBlockInfo

	// 先找到将要改变成的样子
	var nB;
	if(moveBlockInfo.i2+1 === tetris[moveBlockInfo.i1].length){
		nB = tetris[moveBlockInfo.i1][0];
		moveBlockInfo.i2 = 0;
	}else{
		nB = tetris[moveBlockInfo.i1][moveBlockInfo.i2+1];
		moveBlockInfo.i2 += 1;
	}
	// 进行是否可以改变形状的判断
	for(var i = 0; i < 4; i++){
		var x = nB[i].x + moveBlockLT.x;
		var y = nB[i].y + moveBlockLT.y;
		if( (x+1>16)|| (x-1<-1) || (y+1>30) || gameArr[y][x]){//到达边界或发生碰撞
			return;
		}
	}
	moveBlock = nB;
}