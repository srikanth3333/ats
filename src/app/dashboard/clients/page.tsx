"use client";
import { fetchTableData } from "@/app/actions/action";
import DataTable from "@/components/core/data-table";
import { MetricCard } from "@/components/core/metric-card";
import { Button } from "@/components/ui/button";
import { BriefcaseIcon, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function page() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const columns = [
    { label: "Client Name", name: "name" },
    { label: "Contract Type", name: "contract_type" },
    { label: "Start Date", name: "start_date", type: "date" },
  ];
  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetchTableData<any>({
        tableName: "clients",
        page: currentPage,
        pageSize: pageSize,
        columnToSort: "created_at",
        sortDirection: "desc",
      });
      setData(response.data);
      setTotalCount(response.totalCount);
    } catch (error) {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const url = new URL(window.location.href);
    url.searchParams.set("page", currentPage.toString());
    url.searchParams.set("pageSize", pageSize.toString());
    router.push(url.pathname + url.search);
  }, [currentPage, pageSize]);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleRowClick = (row: Record<string, any>) => {};

  const handleNavigate = () => {
    router.push("/dashboard/clients/new");
  };

  return (
    <div className="@container/main p-5">
      <div className="grid grid-cols-1 md:grid-cols-4">
        <MetricCard
          title="Total Clients"
          value={1}
          icon={BriefcaseIcon}
          trend={{ value: 0, isPositive: true }}
        />
      </div>
      <div className="my-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-3xl">Clients</h2>
          <div>
            <Button size={"lg"} onClick={handleNavigate}>
              <Plus /> Add New Client
            </Button>
          </div>
        </div>
        <DataTable
          jsonData={data}
          arrayData={columns}
          loading={loading}
          paginate={true}
          pageSizeOptions={["5", "10", "20", "50"]}
          pageSizeSelected={pageSize}
          onchangePageSize={handlePageSizeChange}
          totalItems={totalCount}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onRowClick={handleRowClick}
        />
      </div>
    </div>
  );
}

export default page;
