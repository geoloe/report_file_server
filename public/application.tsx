import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { CoreStart } from '../../../src/core/public';
import {
  EuiBasicTable,
  EuiLink,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiTitle,
  EuiSpacer,
  EuiFieldSearch,
  EuiButtonIcon,
  EuiTabbedContent,
} from '@elastic/eui';

interface Report {
  name: string;
  creationTime: string; // ISO string for sorting
}

export const renderApp = (coreStart: CoreStart, depsStart: any, { element }: { element: HTMLElement }) => {
  const ReportFileServerApp = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [filteredReports, setFilteredReports] = useState<Report[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [sortField, setSortField] = useState<keyof Report>('creationTime');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [selectedTab, setSelectedTab] = useState<string>('daily'); // Default to 'daily'

    const fetchReports = async () => {
      try {
        const response = await coreStart.http.get<{ reports: Report[] }>('/api/custom_reports/reports');
        const fetchedReports = response.reports || [];
        const sortedReports = [...fetchedReports].sort((a, b) =>
          new Date(b.creationTime).getTime() - new Date(a.creationTime).getTime()
        );
        setReports(sortedReports);
        setFilteredReports(sortedReports);
      } catch (error) {
        console.error('Error fetching reports:', error);
        setReports([]);
        setFilteredReports([]);
      }
    };

    useEffect(() => {
      fetchReports();
    }, []);

    useEffect(() => {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const tabFilter = selectedTab === 'daily' ? '[DAILY]' : '[MONTHLY]';

      const filtered = reports
        .filter((report) => report.name.includes(tabFilter))
        .filter((report) => report.name.toLowerCase().includes(lowerCaseQuery));

      const sorted = [...filtered].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });

      setFilteredReports(sorted);
    }, [searchQuery, reports, sortField, sortDirection, selectedTab]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    };

    const handleTableChange = ({ page, sort }: { page?: any; sort?: any }) => {
      if (page) {
        setPageIndex(page.index);
        setPageSize(page.size);
      }

      if (sort) {
        setSortField(sort.field);
        setSortDirection(sort.direction);
      }
    };

    const handleDownload = async (name: string) => {
      try {
        const fileName = encodeURIComponent(name);
        const url = `/api/custom_reports/download/${fileName}`;
        const response = await fetch(url, { method: 'GET' });
        if (!response.ok) throw new Error(`Failed to download the report: ${response.statusText}`);
        const arrayBuffer = await response.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        const fileURL = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = fileURL;
        link.download = name;
        link.click();
        window.URL.revokeObjectURL(fileURL);
      } catch (error) {
        console.error('Error downloading report:', error);
      }
    };

    const columns = [
      {
        field: 'name',
        name: 'Report Name',
        sortable: true,
        render: (name: string) => (
          <EuiLink onClick={() => handleDownload(name)}>{name}</EuiLink>
        ),
      },
      {
        field: 'creationTime',
        name: 'Creation Time',
        sortable: true,
        render: (time: string) => {
          const parsedDate = new Date(time);
          return isNaN(parsedDate.getTime()) ? 'N/A' : parsedDate.toLocaleString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          });
        },
      },
      {
        name: 'Download',
        render: (report: Report) => (
          <EuiButtonIcon
            iconType="download"
            onClick={() => handleDownload(report.name)}
            aria-label="Download"
            color="primary"
          />
        ),
      },
    ];

    const paginatedReports = filteredReports.slice(
      pageIndex * pageSize,
      (pageIndex + 1) * pageSize
    );

    const tabs = [
      {
        id: 'daily',
        name: 'Daily Reports',
        content: (
          <>
            <EuiSpacer size="m" />
            <EuiBasicTable<Report>
              items={paginatedReports}
              columns={columns}
              pagination={{
                pageIndex,
                pageSize,
                totalItemCount: filteredReports.length,
                pageSizeOptions: [5, 10, 20, 50],
              }}
              sorting={{
                sort: { field: sortField, direction: sortDirection },
              }}
              onChange={handleTableChange}
            />
          </>
        ),
      },
      {
        id: 'monthly',
        name: 'Monthly Reports',
        content: (
          <>
            <EuiSpacer size="m" />
            <EuiBasicTable<Report>
              items={paginatedReports}
              columns={columns}
              pagination={{
                pageIndex,
                pageSize,
                totalItemCount: filteredReports.length,
                pageSizeOptions: [5, 10, 20, 50],
              }}
              sorting={{
                sort: { field: sortField, direction: sortDirection },
              }}
              onChange={handleTableChange}
            />
          </>
        ),
      },
    ];

    return (
      <EuiPage paddingSize="l">
        <EuiPageBody>
          <EuiPageContent>
            <EuiTitle size="l">
              <h1>Reports</h1>
            </EuiTitle>
            <EuiSpacer size="m" />
            <EuiFieldSearch
              placeholder="Search reports"
              value={searchQuery}
              onChange={handleSearch}
              isClearable
              aria-label="Search reports"
            />
            <EuiSpacer size="m" />
            <EuiTabbedContent
              tabs={tabs}
              selectedTab={tabs.find((tab) => tab.id === selectedTab)}
              onTabClick={(tab) => setSelectedTab(tab.id)}
            />
          </EuiPageContent>
        </EuiPageBody>
      </EuiPage>
    );
  };

  ReactDOM.render(<ReportFileServerApp />, element);
  return () => ReactDOM.unmountComponentAtNode(element);
};