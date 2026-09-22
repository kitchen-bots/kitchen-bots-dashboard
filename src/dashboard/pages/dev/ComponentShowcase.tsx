import { AlertCircle, CheckCircle2, PackageOpen } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  Skeleton,
  Switch,
  Textarea,
} from '../../components/ui';

export function ComponentShowcase() {
  return (
    <main className="min-h-screen bg-muted/30 p-6 md:p-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header>
          <p className="text-sm font-medium text-primary">Development only</p>
          <h1 className="mt-1 text-3xl font-semibold text-foreground">Kitchen Bots UI primitives</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Approved operational components and interaction states. This route is excluded from production builds.
          </p>
        </header>

        <section aria-labelledby="actions-heading">
          <Card>
            <CardHeader>
              <CardTitle id="actions-heading">Actions and status</CardTitle>
              <CardDescription>Use buttons for actions and badges only for compact status labels.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-3">
                <Button>Primary action</Button>
                <Button variant="outline">Secondary action</Button>
                <Button variant="destructive">Destructive action</Button>
                <Button disabled>Disabled action</Button>
                <Button isLoading>Saving</Button>
              </div>
              <div className="flex flex-wrap gap-2" aria-label="Status examples">
                <Badge variant="success">Published</Badge>
                <Badge variant="warning">Needs review</Badge>
                <Badge variant="destructive">Failed</Badge>
                <Badge variant="outline">Draft</Badge>
              </div>
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="forms-heading">
          <Card>
            <CardHeader>
              <CardTitle id="forms-heading">Form controls</CardTitle>
              <CardDescription>Persistent labels, visible focus, error text, and disabled states.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="showcase-name">Product name</Label>
                <Input id="showcase-name" placeholder="Enter product name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="showcase-error">SKU</Label>
                <Input id="showcase-error" defaultValue="" error aria-describedby="showcase-error-message" />
                <p id="showcase-error-message" className="text-sm text-destructive">SKU is required.</p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="showcase-description">Description</Label>
                <Textarea id="showcase-description" placeholder="Describe verified product details" />
              </div>
              <div className="flex items-center gap-3">
                <Checkbox id="showcase-featured" />
                <Label htmlFor="showcase-featured">Feature this product</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch id="showcase-published" />
                <Label htmlFor="showcase-published">Published</Label>
              </div>
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="feedback-heading" className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle id="feedback-heading">Feedback states</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="success">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                <AlertTitle>Product saved</AlertTitle>
                <AlertDescription>Changes are available to permitted staff.</AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <AlertTitle>Save failed</AlertTitle>
                <AlertDescription>No changes were applied. Review the fields and retry.</AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Loading and empty states</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div aria-label="Loading example" className="space-y-3">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-dashed p-4">
                <PackageOpen className="mt-0.5 h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="font-medium">No products found</p>
                  <p className="mt-1 text-sm text-muted-foreground">Adjust filters or create the first verified product.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
