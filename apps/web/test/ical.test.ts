import { describe, expect, it } from "vitest";
import { clipRanges, mergeRanges, parseIcal, toIsoDate } from "../src/api/ical";

// Raw text, CRLF line endings kept (Vite ?raw import).
import sample from "./fixtures/airbnb-sample.ics?raw";
// The Cottage's real export, saved 15 Oct 2026 (UIDs replaced; it held no guest data).
import cottage from "./fixtures/airbnb-cottage-2026-10-15.ics?raw";

const cal = (...events: string[]) =>
  ["BEGIN:VCALENDAR", "VERSION:2.0", ...events, "END:VCALENDAR"].join("\r\n");
const ev = (start: string, end?: string) =>
  [
    "BEGIN:VEVENT",
    `DTSTART;VALUE=DATE:${start}`,
    ...(end ? [`DTEND;VALUE=DATE:${end}`] : []),
    "SUMMARY:Reserved",
    "END:VEVENT",
  ].join("\r\n");

describe("parseIcal", () => {
  it("reads an Airbnb export (format of a real feed; personal fields replaced)", () => {
    expect(parseIcal(sample)).toEqual([
      { from: "2026-10-16", to: "2026-10-19" },
      { from: "2026-10-19", to: "2026-10-23" },
      { from: "2026-11-06", to: "2026-11-07" },
      { from: "2026-12-24", to: "2027-01-04" },
      { from: "2026-10-10", to: "2026-10-13" },
    ]);
  });

  it("reads the Cottage's real Airbnb export", () => {
    expect(parseIcal(cottage)).toEqual([
      { from: "2026-10-13", to: "2026-11-01" },
      { from: "2027-02-01", to: "2027-09-26" },
    ]);
  });

  it("keeps back-to-back bookings touching at checkout, and merges them", () => {
    const ranges = parseIcal(cal(ev("20261116", "20261118"), ev("20261118", "20261121")));
    expect(ranges).toEqual([
      { from: "2026-11-16", to: "2026-11-18" },
      { from: "2026-11-18", to: "2026-11-21" },
    ]);
    expect(mergeRanges(ranges)).toEqual([{ from: "2026-11-16", to: "2026-11-21" }]);
  });

  it("handles a one-night stay", () => {
    expect(parseIcal(cal(ev("20261106", "20261107")))).toEqual([
      { from: "2026-11-06", to: "2026-11-07" },
    ]);
  });

  it("handles a block spanning two months (and a year end)", () => {
    expect(parseIcal(cal(ev("20261224", "20270104")))).toEqual([
      { from: "2026-12-24", to: "2027-01-04" },
    ]);
  });

  it("treats a missing DTEND as one night and skips events without a valid start", () => {
    expect(parseIcal(cal(ev("20261120"), ev("20261340", "20261341")))).toEqual([
      { from: "2026-11-20", to: "2026-11-21" },
    ]);
  });

  it("accepts LF line endings, DATE-TIME values and lower-case markers", () => {
    const text =
      "begin:vcalendar\nbegin:vevent\nDTSTART:20261201T140000Z\nDTEND:20261203T110000Z\nend:vevent\nend:vcalendar";
    expect(parseIcal(text)).toEqual([{ from: "2026-12-01", to: "2026-12-03" }]);
  });

  it("returns nothing for an empty calendar", () => {
    expect(parseIcal(cal())).toEqual([]);
  });
});

describe("helpers", () => {
  it("toIsoDate rejects impossible dates", () => {
    expect(toIsoDate("20260230")).toBeNull();
    expect(toIsoDate("garbage")).toBeNull();
    expect(toIsoDate("20240229")).toBe("2024-02-29");
  });

  it("mergeRanges sorts and merges overlaps", () => {
    expect(
      mergeRanges([
        { from: "2026-11-10", to: "2026-11-12" },
        { from: "2026-11-01", to: "2026-11-05" },
        { from: "2026-11-04", to: "2026-11-08" },
      ]),
    ).toEqual([
      { from: "2026-11-01", to: "2026-11-08" },
      { from: "2026-11-10", to: "2026-11-12" },
    ]);
  });

  it("clipRanges drops the past and trims to the window", () => {
    expect(
      clipRanges(
        [
          { from: "2026-10-01", to: "2026-10-15" },
          { from: "2026-10-14", to: "2026-10-17" },
          { from: "2027-10-10", to: "2027-10-20" },
          { from: "2027-10-20", to: "2027-10-22" },
        ],
        "2026-10-15",
        "2027-10-15",
      ),
    ).toEqual([
      { from: "2026-10-15", to: "2026-10-17" },
      { from: "2027-10-10", to: "2027-10-15" },
    ]);
  });
});
