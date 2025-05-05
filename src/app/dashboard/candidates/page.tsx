"use client";
import {
  fetchTableData,
  fetchTableDataWithForeignKey,
} from "@/app/actions/action";
import { CandidateCard } from "@/components/core/candidate-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Candidate {
  id: number;
  created_at: string;
  name: string;
  email: string;
  email_verified: string | null;
  phone_verified: string | null;
  exp_min: number;
  exp_max: number;
  ctc: number;
  current_company: string;
  current_location: string;
  preferred_location: string;
  notice_period: number;
  remarks: string;
  resume_url: string;
  user_id: string;
  status?: string;
}

export default function CandidatesPage() {
  const router = useRouter();
  const [data, setData] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const loadData = async (page: number, append: boolean = false) => {
    setLoading(true);
    try {
      const response = await fetchTableData<Candidate>({
        tableName: "candidates",
        page,
        pageSize,
        columnToSort: "created_at",
        sortDirection: "desc",
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
      console.error("Error fetching candidates:", error);
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
      const filteredData = await fetchTableDataWithForeignKey<Candidate>({
        tableName: "candidates",
        page: 1,
        pageSize: 10,
        filters,
        columnToSort: "created_at",
        sortDirection: "desc",
        searchTerm,
        searchColumns: searchTerm
          ? [
              "name",
              "email",
              // "exp_min",
              // "exp_max",
              // "ctc",
              "current_company",
              "current_location",
              "preferred_location",
              // "notice_period",
              "remarks",
            ]
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
    router.push("/dashboard/candidates/new");
  };

  return (
    <div className="@container/main p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-3xl">Candidates</h2>
        <div>
          <Button size={"lg"} onClick={handleNavigate}>
            <Plus /> Add New Candidate
          </Button>
        </div>
      </div>
      <div className="my-5">
        <Input
          placeholder="Search with name,email...."
          onChange={handleSearch}
        />
      </div>
      <CandidateCard
        data={data}
        loading={loading}
        showMore={handleShowMore}
        hasMore={data.length < totalCount}
      />
    </div>
  );
}
