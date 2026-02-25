export async function fetchSport(sport: string, date: string): Promise<any[]> {
  const res = await fetch(`/api/sports?sport=${sport}&date=${date}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.response || [];
}
