import { IRouter } from '../../../../src/core/server';
import fs from 'fs';
import path from 'path';

// Define the reports directory relative to the user's home directory
const REPORTS_DIRECTORY = '/mnt/reports';

export const defineRoutes = (router: IRouter) => {
  // Route to fetch the list of reports for the current tenant
  router.get(
    {
      path: '/api/custom_reports/reports',
      validate: false,
    },
    async (context, request, response) => {
      try {
        // Fetch the logged-in user's info via OpenSearch security plugin
        const { body: authInfo } = await context.core.opensearch.client.asCurrentUser.transport.request({
          method: 'GET',
          path: '/_plugins/_security/authinfo',
        });
  
        // Extract the tenant name from the authInfo response
        const tenantName = authInfo.user_requested_tenant;
  
        //console.log(`Fetching reports for tenant: ${tenantName}`);
  
        // Read all files from the reports directory
        const files = fs.readdirSync(REPORTS_DIRECTORY);
  
        // Filter files that contain the tenant's name in the filename (case-insensitive)
        const filteredReports = files
          .filter((file) => file.toLowerCase().includes(tenantName.toLowerCase()) && file.endsWith('.pdf'))
          .map((name) => {
            const filePath = path.join(REPORTS_DIRECTORY, name);
            const stats = fs.statSync(filePath);
  
            return {
              name,
              creationTime: stats.ctime.toISOString(), // Convert creation time to ISO format
            };
          });
  
        return response.ok({
          body: { reports: filteredReports },
        });
      } catch (error) {
        //console.error('Error fetching reports:', error);
        return response.customError({
          statusCode: error.statusCode || 500,
          body: `Error fetching reports: ${error.message || error}`,
        });
      }
    }
  );  

  // Route to download a specific report for the current tenant
  router.get(
    {
      path: '/api/custom_reports/download/{reportName}',
      validate: {
        params: (value, { ok, badRequest }) => {
          if (typeof value.reportName !== 'string') {
            return badRequest('Report name must be a string');
          }
          return ok(value);
        },
      },
    },
    async (context, request, response) => {
      const { reportName } = request.params as { reportName: string };

      try {
        // Fetch the logged-in user's info via OpenSearch security plugin
        const { body: authInfo } = await context.core.opensearch.client.asCurrentUser.transport.request({
          method: 'GET',
          path: '/_plugins/_security/authinfo',
        });

        // Extract the tenant name from the authInfo response
        const tenantName = authInfo.user_requested_tenant;

        // Ensure the report name includes the tenant's name (as a simple security check)
        if (!reportName.toLowerCase().includes(tenantName.toLowerCase())) {
          return response.forbidden({ body: 'You do not have permission to access this report' });
        }

        const filePath = path.join(REPORTS_DIRECTORY, reportName);

        if (!fs.existsSync(filePath)) {
          return response.notFound({ body: 'File not found' });
        }

        const fileStream = fs.createReadStream(filePath);
        return response.custom({
          statusCode: 200,
          body: fileStream,
          headers: {
            'Content-Disposition': `attachment; filename="${reportName}"`,
            'Content-Type': 'application/pdf',
          },
        });
      } catch (error) {
        //console.error('Error downloading report:', error);
        return response.customError({
          statusCode: error.statusCode || 500,
          body: `Error downloading report: ${error.message || error}`,
        });
      }
    }
  );
};