var board = [5,6,3,8,4,2,0,7,1],//[0,1,2,3,4,5,6,7,8,] [2,0,8,5,1,4,6,3,7] [2,4,1,6,8,0,3,5,7] [8,3,5,7,6,2,0,1,4] [2,6,4,3,0,1,8,5,7] [7,5,8,3,0,6,4,1,2]
 	solBoard = [1,2,3,4,5,6,7,8,0],
 	brnchs = [],
 	boardHistory = [],
 	isSolving = false,
 	depthFactor = 1,
 	prevBestBrnchVal = 100,
 	logging = true,
 	distCache = distArr();



var $squares = [
	$('#s1'),
	$('#s2'),
	$('#s3'),
	$('#s4'),
	$('#s5'),
	$('#s6'),
	$('#s7'),
	$('#s8'),
];
var classes = [
	"pos1",
	"pos2",
	"pos3",
	"pos4",
	"pos5",
	"pos6",
	"pos7",
	"pos8",
	"pos9"
];
var playerAbleToWin = false;

// updateBoard(board);
// randomizeBoard();
setTimeout(randomizeBoard, 50);

// solve(board);
// console.log('-------------');
// console.log(distCache);
// runBenchmark(1000,0,false);




//Event listeners

$('#board > div').click(function(){
	if(!$(this).hasClass("clickable")) return; //you can't click this tile...


	//find out which position we are switching
	tileToMove = classes.indexOf($(this).attr('class').split(' ')[0]);

	console.log("TTM: "+tileToMove);
	board = newBoardFromMove(board,tileToMove);

	updateBoard(board);
});

$('#randomize').click(function(){
  randomizeBoard();
});

$('#solve').click(function(){
	if(isSolving) return; //don't let people start another solution process while it's currently solving
	isSolving = true;


	var sol = solve(board);

	playerAbleToWin = false;

	if(sol != -1)
		iterateHistory(sol.history,200);
	else {
		isSolving = false;
		console.log('failed');
	}
});


//functions...

function randomizeBoard() {
  if(isSolving) return; //don't let people randomize while it's currently solving

  // shuffle board array until we reach a solvable position
	do {
		shuffleArray(board);
	} while(!boardSolvable(board));

	console.log('Starting board:',board);
	updateBoard(board);
	playerAbleToWin = true;
}

function iterateHistory(history, delay, i) {
	if(i == undefined)
		i = 0;
	if (i == history.length){
		isSolving = false;
		return;
	}

	board = newBoardFromMove(board, history[i]);
	updateBoard(board);

	setTimeout(function(){
		iterateHistory(history, delay,i+1);
	},delay);
}

function updateBoard(givenBoard) {
	emptyPos = givenBoard.indexOf(0);
	for (i = 0; i < 9; i++){
		var curTile = givenBoard[i] - 1;
		if (curTile == -1)
			continue;

		$squares[curTile].removeClass().addClass(classes[i]);

		if(distCache[emptyPos][i] == 1)//
			$squares[curTile].addClass("clickable");


	}
	if(arraysEqual(givenBoard,[1,2,3,4,5,6,7,8,0]) && playerAbleToWin ) {
			setTimeout(function(){ alert("Win!"); }, 500);
			playerAbleToWin = false;
	}
}


function findMoves(givenBoard){
	var emptyPos = givenBoard.indexOf(0);
	var moves = [];

	for (var i = 0; i < 9; i++){
		if(distCache[emptyPos][i] == 1)
			moves.push(i);
	}
	return moves;
}

function newBoardFromMove (givenBoard, move){
	var newBoard = givenBoard.slice();

	var emptyPos = givenBoard.indexOf(0);


	newBoard[emptyPos] = givenBoard[move];
	newBoard[move] = 0;

	return newBoard;
}

function deltaX(val1,val2){
	return Math.abs(val1 % 3 - val2 % 3);
}
function deltaY(val1,val2){
	return Math.abs(Math.floor(val1/3) - Math.floor(val2/3));
}

function dist(val1,val2) {
	// console.log("∆x: "+deltaX(val1,val2));
	// console.log("∆y: "+deltaY(val1,val2));
	// console.log("dist: "+(deltaY(val1,val2)+deltaX(val1,val2)) );
	if(val1 == val2) {
		return 0;
	} else {
		var delX = deltaX(val1,val2);
		var delY = deltaY(val1,val2);
		return (delX + delY);
	}
}

function distArr() {
	var distArray = [];
	for(var i = 0; i < 9; i++) {
		distArray[i] = [];
		for(var j = 0; j < 9; j++) {
			distArray[i][j] = dist(i,j);
		}
	}
	return distArray;
}

/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function arraysEqual(arr1, arr2) {
    if(arr1.length !== arr2.length)
        return false;
    for(var i = arr1.length; i--;) {
        if(arr1[i] !== arr2[i])
            return false;
    }

    return true;
}

function boardSolvable(givenBoard) {
	var inversions = 0;
	for (var i = 0; i < 8; i++) {
		if(givenBoard[i] <= 1) continue;

		var remainingBoard = givenBoard.slice(i+1);
		for (var j = 0; j < (8 - i); j++) {
			if(remainingBoard[j] == 0) continue;

			if(remainingBoard[j] < givenBoard[i]){
				inversions++;
				//console.log(givenBoard[i]+" > "+remainingBoard[j]);
			}
		}
	}
	return (inversions % 2 == 0);
}
//////////////////solving! /////////////////

function solve(givenBoard){


	var t1 = performance.now();

	var startBranch = createBranchFromBoard(givenBoard);
	prevBestBrnchVal = evaluateBranch(startBranch);
	brnchs = [startBranch];
	boardHistory = [numberfy(givenBoard)];

	for (var sol = false; !sol; sol = findSol(brnchs));

	var t2 = performance.now();

	if(logging)
		console.log('time: '+Math.round(t2-t1)+' millisec');//*******

	return sol; //////////////

}

function findSol(brnchs){
	//console.log('branches:',brnchs.slice());//*************************
	//console.log(boardHistory); //***********************
	if(brnchs.length == 0) return -1;

	var brnchCompare = [0, 10000];
	for(var i = 0; i < brnchs.length; i++) {
		var branchVal = evaluateBranch(brnchs[i]);
		//console.log(branchVal);
		if (branchVal < brnchCompare[1]) {


			brnchCompare[0] = i;
			brnchCompare[1] = branchVal;

			//skip the rest if it's already lower than its parent branch
			if(branchVal < prevBestBrnchVal) {
				break;
			}

		}
	}
	var bestBrnchIndex = brnchCompare[0];
	var bestBrnch = brnchs[bestBrnchIndex];

	//console.log('Best branch #'+(bestBrnchIndex+1)+' with value '+brnchCompare[1]+':',bestBrnch);//******************


	if(arraysEqual(bestBrnch.board,solBoard)){
		if(logging){
			console.log('solved!'); //**************************
			console.log('Branches explored: '+brnchs.length);
			console.log(bestBrnch);
		}
		return bestBrnch;

	} else {
		//console.log('Moving on...','--------------------');//******************



		Branch(brnchs,bestBrnchIndex);
		return false;
	}


}


function estimateCost(givenBoard) {
	var cost = 0;
	for (var i = 0; i < 9; i++) {
		var target = givenBoard[i] == 0 ? 8 : givenBoard[i] - 1;
		cost += distCache[target][i];//Math.abs(target - i);//
	}
	return cost;
}

function evaluateBranch(brnch){

	return (brnch.depth)*depthFactor + (brnch.cost);
}

function createBranchFromBoard(givenBoard){
	return {
		 board: givenBoard,
		 depth: 0,
		 cost: estimateCost(givenBoard),
		 history: [givenBoard.indexOf(0)],
	};
}
function Branch(brnchs,i){
	var curBrnch = brnchs[i];
	var curBoard = curBrnch.board;
	var moves = findMoves(curBoard);

	prevBestBrnchVal = evaluateBranch(curBrnch);
	brnchs.splice(i,1);

	//looping through possible moves
	moves:
	for(var j = 0; j < moves.length; j++){
		//don't allow return to previous state
		if(moves[j] == curBrnch.history[curBrnch.history.length -2])
			continue moves;

		var extendedBrnch = extendBranch(curBrnch,moves[j]);





		// if(brnchs.length > 5000) {

			 // for(var k = 0; k < boardHistory.length; k++) {
				 // if(arraysEqual(extendedBrnch.board,boardHistory[k]))
					 // continue moves;
			 // }
		// }

		//don't allow any board state previously reached!
		var boardNum = numberfy(extendedBrnch.board);
		if(boardHistory[boardNum])
			continue moves;
		else
			boardHistory[boardNum] = true;

		brnchs.unshift(extendedBrnch);
		//boardHistory.push(extendedBrnch.board);
	}

	//console.log(brnchs);
	return brnchs;


}
function extendBranch(brnch,move){
	var newBoard = newBoardFromMove(brnch.board,move);

	var newBrnch = {
		board: newBoard,
		cost: estimateCost(newBoard),
		depth: brnch.depth + 1,
		history: brnch.history.slice()
	};
	newBrnch.history.push(move);

	return newBrnch;
}

function numberfy(givenBoard){
	return Number(givenBoard.join(''));
}

function runBenchmark(times,depth,loggingArg){
	loggingSave = logging;
	logging = loggingArg;
	depthFactor = depth;

	var totalDepths = 0;
	var totalBrnchs = 0;
	var t1 = performance.now();
	var i = 0;
	while(i<times){
		do {
			shuffleArray(board);
		} while(!boardSolvable(board));

		if(logging)
			console.log(i+'-th Starting board: ',board);

		var soln = solve(board);
		totalBrnchs += brnchs.length;
		totalDepths += soln.depth;
		i++;
	}
	var t2 = performance.now();
	logging = loggingSave;

	console.log('Average time: '+((t2-t1)/times));
	console.log('Average branches: '+totalBrnchs/times);
	console.log('Average depth: '+totalDepths/times);
}
