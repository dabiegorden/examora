import { LogOutIcon } from "lucide-react";

import { logoutAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";

/**
 * Sign out as a form POST rather than a link.
 *
 * A GET link would let any page trigger a sign-out by embedding an image, and
 * would be followed by link prefetchers.
 */
export function SignOutButton() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="outline" className="h-9">
        <LogOutIcon aria-hidden="true" />
        Sign out
      </Button>
    </form>
  );
}
