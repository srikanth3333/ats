"use client";
import {
  createRecord,
  getAssignList,
  getClientsList,
} from "@/app/actions/action";
import SubmitForm from "@/components/core/submit-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import cities from "./cities.json";
import jobs from "./jobs.json";

const contractTypes = [
  { value: "contract", label: "Contract" },
  { value: "full_time", label: "Full Time" },
  { value: "sub_vendor", label: "Sub Vendor" },
];

function page() {
  const [clientsData, setClientsData] = useState<any>([]);
  const [assignData, setAssignData] = useState<any>([]);
  const [modelOpen, setModelOpen] = useState<boolean>(false);

  const getClients = async () => {
    const result = await getClientsList();
    setClientsData(result);
  };

  const getAssisnies = async () => {
    const result = await getAssignList();
    console.log("result", result);
    setAssignData(result);
  };

  useEffect(() => {
    getClients();
    getAssisnies();
  }, []);

  const handleSubmit = async (values?: any) => {
    if (!values) {
      toast("No values provided");
      return { success: false, error: "No values provided" };
    }
    try {
      const result = await createRecord("job_posting", {
        ...values,
        user_profile: 1,
      });

      if (result?.success) {
        toast("Job Posting submitted successfully!");
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

  const handleSubmitClient = async (values?: any) => {
    if (!values) {
      toast("No values provided");
      return { success: false, error: "No values provided" };
    }
    try {
      const result = await createRecord("clients", values);
      if (result?.success) {
        setModelOpen(!modelOpen);
        getClients();
        toast("Client submitted successfully!");
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

  const formInputsClient = [
    {
      type: "text" as "text",
      name: "name",
      label: "Client Name",
      required: true,
      colSpan: "col-span-12",
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

  const AddNewClientModel = () => (
    <div>
      <SubmitForm
        inputs={formInputsClient}
        btnTxt="Save Client"
        onSubmit={handleSubmitClient}
        btnType="button"
      />
    </div>
  );

  const modelFunc = () => {
    setModelOpen(!modelOpen);
  };

  const formInputs = [
    {
      type: "text" as "text",
      name: "role",
      label: "Job Role",
      required: true,
      colSpan: "col-span-6",
      errorMsg: "Job Role is required",
    },
    {
      type: "multiselect" as "multiselect",
      name: "skills",
      label: "Skills",
      required: true,
      options: jobs,
      colSpan: "col-span-6",
      errorMsg: "Skills is required",
    },
    {
      type: "multiselect" as "multiselect",
      name: "location",
      label: "Location",
      required: true,
      options: cities,
      colSpan: "col-span-6",
      errorMsg: "location is required",
    },
    {
      type: "textarea" as "textarea",
      name: "job_description",
      label: "Job Description",
      required: true,
      colSpan: "col-span-6",
      errorMsg: "Job Description is required",
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
      name: "budget_min",
      label: "Budget Min",
      required: true,
      colSpan: "col-span-6",
      errorMsg: "Budget Min is required",
    },
    {
      type: "number" as "number",
      name: "budget_max",
      label: "Budget Max",
      required: true,
      colSpan: "col-span-6",
      errorMsg: "Budget Max is required",
    },
    {
      type: "text" as "text",
      name: "employment_type",
      label: "Employment Type",
      required: true,
      colSpan: "col-span-6",
      errorMsg: "Employment Type is required",
    },

    {
      type: "text" as "text",
      name: "mode_of_job",
      label: "Mode Of Job",
      required: true,
      colSpan: "col-span-6",
      errorMsg: "mode of job is required",
    },

    {
      type: "text" as "text",
      name: "position",
      label: "Position",
      required: true,
      colSpan: "col-span-6",
      errorMsg: "position is required",
    },

    {
      type: "combobox" as "combobox",
      name: "job_status",
      label: "Job Status",
      options: contractTypes,
      required: true,
      colSpan: "col-span-6",
      errorMsg: "job status is required",
    },
    {
      type: "combobox" as "combobox",
      name: "client",
      label: "Client",
      options: clientsData,
      allowAddNew: true,
      modalContent: <AddNewClientModel />,
      modelOpen: modelOpen,
      modelFunc: modelFunc,
      required: true,
      colSpan: "col-span-6",
      errorMsg: "Client is required",
    },
    {
      type: "combobox" as "combobox",
      name: "assign",
      label: "Assign To",
      options: assignData,
      required: true,
      colSpan: "col-span-6",
      errorMsg: "Assign To is required",
    },
  ];

  return (
    <div className="@container/main p-5">
      <div>
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Add Job Posting</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <SubmitForm
                formPostUrl="/dashboard/job-postings"
                inputs={formInputs}
                btnTxt="Save Job"
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
