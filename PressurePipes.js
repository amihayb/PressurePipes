
function plotMe() {

    var myPlot = document.getElementById('plot');

    var data = [];
    for (var i = 1; i < 4; i++)
        addPipe(data, i.toString());

    var layout = {
        grid: {
            rows: 2,
            columns: 1,
            pattern: 'coupled',
            roworder: 'top to bottom'
          },
        title: 'Head Loss vs Pipe Fill',
        xaxis: {
            title: 'Flow [m<sup>3</sup>/hr]'
        }, 
        yaxis: {
            title: 'Head Loss [m]'
        },
        yaxis2: {
            title: 'Velocity [m/s]'
        }
    }
    Plotly.newPlot('plot', data, layout, {editable: true});

    addTable();

    myPlot.on('plotly_click', function(data){
        var pts = '';
        for(var i=0; i<data.points.length; i++){
            if (data.points[i].data.yaxis=='y') {
            annotate_text = 'Q = '+data.points[i].x +
                          ' m<sup>3</sup>/hr<br>HL = '+data.points[i].y.toPrecision(4) + ' m';
            } else {
                annotate_text = 'Q = '+data.points[i].x +
                ' m<sup>3</sup>/hr<br>v = '+data.points[i].y.toPrecision(2) + ' m/s';
            };

            annotation = {
              text: annotate_text,
              x: data.points[i].x,
              y: parseFloat(data.points[i].y.toPrecision(4)),
              xref: data.points[0].xaxis._id,
              yref: data.points[0].yaxis._id
            }
            annotations = plot.layout.annotations || [];
            annotations.push(annotation);
            Plotly.relayout('plot',{annotations: annotations})
        }
    });
}

function addPipe(data, pipeNum) {
    if (document.getElementById('pipe'+ pipeNum).checked){
        let Q = parseFloat( document.getElementById('txt_Q' + pipeNum).value );
        let D = parseFloat( document.getElementById('txt_D' + pipeNum).value );
        let C = parseFloat( document.getElementById('txt_C' + pipeNum).value );
        let L = parseFloat( document.getElementById('txt_L' + pipeNum).value );
        let nmSlope = 'txt_slope' + pipeNum;
        var flowData = calcLine(Q,D,C,L);
        data.push(addLine(pipeNum,1,flowData.Q,flowData.headLoss));
        data.push(addLine(pipeNum,2,flowData.Q,flowData.V));
        //data.push(calcLine(D,slope));
        //return calcLine(D,slope);
}
    return;

function calcLine(Qnom, D, C, L) {
    // Hazen-Williams Equation - calculating Head Loss in Water Pipes
	
	Fa = 0.002131*1000;
	var A = 3.14*(D/1000)**2 / 4;
	
	Qv = makeArr(0,2*Qnom,101);
	let DHv = [];
    let Vv = [];
	
	Qv.forEach(Q => {
 		let Dhm = L * Fa * (100/C)**1.85 * (Q/3600)**1.85 * (D/1000)**-4.8655; // Head loss [m]
		let V = Q / A / 3600;   // Flow velocity [m^3/hr]

		DHv.push(Dhm);
		Vv.push(V);
	});
	
	let res = {'Q':Qv, 'headLoss':DHv, 'V':Vv};
    return res;
    }

    function addLine(vNum, ax, x,y) {

        var trace = {
          x: x,
          y: y,
          yaxis: 'y' + ax,
          name: 'pipe'+ vNum,
          legendgroup: 'pipe'+ vNum,
          line: {
              color: getColor(vNum-1)
          },
          showlegend: isOdd(ax),
          type: 'scatter',
        };
        return trace;
      } 
    /*var trace = {
        x: 100*fill, 
        y: Qv, 
        name: 'pipe'+ pipeNum,
        xaxis: 'x',
        yaxis: 'y',
        type: 'scatter'
    }
    return trace;*/

}

function addTable() {

    let sdr =  [17, 13.6, 11, 9];
    let D = [16, 20, 25, 32, 40, 50,63,75,90,110,125,140,160,200,225,250,280,315,355,400,450,500,560,630,710,800];
    let values = [D,[],[],[],[]];

    sdr.forEach((s, idxc) => {
        D.forEach(d => {
            values[idxc+1].push( Math.round( (d-d/s*2) * 10 + Number.EPSILON ) / 10 );
        });
    });
//console.log(values);

var data = [{
type: 'table',
header: {
  values: [["<b>D [mm]</b>"], ["<b>PN10</b>"],
               ["<b>PN12.5</b>"], ["<b>PN16</b>"], ["<b>PN20</b>"]],
  align: "center",
  line: {width: 1, color: 'black'},
  fill: {color: "grey"},
  font: {family: "Arial", size: 12, color: "white"}
},
cells: {
  values: values,
  align: "center",
  line: {color: "black", width: 1},
  font: {family: "Arial", size: 12, color: ["black"]}
}
}]
var layout = {
    autosize: true,
    height: 200,
    margin: {
      l: 0,
      r: 0,
      b: 0,
      t: 0,
      pad: 4
    },
  };

Plotly.newPlot('pipes_table', data, layout);
}

function makeArr(startValue, stopValue, cardinality) {
    var arr = [];
    var step = (stopValue - startValue) / (cardinality - 1);
    for (var i = 0; i < cardinality; i++) {
        arr.push(startValue + (step * i));
    }
    return arr;
}

function getColor(n) {

    let colorVec = [
    '#1f77b4',  // muted blue
    '#ff7f0e',  // safety orange
    '#2ca02c',  // cooked asparagus green
    '#d62728',  // brick red
    '#9467bd',  // muted purple
    '#8c564b',  // chestnut brown
    '#e377c2',  // raspberry yogurt pink
    '#7f7f7f',  // middle gray
    '#bcbd22',  // curry yellow-green
    '#17becf'];   // blue-teal

    return colorVec[n];
}

let isOdd = (num) => (num & 1) ? true : false;