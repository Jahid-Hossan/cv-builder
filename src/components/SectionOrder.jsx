"use client";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { reorderSections } from "../utils/resume";
function Row({ id }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <button
        type="button"
        className="order-handle"
        {...attributes}
        {...listeners}
        aria-label={`Move ${id} section`}
      >
        <span aria-hidden="true">⠿</span>
        {id}
        <span className="muted">Drag to reorder</span>
      </button>
    </li>
  );
}
export default function SectionOrder({ order, onChange }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  return (
    <div>
      <p className="help">
        Drag a section, or focus its handle and press Space, arrow keys, then
        Space.
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (over) onChange(reorderSections(order, active.id, over.id));
        }}
      >
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <ul className="order-list">
            {order.map((id) => (
              <Row key={id} id={id} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}
