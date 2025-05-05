"use client";
import { createRecord } from "@/app/actions/action";
import SubmitForm from "@/components/core/submit-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const contractTypes = [
  { value: "contract", label: "Contract" },
  { value: "full_time", label: "Full Time" },
  { value: "sub_vendor", label: "Sub Vendor" },
];

const formInputs = [
  {
    type: "text" as "text",
    name: "name",
    label: "Client Name",
    required: true,
    colSpan: "col-span-6",
    errorMsg: "Client name is required",
  },
  {
    type: "combobox" as "combobox",
    name: "contract_type",
    label: "Contract Type",
    options: contractTypes,
    required: true,
    colSpan: "col-span-6",
    errorMsg: "Contract Type is required",
  },
  {
    type: "date" as "date",
    name: "start_date",
    label: "Start Date",
    required: true,
    colSpan: "col-span-6",
    errorMsg: "Start Date name is required",
  },
];

function page() {
  const handleSubmit = async (values?: any) => {
    if (!values) {
      toast("No values provided");
      return { success: false, error: "No values provided" };
    }
    try {
      const result = await createRecord("clients", values);
      toast("Client submitted successfully!");
      return {
        success: result.success,
        error: result.error ? result.error.message : undefined,
      };
    } catch (error) {
      toast("Failed to submit form");
      return { success: false, error: "Submission failed" };
    }
  };

  return (
    <div className="@container/main p-5">
      <div>
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Add Client</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <SubmitForm
                formPostUrl="/dashboard/clients"
                inputs={formInputs}
                btnTxt="Save Client"
                onSubmit={handleSubmit}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default page;
