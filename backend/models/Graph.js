const mongoose = require("mongoose");

const GraphSchema = new mongoose.Schema({
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem",
  },
  graphType: {
    type: String,
    enum: ["2d", "3d", "parametric"],
    default: "2d",
  },
  data: mongoose.Schema.Types.Mixed,
  layout: mongoose.Schema.Types.Mixed,
  imageUrl: String,
  plotlyJSON: mongoose.Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Graph", GraphSchema);
