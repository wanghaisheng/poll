import { cn } from "@poll/lib";
import { Icon, Sheet, SheetContent, SheetTrigger } from "@poll/ui";
import React, { useEffect, useState } from "react";
import { useMedia } from "react-use";

import { Sidebar, MobileHeader } from "../components";

type Props = React.ComponentPropsWithoutRef<"div">;

export default function BaseLayout({ className, children, ...props }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const isNotMobile = useMedia("(min-width: 768px)", true);

  useEffect(() => {
    setIsOpen(false);
  }, [isNotMobile, setIsOpen]);

  console.log(isNotMobile);
  return (
    <main className={cn("flex", className)} {...props}>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <MobileHeader
          MenuComponent={
            <SheetTrigger>
              <Icon.Menu />
            </SheetTrigger>
          }
          className="md:hidden"
          onOpen={() => setIsOpen(true)}
        />

        <SheetContent side="left" className="w-fit p-0">
          <Sidebar className="pt-12" />
        </SheetContent>
      </Sheet>
      <Sidebar className={cn("hidden md:flex", isOpen && "hidden")} />

      <div className="container mt-12 flex max-w-5xl flex-1 flex-col space-y-6 py-12 md:mt-0">
        {children}
      </div>
    </main>
  );
}
