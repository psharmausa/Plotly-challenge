// Initializing the page and calling the other functions
function init() {

   // Grabbing the dropdown element
    d3.json("static/js/samples.json").then(function(samplesData){

       let selector = d3.select('#selDataset');

       let names = samplesData.names;

       selector.selectAll('option')
           .data(names)
           .enter()
           .append('option')
           .attr('value', d => d)
           .text(d => d);

       // Take in the first name upon loading the page
       let starter = names[0];

       // Call other functions using starter name
       buildPlots(starter);
       demographics(starter);

   });//.catch(error => console.log(error));
};

// Dynamic changing of plots and demographics upon change in dropdown
function optionChanged(newID){
   buildPlots(newID);
   demographics(newID);
};

// Cleaning up the demographic keys
function proper(str){
   return str.toLowerCase().split(' ').map(letter => {
       return (letter.charAt(0).toUpperCase() + letter.slice(1));
   }).join(' ');
}

// Demographics
function demographics(id) {
   // To build the demographics section we need to import the data again
   d3.json('static/js/samples.json').then(function(samplesData){
       let filtered = samplesData.metadata.filter(sample => sample.id == id);
       
       // Selecting the meta-data id on the html page
       let selection = d3.select('#sample-metadata');

       // Clear any data already present
       selection.html('');

       // Appending data extracted into the panel
       Object.entries(filtered[0]).forEach(([k,v]) => {
           // console.log(k,v)
           selection.append('h5')
               .text(`${proper(k)}: ${v}`);
       });

     })
}
// Building Bar Chart and Bubble Chart
function buildPlots(id) {
   // Reading in the json dataset
   d3.json("static/js/samples.json").then(function(samplesData){
       console.log(samplesData);
       // Filtering for the id selected
       let filtered = samplesData.samples.filter(sample => sample.id == id);
       let result = filtered[0];
       console.log(filtered)
       console.log(result)

       // creating variables and storing the top 10 in an array

       Data = [];
       for (i=0; i<result.sample_values.length; i++){
           Data.push({
               id: `OTU ${result.otu_ids[i]}`,
               value: result.sample_values[i],
               label: result.otu_labels[i]
           });
       }
       console.log(Data);

       // Sorting the data and slicing for top10 from activity3-10 
       let Sorted = Data.sort(function sortFunction(a,b){
           return b.value - a.value;
       }).slice(0,10);
       console.log(Sorted)

       // Since horizontal bar chart, need to reverse to display from top to bottom in descending order
       let reversed = Sorted.sort(function sortFunction(a,b){
           return a.value - b.value;
       })
       console.log(reversed);

       // Trace for Horizontal Bar Chart
      
       let traceBar = {
           type: "bar",
           orientation: 'h',
           x: reversed.map(row=> row.value),
           y: reversed.map(row => row.id),
           text: reversed.map(row => row.label)
           
         };
       
       let Bardata = [traceBar];
         
       let Barlayout = {
           title: `<span style='font-size:1em; color:#00bcf2'><b>Top 10 OTUs for Subject ${id}<b></span>`,
           xaxis: {autorange: true, title: 'Sample Values'},
           yaxis: {autorange: true}
         };
       
       // Creating the Horizontal Bar Chart
       Plotly.newPlot("bar", Bardata, Barlayout);

       // Bubble Chart
       let traceBubble = {
           x: result.otu_ids,
           y: result.sample_values,
           mode: 'markers',
           marker: {
               size: result.sample_values,
               color: result.otu_ids,
               colorscale: 'Jet'
           },
           text: result.otu_labels
       };

       let Bubbledata = [traceBubble]

       let Bubblelayout = {
           title: `<span style='font-size:1em; color:#00bcf2'><b>OTU Data for Subject ${id}<b></span>`,
           xaxis: {title:'OTU ID'},
           yaxis: {title: 'Sample Values'},
           width: window.width
       };

       // Creating Bubble Chart
       Plotly.newPlot('bubble', Bubbledata, Bubblelayout);

   })
}

init();