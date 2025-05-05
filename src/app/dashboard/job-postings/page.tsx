"use client";
import { fetchTableDataWithForeignKey } from "@/app/actions/action";
import { JobPostingCard } from "@/components/core/job-posting-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export interface JobPosting {
  id: number;
  created_at: string;
  role: string;
  skills: string[];
  location: string[];
  job_description: string;
  exp_min: number;
  exp_max: number;
  budget_min: number;
  budget_max: number;
  employment_type: string;
  mode_of_job: string;
  date_of_posting: string;
  position: string;
  refer: string | null;
  notify_recruiter: string | null;
  job_status: string;
  client: {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
  } | null;
  draft_status: string | null;
  assign: number;
  user_id: string;
}

function Page() {
  const router = useRouter();

  const [data, setData] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const loadData = async (page: number, append: boolean = false) => {
    setLoading(true);
    try {
      const response = await fetchTableDataWithForeignKey<JobPosting>({
        tableName: "job_posting",
        page,
        pageSize,
        columnToSort: "created_at",
        sortDirection: "desc",
        foreignKeys: { client: ["id", "name", "contract_type"] },
      });

      const newData = response.data.filter(
        (newItem) =>
          !data.some((existingItem) => existingItem.id === newItem.id)
      );

      if (append) {
        setData((prev) => [...prev, ...newData]);
      } else {
        setData(newData);
      }
      setTotalCount(response.totalCount);
    } catch (error) {
      console.error("Error fetching job postings:", error);
      if (!append) {
        setData([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(currentPage, currentPage > 1);
  }, [currentPage]);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("page", currentPage.toString());
    url.searchParams.set("pageSize", pageSize.toString());
    router.push(url.pathname + url.search, { scroll: false });
  }, [currentPage, pageSize]);

  const handleShowMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const applyFilters = async (
    filters: Record<string, any> = {},
    searchTerm: string = ""
  ) => {
    try {
      const filteredData = await fetchTableDataWithForeignKey<JobPosting>({
        tableName: "job_posting",
        page: 1,
        pageSize: 10,
        filters,
        columnToSort: "created_at",
        sortDirection: "desc",
        foreignKeys: { client: ["id", "name", "contract_type"] },
        searchTerm,
        searchColumns: searchTerm
          ? ["role", "job_status", "position", "mode_of_job"]
          : [],
      });
      setTotalCount(0);
      setCurrentPage(1);
      setData(filteredData?.data || []);
    } catch (error) {
      console.error("Error applying filters:", error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    applyFilters({}, searchTerm);
  };

  const handleNavigate = () => {
    router.push("/dashboard/job-postings/new");
  };

  console.log(data);

  return (
    <div className="@container/main p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-3xl">Job Postings</h2>
        <div>
          <Button size={"lg"} onClick={handleNavigate}>
            <Plus /> Add New
          </Button>
        </div>
      </div>
      <div className="my-5">
        <Input
          placeholder="Search with role,position,mode of job,job status..."
          onChange={handleSearch}
        />
      </div>
      <div>
        <JobPostingCard
          data={data}
          loading={loading}
          showMore={handleShowMore}
          hasMore={data.length < totalCount}
        />
      </div>
    </div>
  );
}

export default Page;
