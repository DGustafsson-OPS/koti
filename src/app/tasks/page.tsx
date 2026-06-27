import { CheckSquare } from "lucide-react";
import { getProperties, getTasks, completeTask } from "@/lib/queries";
import {
  PageContainer,
  PageHeader,
  Card,
  Badge,
  Button,
  EmptyState,
  PropertyTabs,
  Input,
  Panel,
} from "@/components/ui";
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
    <PageContainer size="narrow">
      <PageHeader title="Tasks" subtitle="Maintenance reminders and to-dos" />

      <PropertyTabs properties={properties} activeId={activePropertyId} basePath="/tasks" />

      {activePropertyId && (
        <Panel title="New task" className="mb-8">
          <CreateTaskForm
            propertyId={activePropertyId}
            rooms={propertyRooms}
            assets={propertyAssets}
          />
        </Panel>
      )}

      {tasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="w-6 h-6" />}
          message="No pending tasks. Add one above or complete existing items from your property page."
        />
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const isOverdue = task.dueDate != null && task.dueDate < ts;
            return (
              <Card key={task.id} padding="sm">
                <div className="mb-4">
                  <p className="font-medium text-stone-900">{task.title}</p>
                  {task.description && (
                    <p className="text-sm text-stone-500 mt-1 leading-relaxed">{task.description}</p>
                  )}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {task.dueDate && (
                      <span className="text-xs text-stone-500">Due {formatDate(task.dueDate)}</span>
                    )}
                    {task.recurrence !== "none" && <Badge variant="blue">{task.recurrence}</Badge>}
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${PRIORITY_COLORS[task.priority] ?? ""}`}
                    >
                      {task.priority}
                    </span>
                    {isOverdue && <Badge variant="red">Overdue</Badge>}
                  </div>
                </div>
                <form action={handleComplete} className="border-t border-stone-100 pt-4">
                  <input type="hidden" name="taskId" value={task.id} />
                  <div className="grid sm:grid-cols-3 gap-3 mb-3">
                    <Input name="cost" type="number" placeholder="Cost (€)" />
                    <Input name="contractor" placeholder="Contractor" />
                    <Input name="notes" placeholder="Notes" />
                  </div>
                  <Button type="submit" variant="secondary" size="sm">
                    Mark complete
                  </Button>
                </form>
              </Card>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
