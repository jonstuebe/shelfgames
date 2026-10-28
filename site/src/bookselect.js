// A dropdown drawn as a book lying on its side. Opening it unfolds a table-of-contents page.
// Follows the ARIA "select-only combobox" pattern, so it works from the keyboard and with screen readers.

let nextId = 0;

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

// `options` are { value, label, count }, where `count` is how many books that choice would show.
export function createBookSelect(root, { label, onChange }) {
  const id = `book-select-${nextId++}`;
  let options = [];
  let value = null;
  let active = 0;
  let open = false;

  root.classList.add("book-select");
  root.innerHTML = `
    <span class="spine-label" id="${id}-label">${esc(label)}</span>
    <button type="button" class="spine" id="${id}-button" role="combobox"
            aria-haspopup="listbox" aria-expanded="false" aria-controls="${id}-list"
            aria-labelledby="${id}-label ${id}-button">
      <span class="spine-value"></span>
      <span class="spine-caret" aria-hidden="true"></span>
    </button>
    <div class="page" hidden>
      <p class="page-heading" aria-hidden="true">Contents</p>
      <ul class="contents" role="listbox" id="${id}-list" aria-labelledby="${id}-label" tabindex="-1"></ul>
    </div>`;
  const button = root.querySelector(".spine");
  const valueEl = root.querySelector(".spine-value");
  const page = root.querySelector(".page");
  const list = root.querySelector(".contents");

  const indexOf = v => Math.max(0, options.findIndex(o => o.value === v));

  function draw() {
    valueEl.textContent = options[indexOf(value)]?.label ?? "";
    list.innerHTML = options.map((o, i) => `
      <li role="option" id="${id}-opt-${i}" data-index="${i}"
          class="entry${i === active ? " active" : ""}${o.count === 0 ? " none" : ""}"
          aria-selected="${o.value === value}">
        <span class="entry-label">${esc(o.label)}</span>
        <span class="leader" aria-hidden="true"></span>
        <span class="entry-count">${o.count}<span class="visually-hidden"> ${o.count === 1 ? "book" : "books"}</span></span>
      </li>`).join("");
    if (open) {
      button.setAttribute("aria-activedescendant", `${id}-opt-${active}`);
      list.children[active]?.scrollIntoView?.({ block: "nearest" });
    } else {
      button.removeAttribute("aria-activedescendant");
    }
  }

  function setOpen(next) {
    if (open === next) return;
    open = next;
    if (open) active = indexOf(value);
    root.classList.toggle("open", open);
    button.setAttribute("aria-expanded", String(open));
    page.hidden = !open;
    draw();
  }

  function choose(i) {
    const picked = options[i];
    setOpen(false);
    button.focus();
    if (picked && picked.value !== value) {
      value = picked.value;
      draw();
      onChange(value);
    }
  }

  function move(i) {
    active = Math.min(options.length - 1, Math.max(0, i));
    draw();
  }

  button.addEventListener("click", () => setOpen(!open));
  button.addEventListener("keydown", e => {
    const keys = {
      ArrowDown: () => (open ? move(active + 1) : setOpen(true)),
      ArrowUp: () => (open ? move(active - 1) : setOpen(true)),
      Home: () => open && move(0),
      End: () => open && move(options.length - 1),
      Enter: () => (open ? choose(active) : setOpen(true)),
      " ": () => (open ? choose(active) : setOpen(true)),
      Escape: () => setOpen(false),
    };
    if (e.key === "Tab") { setOpen(false); return; }
    if (keys[e.key]) { e.preventDefault(); keys[e.key](); return; }
    // Type a letter to jump to the next entry starting with it
    if (e.key.length === 1 && /\S/.test(e.key)) {
      const k = e.key.toLowerCase();
      const start = open ? active + 1 : indexOf(value) + 1;
      for (let n = 0; n < options.length; n++) {
        const i = (start + n) % options.length;
        if (options[i].label.toLowerCase().startsWith(k)) { setOpen(true); move(i); break; }
      }
    }
  });
  // mousedown keeps focus on the button while picking from the page
  list.addEventListener("mousedown", e => e.preventDefault());
  list.addEventListener("click", e => {
    const entry = e.target.closest(".entry");
    if (entry) choose(Number(entry.dataset.index));
  });
  list.addEventListener("mousemove", e => {
    const entry = e.target.closest(".entry");
    if (entry && Number(entry.dataset.index) !== active) move(Number(entry.dataset.index));
  });
  document.addEventListener("pointerdown", e => { if (open && !root.contains(e.target)) setOpen(false); });
  button.addEventListener("blur", () => setOpen(false));

  return {
    update(nextOptions, nextValue) {
      options = nextOptions;
      value = nextValue;
      active = Math.min(active, options.length - 1);
      draw();
    },
    get value() { return value; },
  };
}
