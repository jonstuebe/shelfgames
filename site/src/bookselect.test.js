// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createBookSelect } from "./bookselect.js";

const OPTIONS = [
  { value: null, label: "All months", count: 5 },
  { value: 1, label: "January", count: 1 },
  { value: 2, label: "February", count: 0 },
  { value: 11, label: "November", count: 2 },
];

let root, button, onChange, select;
const key = k => button.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }));
const page = () => root.querySelector(".page");
const entries = () => [...root.querySelectorAll(".entry")];

beforeEach(() => {
  document.body.innerHTML = `<div id="root"></div><button id="elsewhere">x</button>`;
  root = document.getElementById("root");
  onChange = vi.fn();
  select = createBookSelect(root, { label: "Month", onChange });
  select.update(OPTIONS, null);
  button = root.querySelector(".spine");
});

describe("book select", () => {
  it("shows the current choice on the spine and stays closed", () => {
    expect(button.textContent).toContain("All months");
    expect(button.getAttribute("role")).toBe("combobox");
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(page().hidden).toBe(true);
  });

  it("lists every entry with its count, and marks the current one", () => {
    expect(entries().map(e => e.querySelector(".entry-label").textContent)).toEqual(["All months", "January", "February", "November"]);
    expect(entries()[3].textContent).toContain("2 books");
    expect(entries()[1].textContent).toContain("1 book");
    expect(entries()[2].classList.contains("none")).toBe(true);
    expect(entries().map(e => e.getAttribute("aria-selected"))).toEqual(["true", "false", "false", "false"]);
  });

  it("opens on click and picks an entry", () => {
    button.click();
    expect(page().hidden).toBe(false);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    entries()[3].click();
    expect(onChange).toHaveBeenCalledWith(11);
    expect(page().hidden).toBe(true);
    expect(button.textContent).toContain("November");
  });

  it("works from the keyboard", () => {
    key("ArrowDown");
    expect(page().hidden).toBe(false);
    expect(button.getAttribute("aria-activedescendant")).toMatch(/opt-0$/);
    key("ArrowDown"); key("ArrowDown");
    expect(button.getAttribute("aria-activedescendant")).toMatch(/opt-2$/);
    key("End");
    expect(button.getAttribute("aria-activedescendant")).toMatch(/opt-3$/);
    key("ArrowDown");
    expect(button.getAttribute("aria-activedescendant")).toMatch(/opt-3$/);
    key("Home"); key("ArrowDown");
    key("Enter");
    expect(onChange).toHaveBeenCalledWith(1);
    expect(page().hidden).toBe(true);
  });

  it("closes on Escape without changing anything", () => {
    key("Enter"); key("ArrowDown"); key("Escape");
    expect(page().hidden).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("jumps to an entry by its first letter", () => {
    key("n");
    expect(page().hidden).toBe(false);
    expect(button.getAttribute("aria-activedescendant")).toMatch(/opt-3$/);
    key(" ");
    expect(onChange).toHaveBeenCalledWith(11);
  });

  it("doesn't fire when the same entry is picked again", () => {
    button.click(); entries()[0].click();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("closes when you tap somewhere else", () => {
    button.click();
    document.getElementById("elsewhere").dispatchEvent(new Event("pointerdown", { bubbles: true }));
    expect(page().hidden).toBe(true);
  });
});
