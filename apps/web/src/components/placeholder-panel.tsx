import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function PlaceholderPanel({
  title,
  description,
  status = "Live",
  ctaLabel,
  ctaHref,
}: {
  title: string;
  description: string;
  status?: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
    return (
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription className="mt-2 max-w-2xl leading-6">{description}</CardDescription>
            </div>
            <Badge variant="outline">{status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-dashed border-border/80 bg-muted/40 p-5 text-sm leading-6 text-muted-foreground">
            This screen shell is ready. Detailed lists and entry forms will be added next.
          </div>
        </CardContent>
        {ctaLabel && ctaHref ? (
          <CardFooter>
            <Link href={ctaHref} className={cn(buttonVariants({ variant: "outline" }))}>
              {ctaLabel}
              <ArrowRight className="size-4" />
            </Link>
          </CardFooter>
        ) : null}
      </Card>
    );
}
