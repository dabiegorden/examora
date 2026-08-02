"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  BookOpenIcon,
  ClipboardListIcon,
  CopyIcon,
  DownloadIcon,
  MailIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ActionButton,
  ActionCard,
  ActivityBadge,
  AnalyticsCard,
  AppBreadcrumbs,
  AppCard,
  AppCheckbox,
  AppColumnSelector,
  AppDataTable,
  AppDataToolbar,
  AppDatePicker,
  AppEmailInput,
  AppField,
  AppFileUploadPlaceholder,
  AppForm,
  AppFormActions,
  AppInput,
  AppMultiSelect,
  AppNumberInput,
  AppPage,
  AppPasswordInput,
  AppPhoneInput,
  AppRadioGroup,
  AppSelect,
  AppSteps,
  AppSwitch,
  AppTabNav,
  AppTableSkeleton,
  AppTextarea,
  AppToaster,
  AttemptStatusBadge,
  BackLink,
  Caption,
  CardGridSkeleton,
  ChartSkeleton,
  ComingSoonBadge,
  ConfirmDialog,
  CountBadge,
  DangerButton,
  DateRangeFilter,
  DeleteDialog,
  DifficultyBadge,
  Divider,
  EmptyState,
  ErrorState,
  ExamStatusBadge,
  FeatureCard,
  FilterChip,
  FilterDropdown,
  FilterGroup,
  FloatingActionButton,
  FormSkeleton,
  Grid,
  Heading,
  IconButton,
  InformationCard,
  ListSkeleton,
  LoadingDialog,
  LoadingRegion,
  MetricCard,
  Muted,
  NoSearchResults,
  NoStudents,
  PageHeader,
  QuickActionCard,
  ResetFiltersButton,
  RoleBadge,
  Row,
  ScaleIn,
  SearchBar,
  Section,
  SectionHeader,
  SectionHeading,
  Small,
  SplitButton,
  StaggerContainer,
  StaggerItem,
  StatusBadge,
  StickyPageActions,
  Stack,
  StudentStatusBadge,
  SubHeading,
  SuccessDialog,
  Text,
  TextLabel,
  UnsavedChangesDialog,
  notify,
  type DataTableColumn,
} from "@/components/app";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

/**
 * Internal component showcase.
 *
 * Every reusable component in `components/app`, rendered with real interaction
 * so the gallery doubles as a smoke test — a component that throws when opened
 * fails visibly here rather than in a feature months later.
 */

/* -------------------------------------------------------------------------- */
/*                                  Scaffold                                  */
/* -------------------------------------------------------------------------- */

function Demo({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Section static className="scroll-mt-24">
      <SectionHeader title={title} description={description} />
      <AppCard>
        <div className="flex flex-col gap-4">{children}</div>
      </AppCard>
    </Section>
  );
}

function Swatch({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Caption>{label}</Caption>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Table demo                                 */
/* -------------------------------------------------------------------------- */

interface DemoRow {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive" | "suspended";
  courses: number;
}

const demoRows: DemoRow[] = [
  { id: "1", name: "Ama Boateng", email: "ama@examora.app", status: "active", courses: 2 },
  { id: "2", name: "Kwesi Owusu", email: "kwesi@examora.app", status: "active", courses: 3 },
  { id: "3", name: "Lena Fischer", email: "lena@examora.app", status: "inactive", courses: 1 },
  { id: "4", name: "Ravi Sharma", email: "ravi@examora.app", status: "suspended", courses: 2 },
  { id: "5", name: "Sofia Rossi", email: "sofia@examora.app", status: "active", courses: 4 },
];

/* -------------------------------------------------------------------------- */
/*                                  Form demo                                 */
/* -------------------------------------------------------------------------- */

const demoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "At least 8 characters.")
    .refine((v) => /\d/.test(v), "Include at least one number."),
  seats: z.number().int().min(1, "At least one seat.").max(500, "Too many seats."),
  phone: z.string().optional(),
  course: z.string().min(1, "Choose a course."),
  tags: z.array(z.string()).min(1, "Pick at least one tag."),
  startsOn: z.date().optional(),
  plan: z.string().min(1, "Choose a plan."),
  notes: z.string().max(500).optional(),
  notify: z.boolean(),
  terms: z.boolean().refine((v) => v, "You must accept the terms."),
});

type DemoValues = z.infer<typeof demoSchema>;

function FormDemo() {
  const [submitted, setSubmitted] = React.useState<string | null>(null);

  const form = useForm<DemoValues>({
    resolver: zodResolver(demoSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      seats: 1,
      phone: "",
      course: "",
      tags: [],
      plan: "standard",
      notes: "",
      notify: true,
      terms: false,
    },
  });

  return (
    <AppForm
      form={form}
      onSubmit={(values) => {
        setSubmitted(`Validated ${Object.keys(values).length} fields.`);
        notify.success("Form submitted", { description: "Zod validation passed." });
      }}
      error={submitted ? null : undefined}
    >
      <Grid cols={2} gap="md">
        <AppField<DemoValues, "name"> name="name" label="Full name" required>
          {({ field, aria }) => (
            <AppInput placeholder="Naomi Adjetey" {...field} {...aria} />
          )}
        </AppField>

        <AppField<DemoValues, "email">
          name="email"
          label="Email"
          required
          description="Used as the sign-in address."
        >
          {({ field, aria }) => <AppEmailInput {...field} {...aria} />}
        </AppField>

        <AppField<DemoValues, "password"> name="password" label="Password" required>
          {({ field, aria }) => <AppPasswordInput {...field} {...aria} />}
        </AppField>

        <AppField<DemoValues, "phone"> name="phone" label="Phone">
          {({ field, aria }) => <AppPhoneInput {...field} {...aria} />}
        </AppField>

        <AppField<DemoValues, "seats"> name="seats" label="Seats" required>
          {({ field, aria }) => (
            <AppNumberInput
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              min={1}
              {...aria}
            />
          )}
        </AppField>

        <AppField<DemoValues, "course"> name="course" label="Course" required>
          {({ field, aria }) => (
            <AppSelect
              value={field.value}
              onChange={field.onChange}
              options={[
                { value: "phy101", label: "Physics (PHY101)" },
                { value: "mth101", label: "Mathematics (MTH101)" },
                { value: "chm101", label: "Chemistry (CHM101)" },
              ]}
              {...aria}
            />
          )}
        </AppField>

        <AppField<DemoValues, "tags"> name="tags" label="Tags" required>
          {({ field, aria }) => (
            <AppMultiSelect
              value={field.value}
              onChange={field.onChange}
              options={[
                { value: "mechanics", label: "Mechanics" },
                { value: "algebra", label: "Algebra" },
                { value: "optics", label: "Optics" },
              ]}
              {...aria}
            />
          )}
        </AppField>

        <AppField<DemoValues, "startsOn"> name="startsOn" label="Starts on">
          {({ field, aria }) => (
            <AppDatePicker value={field.value} onChange={field.onChange} {...aria} />
          )}
        </AppField>
      </Grid>

      <AppField<DemoValues, "plan"> name="plan" label="Plan" required>
        {({ field }) => (
          <AppRadioGroup
            label="Plan"
            value={field.value}
            onChange={field.onChange}
            orientation="horizontal"
            options={[
              { value: "standard", label: "Standard", description: "Up to 100 students" },
              { value: "pro", label: "Pro", description: "Unlimited students" },
            ]}
          />
        )}
      </AppField>

      <AppField<DemoValues, "notes">
        name="notes"
        label="Notes"
        description="Optional, up to 500 characters."
      >
        {({ field, aria }) => (
          <AppTextarea placeholder="Anything else…" {...field} {...aria} />
        )}
      </AppField>

      <AppField<DemoValues, "notify"> name="notify">
        {({ field }) => (
          <AppSwitch
            checked={field.value}
            onChange={field.onChange}
            label="Email notifications"
            description="Send a summary when an exam closes."
          />
        )}
      </AppField>

      <AppField<DemoValues, "terms"> name="terms">
        {({ field }) => (
          <AppCheckbox
            checked={field.value}
            onChange={field.onChange}
            label="I accept the terms"
            description="Try submitting without this to see field-level validation."
          />
        )}
      </AppField>

      <AppFileUploadPlaceholder />

      <AppFormActions>
        <Button variant="ghost" type="button" onClick={() => form.reset()}>
          Reset
        </Button>
        <ActionButton
          type="submit"
          className="bg-brand hover:bg-brand-hover"
          loading={form.formState.isSubmitting}
        >
          Submit
        </ActionButton>
      </AppFormActions>

      {submitted ? <Small className="text-success">{submitted}</Small> : null}
    </AppForm>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Showcase                                  */
/* -------------------------------------------------------------------------- */

export function UiShowcase() {
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [successOpen, setSuccessOpen] = React.useState(false);
  const [unsavedOpen, setUnsavedOpen] = React.useState(false);
  const [loadingOpen, setLoadingOpen] = React.useState(false);

  const [search, setSearch] = React.useState("");
  const [statuses, setStatuses] = React.useState<string[]>([]);
  const [hiddenColumns, setHiddenColumns] = React.useState<Set<string>>(new Set());
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const columns = React.useMemo<DataTableColumn<DemoRow>[]>(
    () => [
      {
        id: "name",
        header: "Name",
        headerLabel: "Name",
        sortable: true,
        compare: (a, b) => a.name.localeCompare(b.name),
        cell: (row) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{row.name}</p>
            <p className="truncate text-xs text-muted-foreground">{row.email}</p>
          </div>
        ),
        className: "min-w-[12rem]",
      },
      {
        id: "status",
        header: "Status",
        headerLabel: "Status",
        cell: (row) => <StudentStatusBadge value={row.status} />,
      },
      {
        id: "courses",
        header: "Courses",
        headerLabel: "Courses",
        sortable: true,
        compare: (a, b) => a.courses - b.courses,
        align: "end",
        hideBelow: "sm",
        cell: (row) => <span className="tabular-nums">{row.courses}</span>,
      },
    ],
    []
  );

  return (
    <AppPage>
      {/* Mounted here so the toast demo works; add to the root layout for
          application-wide toasts. */}
      <AppToaster />

      <PageHeader
        title="Component showcase"
        description="Every reusable component in components/app, rendered live. Internal reference — not linked from navigation."
        eyebrow={<AppBreadcrumbs items={[{ label: "Teacher", href: "/teacher" }, { label: "UI" }]} />}
        actions={<ComingSoonBadge />}
      />

      <AppTabNav
        exact
        items={[
          { label: "All components", href: "/teacher/ui" },
          { label: "Dashboard", href: "/teacher" },
        ]}
      />

      {/* ------------------------------ Typography ----------------------------- */}
      <Demo title="Typography" description="One scale, used everywhere.">
        <Stack gap="sm">
          <Heading level={1}>Heading level 1</Heading>
          <Heading level={2}>Heading level 2</Heading>
          <Heading level={3}>Heading level 3</Heading>
          <SubHeading>SubHeading</SubHeading>
          <SectionHeading>Section heading (eyebrow)</SectionHeading>
          <Text>Body text — the default paragraph.</Text>
          <Muted>Muted text for secondary information.</Muted>
          <Small>Small text.</Small>
          <Caption>Caption — timestamps and footnotes.</Caption>
          <TextLabel>TextLabel</TextLabel>
        </Stack>
      </Demo>

      {/* -------------------------------- Badges ------------------------------- */}
      <Demo title="Status components" description="Colour is never the only signal.">
        <Swatch label="Generic tones">
          <StatusBadge tone="neutral">Neutral</StatusBadge>
          <StatusBadge tone="brand">Brand</StatusBadge>
          <StatusBadge tone="success">Success</StatusBadge>
          <StatusBadge tone="warning">Warning</StatusBadge>
          <StatusBadge tone="danger">Danger</StatusBadge>
          <StatusBadge tone="info">Info</StatusBadge>
        </Swatch>
        <Swatch label="Domain badges">
          <RoleBadge value="teacher" />
          <RoleBadge value="student" />
          <ExamStatusBadge value="draft" />
          <ExamStatusBadge value="published" />
          <ExamStatusBadge value="completed" />
          <StudentStatusBadge value="active" />
          <StudentStatusBadge value="suspended" />
          <DifficultyBadge value="easy" />
          <DifficultyBadge value="medium" />
          <DifficultyBadge value="hard" />
          <AttemptStatusBadge value="in_progress" />
        </Swatch>
        <Swatch label="Activity and counts">
          <ActivityBadge active />
          <ActivityBadge active={false} />
          <CountBadge count={7} />
          <CountBadge count={128} />
          <ComingSoonBadge />
        </Swatch>
      </Demo>

      {/* ------------------------------- Buttons ------------------------------- */}
      <Demo title="Actions" description="All composed from the button primitive.">
        <Swatch label="Buttons">
          <ActionButton icon={PlusIcon} className="bg-brand hover:bg-brand-hover">
            Primary
          </ActionButton>
          <ActionButton variant="outline" icon={DownloadIcon}>
            Outline
          </ActionButton>
          <ActionButton variant="ghost">Ghost</ActionButton>
          <DangerButton icon={Trash2Icon}>Danger</DangerButton>
          <ActionButton loading>Loading</ActionButton>
          <ActionButton disabled>Disabled</ActionButton>
        </Swatch>
        <Swatch label="Icon buttons (tooltip on hover)">
          <IconButton icon={PencilIcon} label="Edit" variant="outline" />
          <IconButton icon={CopyIcon} label="Duplicate" variant="ghost" />
          <IconButton icon={Trash2Icon} label="Delete" variant="destructive" />
          <IconButton icon={MailIcon} label="Send email" loading />
        </Swatch>
        <Swatch label="Split button">
          <SplitButton
            icon={PlusIcon}
            onClick={() => notify.info("Primary action")}
            menu={
              <>
                <DropdownMenuItem onClick={() => notify.info("Duplicate")}>
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => notify.info("Import")}>
                  Import
                </DropdownMenuItem>
              </>
            }
          >
            Create
          </SplitButton>
        </Swatch>
        <Swatch label="Quick actions">
          <div className="w-full">
            <Grid cols={3}>
              <QuickActionCard
                icon={BookOpenIcon}
                title="Create course"
                description="Set up a subject and grading rules."
                href="/teacher/courses"
              />
              <QuickActionCard
                icon={UsersIcon}
                title="Add student"
                description="Create an account and issue credentials."
                href="/teacher/students"
              />
              <QuickActionCard
                icon={ClipboardListIcon}
                title="Import questions"
                description="Bring a sheet into the bank."
                comingSoon
              />
            </Grid>
          </div>
        </Swatch>
      </Demo>

      {/* -------------------------------- Cards -------------------------------- */}
      <Demo title="Cards" description="Metric, information, feature, action, analytics.">
        <Grid cols={4}>
          <MetricCard label="Total students" value="184" change={8.2} hint="15 this week" icon={UsersIcon} />
          <MetricCard label="Failed sign-ins" value="12" change={22.0} invertTrend hint="Up is bad here" />
          <MetricCard label="Average score" value="74.2%" change={-3.1} />
          <MetricCard label="Courses" value="6" hint="No trend data" href="/teacher/courses" />
        </Grid>

        <Grid cols={3}>
          <FeatureCard icon={BookOpenIcon} title="Question bank" description="Tag once, reuse across every exam." />
          <ActionCard icon={UsersIcon} title="Manage students" description="Enrol, suspend, reset passwords." href="/teacher/students" />
          <InformationCard icon={ClipboardListIcon} title="Placeholder data" tone="brand">
            Everything on this page is illustrative.
          </InformationCard>
        </Grid>

        <AnalyticsCard title="Submissions" description="Last 30 days" value="1,050" change={9.3}>
          <div className="flex h-32 items-end gap-2">
            {[40, 65, 30, 80, 55, 90, 70].map((height, index) => (
              <div
                key={index}
                className="flex-1 rounded-md bg-brand/80"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </AnalyticsCard>
      </Demo>

      {/* ------------------------------- Filters ------------------------------- */}
      <Demo title="Filters" description="Presentational; the page owns the state.">
        <FilterGroup
          chips={
            <>
              <FilterChip label="Status" value="Active" onRemove={() => setStatuses([])} />
              <FilterChip label="Course" value="PHY101" />
            </>
          }
          actions={<ResetFiltersButton count={statuses.length} onReset={() => setStatuses([])} />}
        >
          <SearchBar value={search} onChange={setSearch} placeholder="Search students…" />
          <FilterDropdown
            label="Status"
            value={statuses}
            onChange={setStatuses}
            options={[
              { value: "active", label: "Active", count: 12 },
              { value: "inactive", label: "Inactive", count: 3 },
              { value: "suspended", label: "Suspended", count: 1 },
            ]}
          />
          <DateRangeFilter />
        </FilterGroup>
      </Demo>

      {/* ------------------------------ Data table ----------------------------- */}
      <Demo
        title="Data table"
        description="Sorting, selection, column visibility, row actions, pagination."
      >
        <AppDataToolbar
          search={<SearchBar placeholder="Search rows…" />}
          filters={
            <FilterDropdown
              label="Status"
              value={statuses}
              onChange={setStatuses}
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
            />
          }
          actions={
            <AppColumnSelector
              columns={columns}
              hidden={hiddenColumns}
              onChange={setHiddenColumns}
            />
          }
        />

        <AppDataTable
          caption="Demonstration table"
          columns={columns}
          rows={demoRows}
          rowKey={(row) => row.id}
          selectable
          selectedKeys={selected}
          onSelectionChange={setSelected}
          hiddenColumns={hiddenColumns}
          defaultSort={{ columnId: "name", direction: "asc" }}
          bulkActions={[
            {
              id: "email",
              label: "Email",
              icon: MailIcon,
              onSelect: (rows) => notify.info(`Emailing ${rows.length}`),
            },
            {
              id: "delete",
              label: "Delete",
              icon: Trash2Icon,
              destructive: true,
              onSelect: (rows) => notify.error(`Would delete ${rows.length}`),
            },
          ]}
          rowActions={[
            { id: "edit", label: "Edit", icon: PencilIcon, onSelect: (row) => notify.info(row.name) },
            { id: "copy", label: "Duplicate", icon: CopyIcon, onSelect: () => notify.info("Duplicated") },
            {
              id: "delete",
              label: "Delete",
              icon: Trash2Icon,
              destructive: true,
              separatorBefore: true,
              onSelect: () => setDeleteOpen(true),
            },
          ]}
          pagination={{ page: 1, pageSize: 10, total: demoRows.length }}
          paginationLabel="students"
        />
      </Demo>

      {/* -------------------------------- Forms -------------------------------- */}
      <Demo
        title="Forms"
        description="React Hook Form + Zod. Submit empty to see validation and focus behaviour."
      >
        <FormDemo />
      </Demo>

      {/* ------------------------------- Dialogs ------------------------------- */}
      <Demo title="Dialogs" description="All built on the dialog and alert-dialog primitives.">
        <Row gap="sm" wrap>
          <Button variant="outline" onClick={() => setConfirmOpen(true)}>
            Confirm
          </Button>
          <Button variant="outline" onClick={() => setDeleteOpen(true)}>
            Delete (typed confirmation)
          </Button>
          <Button variant="outline" onClick={() => setSuccessOpen(true)}>
            Success
          </Button>
          <Button variant="outline" onClick={() => setUnsavedOpen(true)}>
            Unsaved changes
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setLoadingOpen(true);
              setTimeout(() => setLoadingOpen(false), 1500);
            }}
          >
            Loading
          </Button>
        </Row>

        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Publish this exam?"
          description="Students will be able to see it immediately."
          confirmLabel="Publish"
          onConfirm={() => {
            setConfirmOpen(false);
            notify.success("Exam published");
          }}
        />

        <DeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Delete course"
          itemName="PHY101"
          requireTypedConfirmation
          onConfirm={() => {
            setDeleteOpen(false);
            notify.error("Course deleted");
          }}
        />

        <SuccessDialog
          open={successOpen}
          onOpenChange={setSuccessOpen}
          title="Import complete"
          description="15 students were added to Physics."
          onAction={() => setSuccessOpen(false)}
        />

        <UnsavedChangesDialog
          open={unsavedOpen}
          onOpenChange={setUnsavedOpen}
          onDiscard={() => setUnsavedOpen(false)}
          onSave={() => setUnsavedOpen(false)}
        />

        <LoadingDialog open={loadingOpen} title="Importing students…" description="This may take a moment." />
      </Demo>

      {/* ------------------------------- Toasts -------------------------------- */}
      <Demo title="Notifications" description="Wrappers over the existing toast manager.">
        <Row gap="sm" wrap>
          <Button variant="outline" onClick={() => notify.success("Saved", { description: "Your changes are live." })}>
            Success
          </Button>
          <Button variant="outline" onClick={() => notify.error("Could not save", { description: "Try again shortly." })}>
            Error
          </Button>
          <Button variant="outline" onClick={() => notify.warning("Exam starts in 10 minutes")}>
            Warning
          </Button>
          <Button variant="outline" onClick={() => notify.info("3 exams still in draft")}>
            Info
          </Button>
        </Row>
      </Demo>

      {/* ---------------------------- Navigation ------------------------------- */}
      <Demo title="Navigation">
        <AppBreadcrumbs
          items={[
            { label: "Teacher", href: "/teacher" },
            { label: "Courses", href: "/teacher/courses" },
            { label: "PHY101" },
          ]}
        />
        <BackLink href="/teacher" label="Back to dashboard" />
        <AppSteps
          current={1}
          steps={[
            { label: "Course", description: "Pick a subject" },
            { label: "Students", description: "Add candidates" },
            { label: "Questions", description: "Build the paper" },
            { label: "Publish" },
          ]}
        />
      </Demo>

      {/* ---------------------------- Empty states ----------------------------- */}
      <Demo title="Empty states" description="Every one offers a way forward.">
        <Grid cols={2}>
          <AppCard>
            <NoStudents action={<ActionButton icon={PlusIcon}>Add student</ActionButton>} />
          </AppCard>
          <AppCard>
            <NoSearchResults
              query="quantum"
              onReset={<Button variant="outline">Clear filters</Button>}
            />
          </AppCard>
        </Grid>
        <AppCard>
          <EmptyState
            icon={ClipboardListIcon}
            title="Custom empty state"
            description="EmptyState takes any icon, title, description, and actions."
            action={<ActionButton className="bg-brand hover:bg-brand-hover">Primary</ActionButton>}
            secondaryAction={<Button variant="ghost">Secondary</Button>}
          />
        </AppCard>
      </Demo>

      {/* ---------------------------- Error states ----------------------------- */}
      <Demo title="Error states" description="Never shows a raw stack trace to the user.">
        <ErrorState onRetry={() => notify.info("Retrying…")} />
        <ErrorState
          title="With support details"
          onRetry={() => notify.info("Retrying…")}
          reference="req_8f2c91"
          details={"TypeError: cannot read property 'id' of undefined\n  at loadRows (table.ts:42)"}
        />
      </Demo>

      {/* --------------------------- Loading states ---------------------------- */}
      <Demo title="Loading states" description="Shaped like the content they replace.">
        <LoadingRegion label="Loading examples">
          <CardGridSkeleton count={3} />
          <AppTableSkeleton rows={4} columns={4} />
          <Grid cols={2}>
            <FormSkeleton fields={3} />
            <ChartSkeleton />
          </Grid>
          <ListSkeleton rows={3} />
        </LoadingRegion>
      </Demo>

      {/* ------------------------------ Animation ------------------------------ */}
      <Demo title="Animation" description="Subtle, and honours prefers-reduced-motion.">
        <StaggerContainer className="grid gap-3 sm:grid-cols-3">
          {["Fade", "Slide", "Scale"].map((label) => (
            <StaggerItem key={label}>
              <AppCard>
                <ScaleIn>
                  <Text weight="medium">{label} in</Text>
                </ScaleIn>
              </AppCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
        <Divider label="Stagger container above" />
      </Demo>

      {/* ------------------------------- Layout -------------------------------- */}
      <Demo title="Layout" description="Stack, Row, Grid, Divider, sticky actions.">
        <Row gap="sm" wrap>
          <StatusBadge tone="brand">Row</StatusBadge>
          <StatusBadge tone="brand">of</StatusBadge>
          <StatusBadge tone="brand">items</StatusBadge>
        </Row>
        <Separator />
        <Grid cols={4} gap="sm">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
              Column {n}
            </div>
          ))}
        </Grid>
      </Demo>

      <StickyPageActions>
        <Muted className="mr-auto hidden sm:block">StickyPageActions — pinned to the bottom</Muted>
        <Button variant="ghost">Cancel</Button>
        <Button className="bg-brand hover:bg-brand-hover">Save changes</Button>
      </StickyPageActions>

      <FloatingActionButton label="New item" onClick={() => notify.info("FAB (mobile only)")} />
    </AppPage>
  );
}
