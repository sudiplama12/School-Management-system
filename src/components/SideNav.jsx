import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown, GripVertical } from "lucide-react";
import { Reorder, useDragControls, useReducedMotion } from "motion/react";

import { Reveal } from "./Motion";
import { useTheme } from "../context/ThemeContext";
import { revealDelay } from "../utils/motion";

// The menu column.
//
// For an administrator it is also a working surface: rows drag into whatever
// order they like, by their grip and only by their grip — `dragListener={false}`
// means a tap on a link still navigates and a pull to scroll the list never turns
// into an accidental rearrangement of the whole menu. The arrangement lives in
// localStorage under the signed-in account and the portal, so it survives a
// reload but not a different machine — a preference, not a record.
//
// Every other portal gets the same list with the grips left off. A student who
// moves their menu around is entitled to wonder why it came back, and there is no
// server field to make it stick, so the affordance is only offered to the account
// that owns the layout.

const IDLE_LINK =
  "text-emerald-100/65 hover:bg-white/5 hover:text-white hover:translate-x-1";
const ACTIVE_LINK = "bg-amber-400 text-emerald-950 shadow-lg shadow-amber-500/20";

const STORAGE = "lms.side.order";

const readOrder = (keys, storageKey) => {
  try {
    const stored = JSON.parse(localStorage.getItem(`${STORAGE}.${storageKey}`) || "[]");
    const known = stored.filter((key) => keys.includes(key));

    return [...known, ...keys.filter((key) => !known.includes(key))];
  } catch {
    return keys;
  }
};

function LinkBody({ item }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      end={item.end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl py-2.5 pl-4 pr-9 text-sm font-medium transition duration-200 ${
          isActive ? ACTIVE_LINK : IDLE_LINK
        }`
      }
    >
      <Icon size={19} />
      <span className="min-w-0 flex-1 truncate">{item.name}</span>
    </NavLink>
  );
}

function GroupBody({ group, collapsed, onToggleGroup, owningGroup }) {
  const GroupIcon = group.icon;
  const open = !collapsed.has(group.title) || group.title === owningGroup;

  return (
    <div className="pt-2">
      <button
        type="button"
        onClick={() => onToggleGroup(group.title)}
        aria-expanded={open}
        className={`flex w-full items-center gap-3 rounded-xl py-2.5 pl-4 pr-9 text-left text-sm font-semibold transition duration-200 ${
          group.title === owningGroup
            ? "bg-emerald-500/15 text-amber-300"
            : "text-emerald-100/75 hover:bg-white/5 hover:text-white"
        }`}
      >
        <GroupIcon size={19} />

        <span className="min-w-0 flex-1 truncate">{group.title}</span>

        <ChevronDown
          size={16}
          className={`shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul className="mt-1 space-y-1 border-l border-emerald-800/70 pl-3">
          {group.items.map((item) => {
            const ItemIcon = item.icon;

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition duration-200 ${
                      isActive
                        ? "bg-amber-400/15 font-semibold text-amber-300"
                        : "text-emerald-100/55 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  <ItemIcon size={17} />
                  <span className="min-w-0 flex-1 truncate">{item.title}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function DragRow({ rowKey, children, transition }) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      as="li"
      value={rowKey}
      dragListener={false}
      dragControls={controls}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={transition}
      whileDrag={{
        scale: 1.015,
        boxShadow: "0 20px 44px -20px rgb(2 6 23 / 0.85)",
      }}
      className="group/row relative rounded-xl"
    >
      {children}

      <button
        type="button"
        aria-label="Drag to reorder"
        title="Drag to reorder"
        onPointerDown={(event) => controls.start(event)}
        className="absolute right-1.5 top-1/2 flex -translate-y-1/2 cursor-grab touch-none items-center rounded-md p-1.5 text-emerald-200/30 transition hover:bg-white/10 hover:text-emerald-50 active:cursor-grabbing"
      >
        <GripVertical size={15} />
      </button>
    </Reorder.Item>
  );
}

export default function SideNav({
  draggable = false,
  storageKey,
  navigation,
  groups,
  collapsed,
  onToggleGroup,
  owningGroup,
}) {
  const { motion: setting } = useTheme();
  const reduced = useReducedMotion();
  const degree = reduced ? "reduced" : setting;

  // One flat list of rows: every top-level link, then every group header. What
  // is inside a group stays in code order — a group is a heading, and dragging
  // its children past the heading would separate them from it.
  const rows = useMemo(() => {
    const map = new Map();

    navigation.forEach((item) => map.set(item.path, { kind: "link", item }));
    groups.forEach((group) => map.set(`group:${group.title}`, { kind: "group", group }));

    return map;
  }, [navigation, groups]);

  const keys = useMemo(() => [...rows.keys()], [rows]);
  const [order, setOrder] = useState(() => (draggable ? readOrder(keys, storageKey) : keys));

  // A page added in code later joins the end of an existing arrangement instead
  // of resetting it; a page that went away drops out silently.
  useEffect(() => {
    if (!draggable) {
      setOrder(keys);
      return;
    }

    setOrder((current) => {
      const kept = current.filter((key) => keys.includes(key));
      const added = keys.filter((key) => !kept.includes(key));

      if (!added.length && kept.length === current.length) return current;

      return [...kept, ...added];
    });
  }, [draggable, keys]);

  useEffect(() => {
    if (!draggable) return;

    try {
      localStorage.setItem(`${STORAGE}.${storageKey}`, JSON.stringify(order));
    } catch {
      // Private mode, or a full quota: the menu still works, it just forgets.
    }
  }, [draggable, order, storageKey]);

  const body = (row) =>
    row.kind === "link" ? (
      <LinkBody item={row.item} />
    ) : (
      <GroupBody
        group={row.group}
        collapsed={collapsed}
        onToggleGroup={onToggleGroup}
        owningGroup={owningGroup}
      />
    );

  const label = (
    <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300/70">
      Menu
    </p>
  );

  if (!draggable) {
    return (
      <nav className="qd-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-5">
        {label}

        <ul className="space-y-1.5">
          {order.map((key, index) => {
            const row = rows.get(key);
            if (!row) return null;

            return (
              <Reveal as="li" key={key} index={index} className="rounded-xl">
                {body(row)}
              </Reveal>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav className="qd-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-5">
      {label}

      <Reorder.Group
        as="ul"
        axis="y"
        values={order}
        onReorder={setOrder}
        className="space-y-1.5"
      >
        {order.map((key, index) => {
          const row = rows.get(key);
          if (!row) return null;

          const transition = {
            duration: degree === "reduced" ? 0 : 0.3,
            delay: degree === "reduced" ? 0 : revealDelay(degree, index) * 0.6,
          };

          return (
            <DragRow key={key} rowKey={key} transition={transition}>
              {body(row)}
            </DragRow>
          );
        })}
      </Reorder.Group>
    </nav>
  );
}
