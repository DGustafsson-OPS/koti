import Link from "next/link";
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
  FilterTabs,
  Input,
  Panel,
  FormCheckbox,
} from "@/components/ui";
import { formatDate, PRIORITY_COLORS } from "@/lib/utils";
import {
  getDictionary,
  interpolate,
  priorityLabel,
  recurrenceLabel,
} from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { CreateTaskForm } from "@/components/forms/create-task-form";
import { db } from "@/db";
import { assets, rooms } from "@/db/schema";
import { eq } from "drizzle-orm";
import { parseTaxDeductible } from "@/lib/maintenance-costs";

async function handleComplete(formData: FormData) {
  "use server";
  await completeTask({
    taskId: formData.get("taskId") as string,
    cost: formData.get("cost") ? Number(formData.get("cost")) : undefined,
    contractor: (formData.get("contractor") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
    taxDeductible: parseTaxDeductible(formData),
  });
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ property?: string; filter?: string }>;
}) {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const { property: propertyId, filter: filterParam } = await searchParams;
  const filter = (filterParam === "overdue" || filterParam === "month" ? filterParam : "all") as
    | "all"
    | "overdue"
    | "month";

  const properties = await getProperties();
  const activePropertyId = propertyId ?? properties[0]?.id;

  const tasks = activePropertyId ? await getTasks(activePropertyId, filter) : [];

  const propertyRooms = activePropertyId
    ? await db.select().from(rooms).where(eq(rooms.propertyId, activePropertyId))
    : [];
  const propertyAssets = activePropertyId
    ? await db.select().from(assets).where(eq(assets.propertyId, activePropertyId))
    : [];

  const ts = Math.floor(Date.now() / 1000);

  return (
    <PageContainer size="wide">
      <PageHeader title={dict.tasks.title} subtitle={dict.tasks.subtitle} />

      <PropertyTabs
        properties={properties}
        activeId={activePropertyId}
        basePath="/tasks"
        params={{ filter: filter === "all" ? undefined : filter }}
      />

      <FilterTabs
        items={[
          { key: "all", label: dict.filters.all },
          { key: "overdue", label: dict.filters.overdue },
          { key: "month", label: dict.filters.thisMonth },
        ]}
        activeKey={filter}
        basePath="/tasks"
        paramName="filter"
        params={{ property: activePropertyId }}
      />

      {activePropertyId && (
        <Panel title={dict.tasks.newTask} className="mb-8">
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
          message={dict.tasks.empty}
        />
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const isOverdue = task.dueDate != null && task.dueDate < ts;
            return (
              <Card key={task.id} padding="sm">
                <div className="flex justify-between items-start gap-3 mb-4">
                  <div className="flex-1">
                    <p className="font-medium text-stone-900">{task.title}</p>
                    {task.description && (
                      <p className="text-sm text-stone-500 mt-1 leading-relaxed">{task.description}</p>
                    )}
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {task.dueDate && (
                        <span className="text-xs text-stone-500">
                          {interpolate(dict.common.due, {
                            date: formatDate(task.dueDate, locale),
                          })}
                        </span>
                      )}
                      {task.recurrence !== "none" && (
                        <Badge variant="blue">{recurrenceLabel(dict, task.recurrence)}</Badge>
                      )}
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${PRIORITY_COLORS[task.priority] ?? ""}`}
                      >
                        {priorityLabel(dict, task.priority)}
                      </span>
                      {isOverdue && <Badge variant="red">{dict.common.overdue}</Badge>}
                    </div>
                  </div>
                  <Link
                    href={`/tasks/${task.id}/edit`}
                    className="text-xs text-brand-700 hover:underline font-medium shrink-0"
                  >
                    {dict.common.edit}
                  </Link>
                </div>
                <form action={handleComplete} className="border-t border-stone-100 pt-4">
                  <input type="hidden" name="taskId" value={task.id} />
                  <div className="grid sm:grid-cols-3 gap-3 mb-3">
                    <Input name="cost" type="number" placeholder={dict.tasks.costPlaceholder} />
                    <Input name="contractor" placeholder={dict.tasks.contractorPlaceholder} />
                    <Input name="notes" placeholder={dict.tasks.notesPlaceholder} />
                  </div>
                  <FormCheckbox label={dict.forms.taxDeductible} name="taxDeductible" />
                  <div className="mt-3">
                    <Button type="submit" variant="secondary" size="sm">
                      {dict.common.markComplete}
                    </Button>
                  </div>
                </form>
              </Card>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
