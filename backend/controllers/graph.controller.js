const Graph = require("../models/Graph");

const generateGraph = async (req, res) => {
  try {
    const { equation, graphType = "2d", xRange, yRange } = req.body;

    if (!equation) {
      return res.status(400).json({ error: "Equation required" });
    }

    // The backend no longer generates massive math point arrays.
    // That introduces lag. We defer plotting coordinates to 'math.js' on the client side.

    const layout = {
      title: `Graph: ${equation}`,
      xaxis: { title: "X-axis" },
      yaxis: { title: "Y-axis" },
      plot_bgcolor: "rgba(240, 240, 250, 0.5)",
      paper_bgcolor: "rgba(255, 255, 255, 0.1)",
    };

    const graph = new Graph({
      graphType,
      data: {}, 
      layout,
      plotlyJSON: { layout }, // Only save formatting/metadata
    });

    await graph.save();

    res.json({
      success: true,
      graphId: graph._id,
      equation, // Frontend uses this with math.js to draw Plotly traces
      plotlyData: { layout },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const exportGraph = async (req, res) => {
  try {
    const { id } = req.params;
    const { format = "png" } = req.query;

    const graph = await Graph.findById(id);

    if (!graph) {
      return res.status(404).json({ error: "Graph not found" });
    }

    res.json({
      success: true,
      graphId: id,
      format,
      plotlyJSON: graph.plotlyJSON,
      message: `Graph settings exported. Data must be re-rendered via client for export.`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { generateGraph, exportGraph };
