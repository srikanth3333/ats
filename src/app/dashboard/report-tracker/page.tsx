"use client";
import { fetchTableDataWithForeignKey } from "@/app/actions/action";
import { JobList } from "@/components/report-tracker/job-list";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { JobPosting } from "../job-postings/page";

function page() {
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
        foreignKeys: {
          client: ["id", "name", "contract_type"],
          user_profile: ["name", "role"],
        },
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
        foreignKeys: {
          client: ["id", "name", "contract_type"],
          user_profile: ["name", "role"],
        },
        searchTerm,
        searchColumns: searchTerm
          ? ["role", "job_status", "position", "mode_of_job", "name"]
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

  console.log(data);

  return (
    <div className="@container/main p-5">
      <div>
        <Input placeholder="Global Search here...." onChange={handleSearch} />
      </div>
      <div>
        <JobList jobs={data} />
      </div>
    </div>
  );
}

export default page;
