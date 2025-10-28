import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    budgets: {
      type: Map,
      of: Number,
      default: {}
    },
  },
  {
    timestamps: true,
    collection: 'Budgets',
  }
);

const Budget = mongoose.models.Budget || mongoose.model('Budget', budgetSchema);

export default Budget;
