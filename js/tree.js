d3.json("data/data.json").then(data => {
    const width = 1500;
    const height = 1000;

    const svg = d3.select("#tree").append("svg")
        .attr("width", width)
        .attr("height", height);

    const g = svg.append("g")
        .attr("transform", "translate(40,0)");

    const root = d3.hierarchy(data);
    const nodes = root.descendants();
    const links = root.links();

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide().radius(50).strength(0.7))
        .on("tick", ticked);

    const link = g.selectAll(".link")
        .data(links)
        .enter().append("line")
        .attr("class", "link");

    const node = g.selectAll(".node")
        .data(nodes)
        .enter().append("g")
        .attr("class", "node")
        .on("click", click)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append("image")
        .attr("xlink:href", d => d.data.image)
        .attr("x", -24)
        .attr("y", -24)
        .attr("width", 48)
        .attr("height", 48);

    node.append("text")
        .attr("dy", 35)
        .attr("text-anchor", "middle")
        .text(d => d.data.name);

    function ticked() {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("transform", d => `translate(${d.x},${d.y})`);
    }

    function click(event, d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        update();
    }

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    function update() {
        const showCommands = d3.select("#commands").property("checked");
        const showBases = d3.select("#bases").property("checked");
        const showDeltas = d3.select("#deltas").property("checked");
        const showSquadrons = d3.select("#squadrons").property("checked");

        node.style("display", d => {
            if (d.depth === 1 && !showCommands) return "none"; // Commands
            if (d.depth === 2 && !showBases) return "none"; // Bases
            if (d.depth === 3 && !showDeltas) return "none"; // Deltas
            if (d.depth === 4 && !showSquadrons) return "none"; // Squadrons
            return "block";
        });

        link.style("display", d => {
            if (d.source.depth === 1 && !showCommands) return "none"; // Commands
            if (d.source.depth === 2 && !showBases) return "none"; // Bases
            if (d.source.depth === 3 && !showDeltas) return "none"; // Deltas
            if (d.source.depth === 4 && !showSquadrons) return "none"; // Squadrons
            return "block";
        });
    }

    d3.selectAll("input[type=checkbox]").on("change", update);
    update(); // Initial update to set visibility based on initial checkbox states
});
