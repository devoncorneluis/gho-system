export function getIncidentSla(createdAt: string) {
  const created = new Date(createdAt).getTime();
  const minutes = Math.floor(
    (Date.now() - created) / 60000
  );

  if (minutes >= 30) {
    return {
      minutes,
      colour: "text-red-600",
      label: "Over SLA",
    };
  }

  if (minutes >= 15) {
    return {
      minutes,
      colour: "text-yellow-600",
      label: "Warning",
    };
  }

  return {
    minutes,
    colour: "text-green-600",
    label: "Within SLA",
  };
}