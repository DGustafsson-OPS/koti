import Link from "next/link";
import {
  getProperties,
  getTasks,
  completeTask,
} from "@/lib/queries";
import { PageHeader, Card, Badge, Button, EmptyState } from "@/components/ui";
import { formatDate, PRIORITY_COLORS } from "@/lib/utils";
import { CreateTaskForm } from "@/components/forms/create-task-form";
import { db } from "@/db";
import { assets, rooms } from "@/db/schema";
import { eq } from "drizzle-orm";

async function handleComplete(formData: FormData) {
  "use server";
  await completeTask({
    taskId: formData.get("taskId") as string,
    cost: formData.get("cost") ? Number(formData.get("cost")) : undefined,
    contractor: (formData.get("contractor") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  });
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ property?: string }>;
}) {
  const { property: propertyId } = await searchParams;
  const properties = await getProperties();
  const activePropertyId = propertyId ?? properties[0]?.id;

  const [tasks] = activePropertyId
    ? await Promise.all([getTasks(activePropertyId)])
    : [[]];

  const propertyRooms = activePropertyId
    ? await db.select().from(rooms).where(eq(rooms.propertyId, activePropertyId))
    : [];
  const propertyAssets = activePropertyId
    ? await db.select().from(assets).where(eq(assets.propertyId, activePropertyId))
    : [];

  const ts = Math.floor(Date.now() / 1000);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <PageHeader title="Tasks" subtitle="Maintenance and reminders" />

      {properties.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {properties.map((p) => (
            <Link
              key={p.id}
              href={`/tasks?property=${p.id}`}
              className={`px-3 py-1 rounded-full text-sm border ${
                p.id === activePropertyId
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-white text-stone-600 border-stone-300 hover:border-brand-500"
              }`}
            >
              {p.name}
            </Link>
          ))}
        </div>
      )}

      {activePropertyId && (
        <div className="mb-8">
          <CreateTaskForm
            propertyId={activePropertyId}
            rooms={propertyRooms}
            assets={propertyAssets}
          />
        </div>
      )}

      {tasks.length === 0 ? (
        <EmptyState message="No pending tasks" />
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const isOverdue = task.dueDate != null && task.dueDate < ts;
            return (
              <Card key={task.id} className="p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    {task.description && (
                      <p className="text-sm text-stone-500 mt-1">{task.description}</p>
                    )}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {task.dueDate && (
                        <span className="text-xs text-stone-400">Due {formatDate(task.dueDate)}</span>
                      )}
                      {task.recurrence !== "none" && (
                        <Badge variant="blue">{task.recurrence}</Badge>
                      )}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_COLORS[task.priority] ?? ""}`}
                      >
                        {task.priority}
                      </span>
                      {isOverdue && <Badge variant="red">Overdue</Badge>}
                    </div>
                  </div>
                </div>
                <form action={handleComplete} className="border-t border-stone-100 pt-3 mt-3">
                  <input type="hidden" name="taskId" value={task.id} />
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <input
                      name="cost"
                      type="number"
                      placeholder="Cost (€)"
                      className="border border-stone-300 rounded-lg px-3 py-1.5 text-sm"
                    />
                    <input
                      name="contractor"
                      placeholder="Contractor"
                      className="border border-stone-300 rounded-lg px-3 py-1.5 text-sm"
                    />
                    <input
                      name="notes"
                      placeholder="Notes"
                      className="border border-stone-300 rounded-lg px-3 py-1.5 text-sm"
                    />
                  </div>
                  <Button type="submit" variant="secondary" className="text-xs py-1.5">
                    Mark complete
                  </Button>
                </form>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
