import { connectDb } from '../db';
import MathProblem from '../models/MathProblem';
import MathFormulaVault from '../models/MathFormulaVault';
import { PROBLEMS, FORMULA_VAULTS } from './math-data';

export const INITIAL_MATH_PROBLEMS = PROBLEMS;
export const INITIAL_FORMULA_VAULTS = FORMULA_VAULTS;

export async function seedMathIfEmpty() {
  await connectDb();
  const count = await MathProblem.countDocuments();
  if (count === 0) {
    console.log('[MathSeeder] Seeding initial math problems...');
    await MathProblem.insertMany(INITIAL_MATH_PROBLEMS);
    console.log(`[MathSeeder] Seeded ${INITIAL_MATH_PROBLEMS.length} math problems successfully.`);
  }

  const formulaCount = await MathFormulaVault.countDocuments();
  if (formulaCount === 0) {
    console.log('[MathSeeder] Seeding math formula vaults...');
    await MathFormulaVault.insertMany(INITIAL_FORMULA_VAULTS);
    console.log(`[MathSeeder] Seeded ${INITIAL_FORMULA_VAULTS.length} formula vaults.`);
  }
}
