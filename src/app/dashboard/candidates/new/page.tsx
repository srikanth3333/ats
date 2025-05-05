"use client";
import {
  createRecord,
  getAssignJobPost,
  uploadResume,
} from "@/app/actions/action";
import SubmitForm from "@/components/core/submit-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function page() {
  const [clientData, setClientsData] = useState<any[]>([]);
  const uploadFile = async (document: File) => {
    const result = await uploadResume(document);
    return result;
  };

  const getCandidates = async () => {
    const result = await getAssignJobPost();
    const data = result?.map((record: any) => ({
      label: `${record?.client?.name} (${record?.role})`,
      value: record?.id?.toString(),
    }));
    setClientsData(data);
    console.log(data);
  };

  const formInputs = [
    {
      type: "upload" as "upload",
      name: "resume_url",
      label: "Resume",
      required: true,
      colSpan: "col-span-12",
      errorMsg: "Resume is required",
    },
    {
      type: "text" as "text",
      name: "name",
      label: "Name",
      required: true,
      colSpan: "col-span-6",
      errorMsg: "Name is required",
    },
    {
      type: "text" as "text",
      name: "email",
      label: "Email",
      required: true,
      colSpan: "col-span-6",
      errorMsg: "Email is required",
    },
    {
      type: "number" as "number",
      name: "exp_min",
      label: "Experience min",
      required: true,
      colSpan: "col-span-6",
      errorMsg: "Experience min is required",
    },
    {
      type: "number" as "number",
      name: "exp_max",
      label: "Experience Max",
      required: true,
      colSpan: "col-span-6",
      errorMsg: "Experience Max is required",
    },
    {
      type: "number" as "number",
      name: "ctc",
      label: "CTC",
      required: true,
      colSpan: "col-span-6",
      errorMsg: "CTC is required",
    },
    {
      type: "text" as "text",
      name: "current_company",
      label: "Current Company",
      required: true,
      colSpan: "col-span-6",
      errorMsg: "Current Company is required",
    },
    {
      type: "text" as "text",
      name: "current_location",
      label: "Current Location",
      required: true,
      colSpan: "col-span-6",
      errorMsg: "Current Location is required",
    },
    {
      type: "text" as "text",
      name: "preferred_location",
      label: "Preferred Location",
      required: true,
      colSpan: "col-span-6",
      errorMsg: "Preferred Location is required",
    },
    {
      type: "number" as "number",
      name: "notice_period",
      label: "Notice Period",
      required: true,
      colSpan: "col-span-6",
      errorMsg: "Notice Period is required",
    },
    {
      type: "text" as "text",
      name: "remarks",
      label: "Remarks",
      required: true,
      colSpan: "col-span-6",
      errorMsg: "Remarks is required",
    },
    {
      type: "combobox" as "combobox",
      name: "job_posting",
      label: "Assign Job",
      options: clientData,
      required: false,
      colSpan: "col-span-6",
      errorMsg: "Assign Job is required",
    },
  ];

  useEffect(() => {
    getCandidates();
  }, []);

  const handleSubmit = async (values?: any) => {
    if (!values) {
      toast("No values provided");
      return { success: false, error: "No values provided" };
    }
    try {
      let uploadResult;
      if (values?.resume_url) {
        uploadResult = await uploadFile(values.resume_url);
        if (uploadResult.error) {
          toast("Error Uploading File");
          return { success: false, error: "Error uploading file" };
        }
      }
      const result = await createRecord("candidates", {
        ...values,
        resume_url: uploadResult?.data?.url,
        job_status: "new",
      });
      if (result?.success) {
        toast("Candidate submitted successfully!");
      }
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
            <CardTitle>Add Candidate</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <SubmitForm
                formPostUrl="/dashboard/candidates"
                inputs={formInputs}
                btnTxt="Save Candidate"
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
