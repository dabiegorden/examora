import type { Metadata } from "next";
import Link from "next/link";
import { KeyRoundIcon, MonitorSmartphoneIcon, TriangleAlertIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { DashboardCard, DashboardSection, PageHeader } from "@/components/dashboard";
import { ThemeToggle } from "@/components/theme-toggle";
import { requireTeacher } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

const notificationPrefs = [
  { id: "exam-open", label: "Exam opening soon", description: "An hour before a published exam starts." },
  { id: "submissions", label: "Submissions complete", description: "When every candidate has submitted." },
  { id: "violations", label: "Integrity alerts", description: "Tab switches and fullscreen exits during a sitting." },
  { id: "weekly", label: "Weekly summary", description: "A digest of results and activity each Monday." },
];

export default async function SettingsPage() {
  const user = await requireTeacher();

  return (
    <>
      <PageHeader
        title="Settings"
        description="Your account, security, and how Examora looks and notifies you."
      />

      <DashboardSection delay={0.05}>
        <Tabs defaultValue="profile">
          {/* Scrolls rather than wrapping on narrow screens. */}
          <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="danger">Danger zone</TabsTrigger>
          </TabsList>

          {/* -------------------------------- Profile ------------------------------- */}
          <TabsContent value="profile" className="mt-4" keepMounted>
            <DashboardCard
              title="Profile"
              description="How you appear to your students."
            >
              <div className="grid max-w-xl gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input id="fullName" defaultValue={user.fullName} className="h-10" readOnly />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user.email} className="h-10" readOnly />
                  <p className="text-xs text-muted-foreground">
                    Your sign-in address. Changing it will be possible once editing ships.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" defaultValue="Teacher" className="h-10" readOnly />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button className="bg-brand hover:bg-brand-hover" disabled>
                    Save changes
                  </Button>
                  <Button variant="ghost" disabled>
                    Cancel
                  </Button>
                </div>
              </div>
            </DashboardCard>
          </TabsContent>

          {/* ------------------------------- Security ------------------------------- */}
          <TabsContent value="security" className="mt-4" keepMounted>
            <div className="grid gap-4">
              <DashboardCard
                title="Password"
                description="Change the password you use to sign in."
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-subtle text-brand dark:text-brand-accent">
                      <KeyRoundIcon className="size-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Password
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Changing it signs you out of every other device.
                      </p>
                    </div>
                  </div>

                  {/*
                    A real, working link — the change-password flow already exists
                    from the authentication phase.
                  */}
                  <Link
                    href="/change-password"
                    className={cn(buttonVariants({ variant: "outline" }), "shrink-0")}
                  >
                    Change password
                  </Link>
                </div>
              </DashboardCard>

              <DashboardCard
                title="Active session"
                description="Examora allows one signed-in device per account."
              >
                <div className="flex items-start gap-3 rounded-lg border border-border p-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-success/12 text-success">
                    <MonitorSmartphoneIcon className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      This device
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Signing in elsewhere ends this session automatically.
                    </p>
                  </div>
                </div>
              </DashboardCard>
            </div>
          </TabsContent>

          {/* ------------------------------ Appearance ------------------------------ */}
          <TabsContent value="appearance" className="mt-4" keepMounted>
            <DashboardCard
              title="Appearance"
              description="Examora follows your system theme unless you choose otherwise."
            >
              <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Theme</p>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark. Your choice is remembered.
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </DashboardCard>
          </TabsContent>

          {/* ----------------------------- Notifications ---------------------------- */}
          <TabsContent value="notifications" className="mt-4" keepMounted>
            <DashboardCard
              title="Notifications"
              description="Choose what Examora tells you about."
            >
              <ul className="divide-y divide-border">
                {notificationPrefs.map((pref) => (
                  <li
                    key={pref.id}
                    className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <Label htmlFor={pref.id} className="text-sm font-medium">
                        {pref.label}
                      </Label>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {pref.description}
                      </p>
                    </div>
                    <Switch id={pref.id} disabled defaultChecked />
                  </li>
                ))}
              </ul>

              <p className="mt-4 text-xs text-muted-foreground">
                Delivery is not wired up yet — these switches are placeholders.
              </p>
            </DashboardCard>
          </TabsContent>

          {/* ------------------------------ Danger zone ----------------------------- */}
          <TabsContent value="danger" className="mt-4" keepMounted>
            <Card className="ring-destructive/25">
              <CardContent className="space-y-4">
                <Alert variant="destructive">
                  <TriangleAlertIcon />
                  <AlertTitle>These actions cannot be undone</AlertTitle>
                  <AlertDescription>
                    Deleting a course removes its exams, questions, and every
                    attempt students have made against it.
                  </AlertDescription>
                </Alert>

                <Separator />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      Archive all courses
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Hides them from students while keeping the data.
                    </p>
                  </div>
                  <Button variant="outline" className="shrink-0" disabled>
                    Archive all
                  </Button>
                </div>

                <Separator />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      Delete account
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Permanently removes your account and everything in it.
                    </p>
                  </div>
                  <Button variant="destructive" className="shrink-0" disabled>
                    Delete account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DashboardSection>
    </>
  );
}
