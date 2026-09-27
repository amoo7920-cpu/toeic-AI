export interface Segment {
  text: string;
  isSlot: boolean;
}

// 6-1/6-4: 렌더링된 모범답안 문장에서 슬롯(파란색)과 뼈대(회색)를 구분해 표시하기 위해
// slots 값들이 rendered 안에서 어디에 나오는지 찾아 구간을 나눈다.
export function highlightSlots(rendered: string, slots: Record<string, string>): Segment[] {
  const values = Object.values(slots).filter((v) => v && v.trim().length > 0);
  const sorted = [...values].sort((a, b) => b.length - a.length);

  const ranges: { start: number; end: number }[] = [];
  for (const value of sorted) {
    let searchFrom = 0;
    while (searchFrom <= rendered.length) {
      const idx = rendered.indexOf(value, searchFrom);
      if (idx === -1) break;
      const overlaps = ranges.some((r) => idx < r.end && idx + value.length > r.start);
      if (!overlaps) {
        ranges.push({ start: idx, end: idx + value.length });
        break;
      }
      searchFrom = idx + 1;
    }
  }
  ranges.sort((a, b) => a.start - b.start);

  const segments: Segment[] = [];
  let cursor = 0;
  for (const r of ranges) {
    if (r.start > cursor) segments.push({ text: rendered.slice(cursor, r.start), isSlot: false });
    segments.push({ text: rendered.slice(r.start, r.end), isSlot: true });
    cursor = r.end;
  }
  if (cursor < rendered.length) segments.push({ text: rendered.slice(cursor), isSlot: false });
  return segments;
}
