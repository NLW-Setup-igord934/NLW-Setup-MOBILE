export function generateProgessPercentage(total: number, completed: number) {
  return Math.round((completed * 100) / total);
}
