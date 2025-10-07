import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    description: { type: String },
    date: { type: Date, required: true },
  },
  {
    timestamps: true,
    collection: 'Expenses',
  }
);

const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);

export default Expense;
