/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/Combobox";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Define input types
interface InputBase {
  name: string;
  label: string;
  required?: boolean;
  errorMsg?: string;
  disabled?: boolean;
  hidden?: boolean; // For column visibility toggle
}

interface InputWithOptions extends InputBase {
  type: "select" | "radio" | "multiselect" | "combobox";
  options: { value: string; label: string }[];
  defaultValue?: string | string[];
}

interface InputWithoutOptions extends InputBase {
  type: "text" | "textarea" | "number" | "date" | "checkbox";
  options?: never;
  defaultValue?: any;
}

export type InputType = InputWithOptions | InputWithoutOptions;

export interface FilterCardProps {
  inputs: InputType[];
  btnTxt: string;
  btnResetTxt?: string;
  initialValues?: Record<string, any>;
  submitApi: (
    values: Record<string, any>
  ) => Promise<{ success: boolean; error?: string }>;
  autoChange?: boolean;
  listOfDrpdownDataUpdateApis?: ((
    values: Record<string, any>
  ) => Promise<any>)[];
  updateDrpdownData?: boolean;
}

const createFormSchema = (inputs: InputType[]) => {
  const schemaShape: Record<string, z.ZodTypeAny> = {};

  inputs.forEach((input) => {
    if (input.hidden) return; // Skip hidden inputs

    let fieldSchema: z.ZodTypeAny;

    switch (input.type) {
      case "text":
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
      case "combobox":
      case "radio":
        if (input.required) {
          fieldSchema = z
            .string()
            .refine((val) => val !== undefined && val !== "", {
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
    if (input.hidden) return;

    const initialValue = initialValues?.[input.name];
    switch (input.type) {
      case "text":
      case "textarea":
        defaults[input.name] = initialValue ?? input.defaultValue ?? "";
        break;
      case "select":
      case "radio":
      case "combobox":
        defaults[input.name] =
          initialValue ?? input.defaultValue ?? input.options?.[0]?.value ?? "";
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
        defaults[input.name] = initialValue ?? input.defaultValue ?? false;
        break;
    }
  });

  return defaults;
};

const FilterCard: React.FC<FilterCardProps> = ({
  inputs,
  btnTxt,
  btnResetTxt = "Reset",
  initialValues,
  submitApi,
  autoChange = false,
  listOfDrpdownDataUpdateApis = [],
  updateDrpdownData = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >(
    inputs.reduce((acc, input) => ({ ...acc, [input.name]: !input.hidden }), {})
  );

  const formSchema = createFormSchema(inputs.filter((input) => !input.hidden));
  const defaultValues = generateDefaultValues(inputs, initialValues);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const queryString = Object.keys(values)
        .filter(
          (key) =>
            values[key] !== undefined && values[key] !== "" && key !== "page"
        )
        .map((key) => {
          const encodedKey = encodeURIComponent(key);
          const encodedValue = Array.isArray(values[key])
            ? values[key].map((v: string) => encodeURIComponent(v)).join(",")
            : encodeURIComponent(values[key]);
          return `${encodedKey}=${encodedValue}`;
        })
        .join("&");

      const result = await submitApi({ ...values });
      if (result.success) {
        toast.success("Filter applied successfully!");
      } else {
        toast.error(result.error || "Failed to apply filter");
        form.setError("root", {
          message: result.error || "Submission error occurred",
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An unexpected error occurred");
      form.setError("root", { message: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    form.reset();
    toast.info("Form reset");
  };

  const handleValuesChange = async (
    changedValues: any,
    allValues: z.infer<typeof formSchema>
  ) => {
    if (autoChange) {
      await handleSubmit(allValues);
    }
    if (
      updateDrpdownData &&
      autoChange &&
      listOfDrpdownDataUpdateApis.length > 0
    ) {
      try {
        await Promise.all(
          listOfDrpdownDataUpdateApis.map((api) => api(allValues))
        );
      } catch (error) {
        console.error("Error updating dropdown data:", error);
        toast.error("Failed to update dropdown data");
      }
    }
  };

  const toggleColumnVisibility = (columnName: string) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnName]: !prev[columnName],
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 ">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          Filters
        </h2>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4"
        >
          {inputs.map((input, index) => {
            if (!columnVisibility[input.name]) return null;

            return (
              <FormField
                key={index}
                control={form.control}
                name={input.name}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {input.label}
                      {!input.required && (
                        <span className="text-xs text-gray-400 ml-1">
                          {/* (optional) */}
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      {input.type === "text" ? (
                        <Input
                          disabled={input.disabled}
                          {...field}
                          value={(field.value as string) ?? ""}
                          className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200"
                        />
                      ) : input.type === "textarea" ? (
                        <Textarea
                          disabled={input.disabled}
                          {...field}
                          value={(field.value as string) ?? ""}
                          className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200"
                        />
                      ) : input.type === "number" ? (
                        <Input
                          type="number"
                          disabled={input.disabled}
                          {...field}
                          value={(field.value as number) ?? 0}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? parseInt(e.target.value) : 0
                            )
                          }
                          className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200"
                        />
                      ) : input.type === "date" ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200",
                                !field.value &&
                                  "text-gray-400 dark:text-gray-500"
                              )}
                              disabled={input.disabled}
                            >
                              {field.value
                                ? format(field.value as Date, "PPP")
                                : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                            <Calendar
                              mode="single"
                              selected={field.value as Date}
                              onSelect={field.onChange}
                              disabled={input.disabled}
                              className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                            />
                          </PopoverContent>
                        </Popover>
                      ) : input.type === "select" ? (
                        <select
                          disabled={input.disabled}
                          onChange={(e) => field.onChange(e.target.value)}
                          value={field.value as string}
                          className="w-full p-2 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                        >
                          <option value="">Select an option</option>
                          {input.options.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : input.type === "multiselect" ? (
                        <MultiSelect
                          options={input.options}
                          onValueChange={field.onChange}
                          value={field.value as string[]}
                          placeholder="Select options"
                          maxCount={3}
                          disabled={input.disabled}
                          className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200"
                        />
                      ) : input.type === "combobox" ? (
                        <Combobox
                          options={input.options}
                          value={field.value as string}
                          onChange={field.onChange}
                          placeholder="Search or select..."
                          disabled={input.disabled}
                        />
                      ) : input.type === "radio" ? (
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value as string}
                          disabled={input.disabled}
                          className="flex flex-col space-y-2"
                        >
                          {input.options.map((option) => (
                            <div
                              key={option.value}
                              className="flex items-center space-x-2"
                            >
                              <RadioGroupItem
                                value={option.value}
                                id={option.value}
                              />
                              <label
                                htmlFor={option.value}
                                className="text-sm text-gray-700 dark:text-gray-200"
                              >
                                {option.label}
                              </label>
                            </div>
                          ))}
                        </RadioGroup>
                      ) : input.type === "checkbox" ? (
                        <Checkbox
                          checked={field.value as boolean}
                          onCheckedChange={field.onChange}
                          disabled={input.disabled}
                          className="border-gray-200 dark:border-gray-600"
                        >
                          {input.label}
                        </Checkbox>
                      ) : null}
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
            );
          })}
          {form.formState.errors.root && (
            <div className="col-span-full text-red-500 text-sm text-center">
              {form.formState.errors.root.message}
            </div>
          )}
          <div className="col-span-full flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              {btnResetTxt}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {btnTxt}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default FilterCard;
