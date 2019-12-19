Canvas = require('canvas');
fs = require('fs');

//parse input
input = parseFile("input.txt");

//set inital hoover position
var curX = input['startX'];
var curY = input['startY'];

//set inital hoover position
const roomX = input['roomX'];
const roomY = input['roomY'];

//array of current dirt spots
var dirtSpots = input['dirtSpots'].slice();

//we haven't cleaned any dirt spots yet
var cleaned = 0;

//initiate canvas
canvas = Canvas.createCanvas((roomX*100)+20, (roomY*100)+20);
ctx = canvas.getContext('2d');
ctx.fillStyle = "#FFFFFF";
ctx.fillRect(0, 0, canvas.width, canvas.height);

//move through each cardinal direction provided
for (i = 0; i < input['instructions'].length; i++) {
    
    step = input['instructions'][i];

    switch(step){
        case 'N': //move up if we haven't hit the wall
            if(curY<roomY-1){curY++;}
            break;
        case 'S': //move down if we haven't hit the wall
            if(curY>0){curY--;}
            break;
        case 'E': //move right if we haven't hit the wall
            if(curX<roomX-1){curX++;}
            break;
        case 'W': //move left if we haven't hit the wall
            if(curX>0){curX--;}
            break;
    }

    //color the box blue on the canvas
    ctx.fillStyle = '#0099FF';
    ctx.fillRect(curX*100+10,Math.abs(curY-roomY)*100-90,100,100);
    ctx.save();
    
    //check to see if we've hit a dirt spot
    if (dirtSpots.includes(curX+' '+curY)) {

        //count our progress
        cleaned++;
        
        //lets... "clean" ... the array of this dirt spot
        var index = dirtSpots.indexOf(curX+' '+curY);

        if (index > -1) {
            dirtSpots.splice(index, 1);
        }
    }
}

//color the start position green
ctx.fillStyle = '#008000';
ctx.fillRect(input['startX']*100+10,Math.abs(input['startY']-roomY)*100-90,100,100);
ctx.fillStyle = '#FFFFFF';
ctx.font = "20px Arial";
ctx.textAlign = "center";
ctx.fillText("Start", input['startX']*100+60,Math.abs(input['startY']-roomY)*100-30);

//color the end position red
ctx.fillStyle = '#800000';
ctx.fillRect(curX*100+10,Math.abs(curY-roomY)*100-90,100,100);
ctx.fillStyle = '#FFFFFF';
ctx.font = "20px Arial";
ctx.textAlign = "center";
ctx.fillText("End", curX*100+60,Math.abs(curY-roomY)*100-30);
ctx.save();

//label each position that originally had dirt
for (d=0; d<input['dirtSpots'].length; d++){
    dirtX = input['dirtSpots'][d].split(" ")[0];
    dirtY = input['dirtSpots'][d].split(" ")[1];
    
    var index = dirtSpots.indexOf(dirtX+' '+dirtY);

    if (index > -1) {
        //if it wasn't cleaned, the background will be black
        ctx.fillStyle = '#000000';
    } else {
        //if it was cleaned, the background will be light blue
        ctx.fillStyle = '#66C1FF'; 
    }
    ctx.fillRect(dirtX*100+10,Math.abs(dirtY-roomY)*100-10,100,20);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = "15px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Dirt", dirtX*100+60,Math.abs(dirtY-roomY)*100+5);
    ctx.save();
}

//draw the grid borders to make it look clean
drawGrid(roomX * 100, roomY * 100, 10);

//output to state.png
var out = fs.createWriteStream(__dirname + '/hooverOutputMap.png')
, stream = canvas.createPNGStream();

stream.on('data', function(chunk){
  out.write(chunk);
});

//output the results
process.stdout.write(curX+' '+curY+'\n'); //current "X Y" coordinates
process.stdout.write(cleaned+'\n'); //count of how many dirt spots we've cleaned


//function for parsing the input file
function parseFile(file)
{
    //read the file and split it by line
    //var fs = require('fs');
    var contents = fs.readFileSync(file, 'utf8');
    var textByLine = contents.split("\n");

    var instructionObject = {};
    
    //the first line holds the room dimensions (X Y), separated by a single space (all coordinates will be presented in this format)
    instructionObject['roomX'] = textByLine[0].split(" ")[0];
    instructionObject['roomY'] = textByLine[0].split(" ")[1];

    //the second line holds the hoover position
    instructionObject['startX'] = textByLine[1].split(" ")[0];
    instructionObject['startY'] = textByLine[1].split(" ")[1];

    //subsequent lines contain the zero or more positions of patches of dirt (one per line)
    instructionObject['dirtSpots'] = [];

    for (i = 2; i < textByLine.length-1; i++) {
        instructionObject['dirtSpots'].push(textByLine[i]);
    }

    //the next line then always contains the driving instructions (at least one)
    instructionObject['instructions'] = textByLine[textByLine.length-1];

    return (instructionObject);
}

//function for drawing a grid on the canvas
function drawGrid(bw,bh,p){
    for (var x = 0; x <= bw; x += 100) {
        ctx.moveTo(0.5 + x + p, p);
        ctx.lineTo(0.5 + x + p, bh + p);
    }

    for (var x = 0; x <= bh; x += 100) {
        ctx.moveTo(p, 0.5 + x + p);
        ctx.lineTo(bw + p, 0.5 + x + p);
    }
    ctx.strokeStyle = "black";
    ctx.stroke();
}