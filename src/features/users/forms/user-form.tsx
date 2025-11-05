import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle,
  Eye,
  EyeOff,
  KeyRound,
  Shield,
  ShieldCheck,
  User,
  UserCog,
} from "lucide-react";
import { motion } from "motion/react";
import { forwardRef, useImperativeHandle, useState } from "react";
import { Controller, type UseFormReturn, useForm } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type UserFormData,
  userSchema,
} from "@/features/users/schemas/user-schema";

// Animation constants
const ANIMATION_DURATION = 0.3;
const ROLE_DELAY_WITH_PASSWORD = 0.3;
const ROLE_DELAY_WITHOUT_PASSWORD = 0.2;
const ACTIVE_DELAY_WITH_PASSWORD = 0.4;
const ACTIVE_DELAY_WITHOUT_PASSWORD = 0.3;

type UserFormProps = {
  onSubmit: (data: UserFormData) => void;
  showPassword?: boolean;
  defaultValues?: Partial<UserFormData>;
  children?: React.ReactNode;
};

export type UserFormHandle = {
  reset: (values?: Partial<UserFormData>) => void;
  getValues: () => UserFormData;
  form: UseFormReturn<UserFormData>;
};

export const UserForm = forwardRef<UserFormHandle, UserFormProps>(
  (
    {
      onSubmit,
      showPassword: showPasswordField = true,
      defaultValues,
      children,
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<UserFormData>({
      resolver: zodResolver(userSchema),
      defaultValues: {
        username: "",
        role: "USER",
        active: true,
        password: "",
        ...defaultValues,
      },
    });

    useImperativeHandle(ref, () => ({
      reset: (values) => form.reset(values),
      getValues: () => form.getValues(),
      form,
    }));

    const handleSubmit = (data: UserFormData) => {
      onSubmit(data);
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup className="space-y-4">
            <Controller
              control={form.control}
              name="username"
              render={({ field, fieldState }) => (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      className="flex items-center gap-2"
                      htmlFor="user-username"
                    >
                      <User className="h-4 w-4" />
                      Username
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        autoComplete="username"
                        id="user-username"
                        placeholder="Enter username"
                      />
                      <FieldDescription>
                        Choose a unique username for this user account.
                      </FieldDescription>
                    </FieldContent>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                </motion.div>
              )}
            />

            {showPasswordField && (
              <Controller
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel
                        className="flex items-center gap-2"
                        htmlFor="user-password"
                      >
                        <KeyRound className="h-4 w-4" />
                        Password
                      </FieldLabel>
                      <FieldContent>
                        <InputGroup>
                          <InputGroupInput
                            {...field}
                            aria-invalid={fieldState.invalid}
                            autoComplete="new-password"
                            id="user-password"
                            placeholder="Enter password"
                            type={showPassword ? "text" : "password"}
                          />
                          <InputGroupAddon align="inline-end">
                            <InputGroupButton
                              aria-label={
                                showPassword ? "Hide password" : "Show password"
                              }
                              className="rounded-full"
                              onClick={() => setShowPassword((prev) => !prev)}
                              size="icon-xs"
                              type="button"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </InputGroupButton>
                          </InputGroupAddon>
                        </InputGroup>
                        <FieldDescription>
                          Must be at least 8 characters with letters and
                          numbers.
                        </FieldDescription>
                      </FieldContent>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  </motion.div>
                )}
              />
            )}

            <Controller
              control={form.control}
              name="role"
              render={({ field, fieldState }) => (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 10 }}
                  transition={{
                    duration: ANIMATION_DURATION,
                    delay: showPasswordField
                      ? ROLE_DELAY_WITH_PASSWORD
                      : ROLE_DELAY_WITHOUT_PASSWORD,
                  }}
                >
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      className="flex items-center gap-2"
                      htmlFor="user-role"
                    >
                      <UserCog className="h-4 w-4" />
                      Role
                    </FieldLabel>
                    <FieldContent>
                      <TooltipProvider>
                        <Select
                          name={field.name}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger
                            aria-invalid={fieldState.invalid}
                            className="w-full"
                            id="user-role"
                          >
                            <SelectValue placeholder="Select user role" />
                          </SelectTrigger>
                          <SelectContent>
                            <Tooltip delayDuration={300}>
                              <TooltipTrigger asChild>
                                <SelectItem value="ADMIN">
                                  <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4" />
                                    Admin
                                  </div>
                                </SelectItem>
                              </TooltipTrigger>
                              <TooltipContent side="right">
                                <p className="max-w-xs text-sm">
                                  Full access to manage users, endpoints, and
                                  system settings
                                </p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip delayDuration={300}>
                              <TooltipTrigger asChild>
                                <SelectItem value="USER">
                                  <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    User
                                  </div>
                                </SelectItem>
                              </TooltipTrigger>
                              <TooltipContent side="right">
                                <p className="max-w-xs text-sm">
                                  Standard access to view endpoints only
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </SelectContent>
                        </Select>
                      </TooltipProvider>
                      <FieldDescription>
                        Assign appropriate permissions to this user.
                      </FieldDescription>
                    </FieldContent>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                </motion.div>
              )}
            />

            <Controller
              control={form.control}
              name="active"
              render={({ field, fieldState }) => (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 10 }}
                  transition={{
                    duration: ANIMATION_DURATION,
                    delay: showPasswordField
                      ? ACTIVE_DELAY_WITH_PASSWORD
                      : ACTIVE_DELAY_WITHOUT_PASSWORD,
                  }}
                >
                  <Field
                    className="rounded-lg border bg-muted/50 p-4"
                    data-invalid={fieldState.invalid}
                    orientation="horizontal"
                  >
                    <FieldContent>
                      <FieldLabel
                        className="flex items-center gap-2"
                        htmlFor="user-active"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Active Status
                      </FieldLabel>
                      <FieldDescription>
                        Enable or disable access to this user account.
                      </FieldDescription>
                    </FieldContent>
                    <Checkbox
                      aria-invalid={fieldState.invalid}
                      checked={field.value}
                      id="user-active"
                      name={field.name}
                      onCheckedChange={field.onChange}
                    />
                  </Field>
                </motion.div>
              )}
            />
          </FieldGroup>

          {children}
        </form>
      </Form>
    );
  }
);

UserForm.displayName = "UserForm";
