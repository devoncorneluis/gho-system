export function getBillingCycle(date: Date) {
  const day = date.getDate();

  if (day <= 15) {
    return {
      cycle: "First Half",
      closesOn: 15,
    };
  }

  return {
    cycle: "Second Half",
    closesOn: "End of Month",
  };
}