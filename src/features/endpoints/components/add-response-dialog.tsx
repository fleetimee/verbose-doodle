import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  type ResponseFormData,
  responseSchema,
} from "@/features/endpoints/schemas/response-schema";

type AddResponseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ResponseFormData) => void;
  isSubmitting?: boolean;
  showTrigger?: boolean;
};

export function AddResponseDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  showTrigger = true,
}: AddResponseDialogProps) {
  const form = useForm<ResponseFormData>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      name: "",
      json: "{}",
      statusCode: 200,
      activated: false,
    },
  });

  const handleSubmit = (data: ResponseFormData) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Response
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Response</DialogTitle>
          <DialogDescription>
            Create a new response configuration for this endpoint
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., success_response, error_response"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A descriptive name for this response
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="statusCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="200"
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>HTTP status code (100-599)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="json"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>JSON Response</FormLabel>
                  <FormControl>
                    <Textarea
                      className="font-mono text-sm"
                      placeholder='{"key": "value"}'
                      rows={10}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The JSON response body (must be valid JSON)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activated"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Activate</FormLabel>
                    <FormDescription>
                      Set this as the active response for the endpoint
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                onClick={() => onOpenChange(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? "Adding..." : "Add Response"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
