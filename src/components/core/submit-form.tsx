/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/Combobox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Loader2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Define input types with stricter constraints
interface InputBase {
  name: string;
  label: string;
  required?: boolean;
  errorMsg?: string;
  disabled?: boolean;
  colSpan?: string;
}

interface InputWithOptions extends InputBase {
  type: "select" | "radio" | "multiselect" | "combobox";
  options: { value: string; label: string }[];
  defaultValue?: string | string[];
  allowAddNew?: boolean;
  modalContent?: React.ReactNode;
  modelOpen?: boolean; // Add this property
  modelFunc?: () => void; // Add this property
}

interface InputWithoutOptions extends InputBase {
  type:
    | "text"
    | "textarea"
    | "number"
    | "date"
    | "checkbox"
    | "password"
    | "upload"
    | "switch";
  options?: never;
  defaultValue?: any;
  helperText?: string | React.ReactNode;
}

export type InputType = InputWithOptions | InputWithoutOptions;

interface SubmitFormProps {
  inputs: InputType[];
  btnTxt?: string;
  pageLink?: string;
  initialValues?: Record<string, any>;
  formPostUrl?: string;
  modelFunc?: () => void;
  btnType?: string;
  onSubmit: (
    values?: Record<string, any>
  ) => Promise<{ success: boolean; error?: string }>;
  btnsList?: { cancelAction: () => void; label: string }[];
}

const createFormSchema = (inputs: InputType[]) => {
  const schemaShape: Record<string, z.ZodTypeAny> = {};

  inputs.forEach((input) => {
    let fieldSchema: z.ZodTypeAny;

    switch (input.type) {
      case "text":
        if (input.label.toLowerCase() === "email") {
          const emailSchema = z
            .string()
            .email({
              message: input.errorMsg || "Please enter a valid email address",
            })
            .max(100, {
              message: `${input.label} must be less than 100 characters`,
            })
            .trim();

          fieldSchema = input.required
            ? emailSchema
            : z.union([z.literal(""), emailSchema]).optional();
        } else {
          let textSchema = z
            .string()
            .max(100, {
              message: `${input.label} must be less than 100 characters`,
            })
            .trim();

          if (input.required) {
            textSchema = textSchema.min(1, {
              message: input.errorMsg || `${input.label} cannot be empty`,
            });
            fieldSchema = textSchema;
          } else {
            fieldSchema = z.union([z.literal(""), textSchema]).optional();
          }
        }
        break;
      case "textarea":
        let textareaSchema = z
          .string()
          .max(500, {
            message: `${input.label} must be less than 500 characters`,
          })
          .trim();

        if (input.required) {
          textareaSchema = textareaSchema.min(1, {
            message: input.errorMsg || `${input.label} cannot be empty`,
          });
          fieldSchema = textareaSchema;
        } else {
          fieldSchema = z.union([z.literal(""), textareaSchema]).optional();
        }
        break;
      case "password":
        if (input.required) {
          fieldSchema = z
            .string()
            .min(8, {
              message:
                input.errorMsg || "Password must be at least 8 characters",
            })
            .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/, {
              message:
                "Password must contain at least one letter and one number",
            });
        } else {
          fieldSchema = z
            .union([
              z.literal(""),
              z
                .string()
                .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/, {
                  message:
                    "If provided, password must be at least 8 characters with one letter and one number",
                }),
            ])
            .optional();
        }
        break;
      case "number":
        if (input.required) {
          fieldSchema = z
            .number()
            .min(0, { message: `${input.label} must be positive` })
            .max(1000000, { message: `${input.label} is too large` });
        } else {
          fieldSchema = z.number().optional();
        }
        break;
      case "date":
        if (input.required) {
          fieldSchema = z.date({
            required_error: input.errorMsg || `${input.label} is required`,
            invalid_type_error: "Please select a valid date",
          });
        } else {
          fieldSchema = z.date().optional();
        }
        break;
      case "select":
      case "radio":
      case "combobox":
        if (input.required) {
          fieldSchema = z.string().min(1, {
            message: input.errorMsg || `${input.label} must be selected`,
          });
        } else {
          fieldSchema = z.string().optional();
        }
        break;
      case "multiselect":
        if (input.required) {
          fieldSchema = z.array(z.string()).min(1, {
            message:
              input.errorMsg ||
              `${input.label} must have at least one selection`,
          });
        } else {
          fieldSchema = z.array(z.string()).optional();
        }
        break;
      case "checkbox":
        fieldSchema = z.boolean().optional();
        break;
      case "switch":
        if (input.required) {
          fieldSchema = z.boolean().refine((val) => val !== undefined, {
            message: input.errorMsg || `${input.label} state must be defined`,
          });
        } else {
          fieldSchema = z.boolean().optional();
        }
        break;
      case "upload":
        if (input.required) {
          fieldSchema = z
            .instanceof(File)
            .refine(
              (file) => file && file.size > 0,
              input.errorMsg || "Please upload a file"
            )
            .refine(
              (file) => file.size <= 5 * 1024 * 1024,
              "File size must be less than 5MB"
            )
            .refine(
              (file) =>
                [
                  "image/jpeg",
                  "image/png",
                  "application/pdf",
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ].includes(file.type),
              "Only PDF PNG JPEG and DOCX files are allowed"
            );
        } else {
          fieldSchema = z
            .instanceof(File)
            .optional()
            .nullable()
            .refine(
              (file) => !file || file.size <= 5 * 1024 * 1024,
              "File size must be less than 5MB"
            )
            .refine(
              (file) =>
                !file ||
                ["image/jpeg", "image/png", "application/pdf"].includes(
                  file.type
                ),
              "Only JPEG, PNG, and PDF files are allowed"
            );
        }
        break;
    }

    schemaShape[input.name] = fieldSchema;
  });

  return z.object(schemaShape);
};

const generateDefaultValues = (
  inputs: InputType[],
  initialValues?: Record<string, any>
): Record<string, any> => {
  const defaults: Record<string, any> = {};

  inputs.forEach((input) => {
    const initialValue = initialValues?.[input.name];
    switch (input.type) {
      case "text":
      case "textarea":
      case "password":
        defaults[input.name] = initialValue ?? input.defaultValue ?? "";
        break;
      case "select":
      case "radio":
      case "combobox":
        defaults[input.name] = initialValue ?? input.defaultValue ?? "";
        break;
      case "multiselect":
        defaults[input.name] = initialValue ?? input.defaultValue ?? [];
        break;
      case "number":
        defaults[input.name] = initialValue ?? input.defaultValue ?? 0;
        break;
      case "date":
        defaults[input.name] = initialValue ?? input.defaultValue ?? undefined;
        break;
      case "checkbox":
      case "switch":
        defaults[input.name] = initialValue ?? input.defaultValue ?? false;
        break;
      case "upload":
        defaults[input.name] = initialValue ?? undefined;
        break;
    }
  });

  return defaults;
};

const SubmitForm: React.FC<SubmitFormProps> = ({
  inputs,
  btnTxt,
  initialValues,
  onSubmit,
  btnsList,
  formPostUrl,
  btnType,
}) => {
  const formSchema = createFormSchema(inputs);
  const defaultValues = generateDefaultValues(inputs, initialValues);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dynamicOptions, setDynamicOptions] = useState<
    Record<string, { value: string; label: string }[]>
  >({});
  const [openDatePicker, setOpenDatePicker] = useState<Record<string, boolean>>(
    {}
  );
  const [isModelOpen, setIsModelOpen] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const result = await onSubmit(values);
      if (result.success) {
        form.reset();
        if (formPostUrl) {
          router.push(formPostUrl);
        }
      } else {
        toast.error(result.error);
        form.setError("root", {
          message: result.error || "Submission error occurred",
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
      form.setError("root", { message: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOption = (inputName: string, newOption: string) => {
    if (newOption.trim()) {
      const newOpt = {
        value: newOption.toLowerCase().replace(/\s+/g, "-"),
        label: newOption,
      };
      setDynamicOptions((prev) => ({
        ...prev,
        [inputName]: [...(prev[inputName] || []), newOpt],
      }));
      form.setValue(inputName, [
        ...(form.getValues(inputName) || []),
        newOpt.value,
      ]);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="grid grid-cols-12 space-y-4 space-x-4 items-start">
          {inputs.map((input, index) => (
            <div
              className={`${input?.colSpan ? input?.colSpan : "col-span-12"}`}
            >
              <FormField
                key={index}
                control={form.control}
                name={input.name}
                render={({ field }) => (
                  <FormItem className="space-x-4">
                    <FormLabel className="w-full text-right capitalize">
                      {input.label}
                      {!input.required && (
                        <span className="text-sm text-muted-foreground ml-1">
                          (optional)
                        </span>
                      )}
                    </FormLabel>

                    <div className="w-full">
                      <FormControl>
                        {input.type === "text" ? (
                          <>
                            <Input
                              disabled={input.disabled}
                              {...field}
                              value={(field.value as string) ?? ""}
                            />
                            {input.helperText ? input.helperText : null}
                          </>
                        ) : input.type === "textarea" ? (
                          <>
                            <Textarea
                              disabled={input.disabled}
                              {...field}
                              value={(field.value as string) ?? ""}
                            />
                            {input.helperText ? input.helperText : null}
                          </>
                        ) : input.type === "number" ? (
                          <Input
                            type="number"
                            disabled={input.disabled}
                            min="0"
                            {...field}
                            value={(field.value as number) ?? 0}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? parseInt(e.target.value) : 0
                              )
                            }
                          />
                        ) : input.type === "date" ? (
                          <Popover
                            open={openDatePicker[input.name]}
                            onOpenChange={(open) =>
                              setOpenDatePicker((prev) => ({
                                ...prev,
                                [input.name]: open,
                              }))
                            }
                          >
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value
                                    ? format(field.value as Date, "PPP")
                                    : "Pick a date"}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={field.value as Date}
                                onSelect={(date) => {
                                  field.onChange(date);
                                  setOpenDatePicker((prev) => ({
                                    ...prev,
                                    [input.name]: false,
                                  }));
                                }}
                                disabled={input.disabled}
                              />
                            </PopoverContent>
                          </Popover>
                        ) : input.type === "select" ? (
                          <Select
                            disabled={input.disabled}
                            onValueChange={field.onChange}
                            value={field.value as string}
                            defaultValue={input.defaultValue as string}
                          >
                            <FormControl className="w-full">
                              <SelectTrigger>
                                <SelectValue placeholder="Select an option" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[
                                ...(input.options || []),
                                ...(dynamicOptions[input.name] || []),
                              ].map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : input.type === "multiselect" ? (
                          <div className="space-y-2">
                            <MultiSelect
                              options={[
                                ...(input.options || []),
                                ...(dynamicOptions[input.name] || []),
                              ]}
                              onValueChange={field.onChange}
                              value={field.value as string[]}
                              placeholder="Select options"
                              maxCount={3}
                              disabled={input.disabled}
                            />
                            {input.allowAddNew && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add New Option
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Add New Option</DialogTitle>
                                  </DialogHeader>
                                  <AddOptionForm
                                    onAdd={(newOption) =>
                                      handleAddOption(input.name, newOption)
                                    }
                                  />
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        ) : input.type === "combobox" ? (
                          <div className="space-y-2">
                            <Combobox
                              options={[
                                ...(input.options || []),
                                ...(dynamicOptions[input.name] || []),
                              ]}
                              value={field.value as string}
                              onChange={(value) => {
                                field.onChange(value || "");
                              }}
                              placeholder="Search or select..."
                              disabled={input.disabled}
                              // className="w-full"
                            />
                            {input.allowAddNew && (
                              <div>
                                <Button
                                  onClick={input?.modelFunc}
                                  variant={"outline"}
                                  type="button"
                                >
                                  <Plus />
                                  Add New Client
                                </Button>
                                <Dialog
                                  open={input?.modelOpen}
                                  onOpenChange={input?.modelFunc}
                                >
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Add New Option</DialogTitle>
                                    </DialogHeader>
                                    {input?.modalContent}
                                  </DialogContent>
                                </Dialog>
                              </div>
                            )}
                          </div>
                        ) : input.type === "checkbox" ? (
                          <Checkbox
                            checked={(field.value as boolean) ?? false}
                            onCheckedChange={field.onChange}
                            disabled={input.disabled}
                          />
                        ) : input.type === "radio" ? (
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={(field.value as string) ?? ""}
                            disabled={input.disabled}
                            className="flex flex-col space-y-1"
                          >
                            {[
                              ...(input.options || []),
                              ...(dynamicOptions[input.name] || []),
                            ].map((option) => (
                              <FormItem
                                key={option.value}
                                className="flex items-center space-x-2 space-y-0"
                              >
                                <FormControl>
                                  <RadioGroupItem
                                    value={option.value}
                                    id={option.value}
                                  />
                                </FormControl>
                                <FormLabel
                                  htmlFor={option.value}
                                  className="font-normal"
                                >
                                  {option.label}
                                </FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        ) : input.type === "password" ? (
                          <Input
                            type="password"
                            disabled={input.disabled}
                            {...field}
                            value={(field.value as string) ?? ""}
                          />
                        ) : input.type === "upload" ? (
                          <FileUpload
                            onChange={field.onChange}
                            value={field.value as File | undefined}
                            disabled={input.disabled}
                          />
                        ) : input.type === "switch" ? (
                          <Switch
                            checked={(field.value as boolean) ?? false}
                            onCheckedChange={field.onChange}
                            disabled={input.disabled}
                          />
                        ) : null}
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>
        {form.formState.errors.root && (
          <div className="text-red-500 text-sm text-center">
            {form.formState.errors.root.message}
          </div>
        )}
        <div
          className={`${btnsList?.length ? "flex justify-end gap-4" : "w-64"}`}
        >
          {btnsList?.map((btn) => (
            <Button
              key={btn.label}
              type="button"
              variant={"outline"}
              className={`rounded ${btnsList?.length ? "w-32" : "w-full"}`}
              onClick={() => btn.cancelAction()}
            >
              {btn.label}
            </Button>
          ))}
          <Button
            type={"submit"}
            disabled={isLoading}
            className={`${btnsList?.length ? "" : "w-full"} mt-4`}
          >
            {isLoading && <Loader2 className="animate-spin" />}
            {isLoading ? "Loading..." : btnTxt}
          </Button>
        </div>
      </form>
    </Form>
  );
};

// Add Option Form Component
const AddOptionForm: React.FC<{ onAdd: (option: string) => void }> = ({
  onAdd,
}) => {
  const [newOption, setNewOption] = useState("");

  return (
    <div className="space-y-4">
      <Input
        value={newOption}
        onChange={(e) => setNewOption(e.target.value)}
        placeholder="Enter new option"
      />
      <Button
        onClick={() => {
          onAdd(newOption);
          setNewOption("");
        }}
        disabled={!newOption.trim()}
      >
        Add Option
      </Button>
    </div>
  );
};

// File Upload Component with react-dropzone
const FileUpload: React.FC<{
  onChange: (file: File | undefined) => void;
  value: File | undefined;
  disabled?: boolean;
}> = ({ onChange, value, disabled }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    disabled,
    onDrop: (acceptedFiles) => {
      onChange(acceptedFiles[0] || undefined);
    },
  });

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-md p-4 text-center",
          isDragActive ? "border-primary bg-primary/10" : "border-gray-300",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <p className="text-sm text-gray-600">
          {isDragActive
            ? "Drop the file here ..."
            : "Drag & drop a file here, or click to select"}
        </p>
        <p className="text-xs text-gray-500">
          (JPEG, PNG, PDF, or DOCX, max 5MB)
        </p>
      </div>
      {value && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{value.name}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(undefined)}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default SubmitForm;
