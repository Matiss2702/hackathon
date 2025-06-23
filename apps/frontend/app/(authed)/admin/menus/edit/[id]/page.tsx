"use client";

import api from "@/lib/axios";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState, JSX } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Page {
  id: string;
  title: string;
  is_active: boolean;
  order: number;
  parentId: string | null;
}

interface Menu {
  id: string;
  createdAt: string;
  updatedAt: string;
  menuType: {
    id: string;
    title: string;
  };
  pages: Page[];
}

const INDENT_THRESHOLD = 30;
const MAX_DEPTH = 4;

function SortablePageItem({
  page,
  depth,
  indexPath,
  isDragging,
}: {
  page: Page;
  depth: number;
  indexPath: string;
  isDragging: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginLeft: `${depth * 24}px`,
    borderLeft: `${depth > 0 ? "2px" : "0"} solid #d1d5db`,
    paddingLeft: "8px",
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center space-x-2 border rounded px-4 py-2 bg-white cursor-move"
    >
      <span className="font-medium">{indexPath}.</span>
      <span>{page.is_active ? "✅" : "❌"}</span>
      <span>{page.title}</span>
    </div>
  );
}

export default function AdminMenusEdit() {
  const { id } = useParams();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [orderedPages, setOrderedPages] = useState<Page[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  if (!id) notFound();

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await api.get(`/menu/${id}`);
        if (response.status !== 200) notFound();
        setMenu(response.data);
        setOrderedPages(response.data.pages);
      } catch {
        toast.error("Erreur lors du chargement du menu.");
        notFound();
      }
    };
    fetchMenu();
  }, [id]);

  const getDepth = (pageId: string, pages: Page[], level = 0): number => {
    const page = pages.find((p) => p.id === pageId);
    if (!page || !page.parentId) return level;
    return getDepth(page.parentId, pages, level + 1);
  };

  const isDescendant = (parentId: string, childId: string, pages: Page[]): boolean => {
    const children = pages.filter((p) => p.parentId === parentId);
    for (const child of children) {
      if (child.id === childId || isDescendant(child.id, childId, pages)) return true;
    }
    return false;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const activePage = orderedPages.find((p) => p.id === active.id);
    const overPage = orderedPages.find((p) => p.id === over.id);
    if (!activePage || !overPage) return;

    let newParentId: string | null = overPage.parentId;

    const currentDepth = getDepth(overPage.id, orderedPages);
    if (Math.abs(delta.x) > INDENT_THRESHOLD) {
      if (delta.x > 0 && currentDepth < MAX_DEPTH) {
        newParentId = overPage.id;
      } else if (delta.x < 0) {
        const parentOfOver = orderedPages.find(p => p.id === overPage.parentId);
        newParentId = parentOfOver?.parentId ?? null;
      }
    }

    if (activePage.id === newParentId || isDescendant(activePage.id, newParentId!, orderedPages)) {
      toast.error("Impossible de faire de ce parent un enfant de lui-même.",{
        position: "top-center",
      });
      return;
    }

    const sameLevel = orderedPages.filter(p => p.parentId === newParentId && p.id !== activePage.id);
    const insertAt = sameLevel.findIndex(p => p.id === over.id);
    const updatedLevel = [
      ...sameLevel.slice(0, insertAt),
      { ...activePage, parentId: newParentId },
      ...sameLevel.slice(insertAt),
    ].map((p, i) => ({ ...p, order: i }));

    const others = orderedPages.filter(p => !updatedLevel.find(u => u.id === p.id));
    setOrderedPages([...others, ...updatedLevel]);
  };

  const handleSave = async () => {
    try {
      const response = await api.put("/menu/pages/reorder", {
        menuId: id,
        pages: orderedPages.map(({ id, order, parentId }) => ({ id, order, parentId })),
      });
      if (response.status === 201) {
        toast.success("Ordre des pages sauvegardé avec succès !", {
          position: "top-center",
        });
      } else {
        toast.error("Erreur lors de la sauvegarde.", {
          position: "top-center",
        });
      }
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde.",{
        position: "top-center",
      });
      console.error("Erreur lors de la sauvegarde des pages :", error);
    }
  };

  const renderNestedPages = (parentId: string | null, depth = 0, pathPrefix = ""): JSX.Element[] => {
    const siblings = orderedPages
      .filter(p => p.parentId === parentId)
      .sort((a, b) => a.order - b.order);

    return siblings.map((page, index) => {
      const indexPath = pathPrefix ? `${pathPrefix}.${index + 1}` : `${index + 1}`;
      return (
        <div key={page.id}>
          <SortablePageItem
            page={page}
            depth={depth}
            indexPath={indexPath}
            isDragging={activeId === page.id}
          />
          <div>{renderNestedPages(page.id, depth + 1, indexPath)}</div>
        </div>
      );
    });
  };

  const ShortcutsBox = () => (
    <div className="border bg-muted text-sm text-muted-foreground rounded p-4">
      <p className="font-medium mb-2">💡 Astuces :</p>
      <ul className="list-disc list-inside space-y-1">
        <li>↔ Glisse horizontale ➜ indente/désindente</li>
        <li>↕ Glisse verticale ➜ réorganise</li>
        <li>Max niveau : {MAX_DEPTH}</li>
      </ul>
    </div>
  );

  if (!menu || !id) return <p>Chargement...</p>;

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="flex items-center justify-between">
        <Button asChild>
          <Link href="/admin/menus">
            <ArrowLeft /> Retour
          </Link>
        </Button>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" /> Sauvegarder
        </Button>
      </div>

      <h1 className="text-2xl font-bold">Edition du menu : {menu.menuType.title}</h1>
      <ShortcutsBox />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={orderedPages.map(p => p.id)} strategy={verticalListSortingStrategy}>
          {renderNestedPages(null)}
        </SortableContext>
      </DndContext>
    </div>
  );
}
