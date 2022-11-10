
async function manageVisualizations(){

  const size = {
    width: 600,
    height:400 }
  const speed = 1000;
  const data = await d3.csv("data/radiohead.csv");
  data.forEach((d)=>{
    d.pct_sad*= 100; // scale pct_sad to 0-100
    d.valence*= 100; // scale valence to 0-100
  });

  const svg = d3.select("#vis")
    .append("svg")
    .attr("viewBox", [0, 0, size.width, size.height])
    .style("height", `${size.height}px`)
    .style("width", `${size.width}px`);

  const barchart = svg.append("g").attr("opacity", 0);
  drawBarchart(barchart, data, size); // also: barchart.call(drawBarchart, data, size);
  const histogram = svg.append("g").attr("opacity", 0);
  
  const scroll = scroller();
  scroll(d3.selectAll("section"));
  scroll.on("section-change", (section)=>{
    switch(section){
      case 0:
        //console.log("gloom bar");
        barchart.transition().attr("opacity", 1).duration(speed);
        histogram.transition().attr("opacity", 0).duration(speed);
        break;
      case 1:
        //console.log("valence histogram");
        barchart.transition().attr("opacity", 0).duration(speed);
        drawHistogram(histogram, data, "valence", "Valence", size, speed)
        break;
      case 2:
        //console.log("sad histogram");
        drawHistogram(histogram, data, "pct_sad", "Percentage of the song with sad lyrics", size, speed)
        break;
      case 3:
        //console.log("gloom histogram");
        drawHistogram(histogram, data, "gloom_index", "Gloom Index", size, speed)
        break;
      default:
        //console.log("uh");
    }
  });
  
}

function drawHistogram(g, data, metric, title, size, speed){
  const margin = {left:40, right:15, top:15, bottom:40};
  const {width, height} = size;
 
  const x = d3.scaleLinear()
    .domain([0,100]) // we've normalized the data to fit in this scale
    .range([margin.left, width-margin.right])
    .nice();

  const makeBins = d3.bin()
    .value((d)=>+d[metric])
    .domain(x.domain())
    .thresholds(20);
  const bins = makeBins(data);

  const y = d3.scaleLinear()
    .domain([0, d3.max(bins, d=>d.length) ])
    .range([height - margin.bottom, margin.top])
    .nice();   

  g.selectAll(".bin")
    .data(bins, d => d.x0)
    .join(
      enter=>enter
        .append("rect")
        .attr("x",(d)=>x(d.x0) + 1)
        .attr("y", y(0))
        .attr("width", d => x(d.x1) - x(d.x0) - 2)
        .attr("height", 0)
        .attr("class", "bin")
        .style("fill", "currentColor")
        .transition()
          .duration(speed)
          .attr("y", d=>y(d.length))
          .attr("height", d=>y(0) - y(d.length)),
      update=>update
        .transition()
        .duration(speed)
        .attr("y", d=>y(d.length))
        .attr("height", d=>y(0) - y(d.length)),
      exit=>exit
        .transition()
        .duration(speed)
        .attr("y", y(0))
        .attr("height", 0)
        .remove()
    )
  
  let xAxis = g.select("#x-axis");
  if (xAxis.empty()){
    xAxis = g.append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(x));
  }
  let yAxis = g.select("#y-axis");
  if (yAxis.empty()){
    yAxis = g.append("g")
    .attr("id", "y-axis")
    .attr("transform", `translate(${margin.left}, 0)`)
  }
  yAxis.transition().call(d3.axisLeft(y));

  titleTxt = g.select("#title")
  if(titleTxt.empty()){
    g.append("text")
      .attr("id", "title")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${width/2}, ${height - 5})`)
      .style("font-weight", "bold")
  }
  titleTxt.transition().text(title);

  g.selectAll("text")
    .style("font-size","12px")
    .style("fill", "currentColor")

  g.transition()
    .duration(speed)
    .attr("opacity", 1);

}

function drawBarchart(g, data, size){
  const margin = {left:165, right:15, top:15, bottom:40};
  const {width, height} = size;


  const albumData = d3.rollups(data, v=>d3.mean(v, d=>d.gloom_index), d=>`${d.album_name} (${d.album_release_year})`);

  const x = d3.scaleLinear()
    .domain([0, d3.max(albumData, d=>d[1])])
    .range([margin.left, width - margin.right])
    .nice();

  const albums = albumData.map(d=>d[0]);
  albums.reverse();

  const y = d3.scaleBand()
    .domain(albums)
    .range([height - margin.bottom, margin.top])
    .padding(0.1);

  g.selectAll("rect")
    .data(albumData)
    .join("rect")
    .attr("x", x(0))
    .attr("y", (d) => y(d[0]))
    .attr("width", (d,i) => x(d[1])-x(0))
    .attr("height", y.bandwidth())
    .style("fill", d=> d[0] === "A Moon Shaped Pool (2016)" ? "#26c" : "currentColor");


  // Draw the axes
  const xAxis = g.append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  const yAxis = g.append("g")
    .attr("id", "y-axis")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y));

// label the graph
  g.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${width/2}, ${height - 5})`)
      .style("font-weight", "bold")
      .text("Gloom Index");


  g.selectAll("text")
    .style("font-size","12px")
    .style("fill", "currentColor")

}

manageVisualizations();